(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  // ---- Scroll reveal (functional fade-in, always runs) ----
  function initReveals() {
    var targets = $$("[data-reveal], .reveal");
    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });

    targets.forEach(function (el) { io.observe(el); });

    // Safety net: force-reveal anything still hidden after 6s
    setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  // ---- Nav border strengthens on scroll (subtle, non-intrusive) ----
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    function onScroll() {
      if (scrollY > 8) nav.style.boxShadow = "0 1px 0 var(--ink)";
      else nav.style.boxShadow = "none";
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- Anchor smooth-scroll with nav offset ----
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navH = 72;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - navH,
        behavior: reduced ? "auto" : "smooth"
      });
      closeMobileNav();
    });
  }

  // ---- Mobile nav toggle ----
  var mobileNavLinks, mobileNavToggle;
  function closeMobileNav() {
    if (!mobileNavLinks || !mobileNavToggle) return;
    mobileNavLinks.classList.remove("is-open");
    mobileNavToggle.setAttribute("aria-expanded", "false");
  }
  function initMobileNav() {
    mobileNavToggle = $("[data-nav-toggle]");
    mobileNavLinks = $("[data-nav-links]");
    if (!mobileNavToggle || !mobileNavLinks) return;
    mobileNavToggle.addEventListener("click", function () {
      var isOpen = mobileNavLinks.classList.toggle("is-open");
      mobileNavToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    matchMedia("(min-width: 720px)").addEventListener("change", closeMobileNav);
  }

  // ---- Contact form (progressive enhancement over a plain POST to FormSubmit) ----
  function initContactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    var status = form.parentElement ? $("[data-form-status]", form.parentElement) : null;
    var submitBtn = $('button[type="submit"]', form);
    var submitLabel = submitBtn ? submitBtn.textContent : "";

    function showStatus(text) {
      if (!status) return;
      status.textContent = text;
      status.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      // Honeypot: if a bot filled the hidden field, silently drop (still looks like success)
      var honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) {
        e.preventDefault();
        form.reset();
        form.hidden = true;
        showStatus("Message sent! I'll get back to you as soon as possible.");
        return;
      }

      if (!form.reportValidity) return; // very old browser: let native submit happen
      if (!form.reportValidity()) { e.preventDefault(); return; }

      e.preventDefault();
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending..."; }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("bad status " + res.status);
        form.reset();
        form.hidden = true;
        showStatus("Message sent! I'll get back to you as soon as possible.");
      }).catch(function () {
        // Network/CORS failure: fall back to a real native submit (leaves the page).
        form.submit();
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
      });
    });
  }

  // ---- Inline beat previews (BeatStars embed player, lazy-loaded on click) ----
  function initBeatPlayers() {
    var cards = $$("[data-beat-id]");
    if (!cards.length) return;
    var current = null;

    function closeCard(card) {
      var btn = $("[data-beat-play]", card);
      var icon = btn ? $(".beat-play-icon", btn) : null;
      var mount = $("[data-beat-player]", card);
      if (btn) { btn.classList.remove("is-playing"); btn.setAttribute("aria-pressed", "false"); btn.setAttribute("aria-label", "Play preview"); }
      if (icon) icon.textContent = "▶";
      if (mount) { mount.hidden = true; mount.innerHTML = ""; }
    }

    cards.forEach(function (card) {
      var btn = $("[data-beat-play]", card);
      var mount = $("[data-beat-player]", card);
      var icon = btn ? $(".beat-play-icon", btn) : null;
      if (!btn || !mount) return;
      var id = card.getAttribute("data-beat-id");
      var title = card.getAttribute("data-beat-title") || "beat preview";

      btn.addEventListener("click", function () {
        var wasOpen = card === current;
        if (current && current !== card) closeCard(current);

        if (wasOpen) {
          closeCard(card);
          current = null;
          return;
        }

        var iframe = document.createElement("iframe");
        iframe.src = "https://www.beatstars.com/embed/track/?id=" + encodeURIComponent(id);
        iframe.width = "100%";
        iframe.height = "140";
        iframe.style.border = "none";
        iframe.loading = "lazy";
        iframe.title = "BeatStars player — " + title;
        iframe.allow = "autoplay";
        mount.innerHTML = "";
        mount.appendChild(iframe);
        mount.hidden = false;

        btn.classList.add("is-playing");
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", "Close preview");
        if (icon) icon.textContent = "✕";
        current = card;
      });
    });
  }

  function boot() {
    safe(initReveals, "initReveals");
    safe(initNav, "initNav");
    safe(initMobileNav, "initMobileNav");
    safe(initAnchors, "initAnchors");
    safe(initContactForm, "initContactForm");
    safe(initBeatPlayers, "initBeatPlayers");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
