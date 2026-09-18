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
        showStatus("¡Mensaje enviado! Te responderé lo antes posible.");
        return;
      }

      if (!form.reportValidity) return; // very old browser: let native submit happen
      if (!form.reportValidity()) { e.preventDefault(); return; }

      e.preventDefault();
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando..."; }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("bad status " + res.status);
        form.reset();
        form.hidden = true;
        showStatus("¡Mensaje enviado! Te responderé lo antes posible.");
      }).catch(function () {
        // Network/CORS failure: fall back to a real native submit (leaves the page).
        form.submit();
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
      });
    });
  }

  // ---- Mixing & Mastering instant quote calculator ----
  var QUOTE_PRICING = {
    mixing:    { label: "Mezcla",                perSong: 50 },
    mastering: { label: "Masterización",         perSong: 30 },
    mixmaster: { label: "Mezcla + Masterización", perSong: 70 }
  };
  var QUOTE_RUSH_FLAT = 25;
  // Bulk (quantity) discounts, checked highest threshold first.
  var QUOTE_BULK_DISCOUNTS = [
    { minSongs: 10, percent: 20 },
    { minSongs: 5,  percent: 15 },
    { minSongs: 2,  percent: 10 }
  ];

  function quoteBulkDiscountPercent(songs) {
    for (var i = 0; i < QUOTE_BULK_DISCOUNTS.length; i++) {
      if (songs >= QUOTE_BULK_DISCOUNTS[i].minSongs) return QUOTE_BULK_DISCOUNTS[i].percent;
    }
    return 0;
  }

  function initQuoteCalculator() {
    var form = $("[data-quote-form]");
    if (!form) return;
    var serviceEl = $("[data-quote-service]", form);
    var songsEl = $("[data-quote-songs]", form);
    var stemsEl = $("[data-quote-stems]", form);
    var rushEl = $("[data-quote-rush]", form);
    var totalEl = $("[data-quote-total]", form);
    var breakdownEl = $("[data-quote-breakdown]", form);
    var savingsEl = $("[data-quote-savings]", form);
    var phoneEl = $("[data-quote-phone]", form);
    var sendBtn = $("[data-quote-send]", form);
    var igBtn = $("[data-quote-instagram]", form);
    var statusEl = $("[data-quote-status]", form);
    if (!serviceEl || !songsEl || !stemsEl || !rushEl || !totalEl) return;

    function currentQuote() {
      var service = QUOTE_PRICING[serviceEl.value] || QUOTE_PRICING.mixmaster;
      var songs = Math.max(1, Math.min(50, parseInt(songsEl.value, 10) || 1));
      var stemsSurcharge = parseInt(stemsEl.value, 10) || 0;
      var stemsLabel = stemsEl.options[stemsEl.selectedIndex] ? stemsEl.options[stemsEl.selectedIndex].text : "";
      var rush = rushEl.checked;
      var subtotal = (service.perSong + stemsSurcharge) * songs;
      var discountPercent = quoteBulkDiscountPercent(songs);
      var discountAmount = Math.round(subtotal * discountPercent / 100);
      var total = subtotal - discountAmount + (rush ? QUOTE_RUSH_FLAT : 0);
      return {
        service: service, songs: songs, stemsLabel: stemsLabel, rush: rush,
        discountPercent: discountPercent, discountAmount: discountAmount, total: total
      };
    }

    function render() {
      var q = currentQuote();
      totalEl.textContent = "$" + q.total;
      var parts = [q.songs + " " + (q.songs === 1 ? "canción" : "canciones"), q.service.label];
      if (q.discountPercent) parts.push(q.discountPercent + "% de descuento por cantidad");
      if (q.rush) parts.push("entrega urgente");
      breakdownEl.textContent = parts.join(" · ");
      if (savingsEl) {
        if (q.discountAmount > 0) {
          savingsEl.textContent = "Ahorras $" + q.discountAmount + " con el descuento por cantidad";
          savingsEl.hidden = false;
        } else {
          savingsEl.hidden = true;
          savingsEl.textContent = "";
        }
      }
    }

    function summaryText() {
      var q = currentQuote();
      var lines = [
        "Solicitud de presupuesto de Mezcla y Masterización",
        "Servicio: " + q.service.label,
        "Canciones: " + q.songs,
        "Pistas/stems: " + q.stemsLabel,
        "Entrega urgente: " + (q.rush ? "Sí" : "No")
      ];
      if (q.discountAmount > 0) lines.push("Descuento por cantidad: " + q.discountPercent + "% (-$" + q.discountAmount + ")");
      lines.push("Total estimado: $" + q.total);
      if (phoneEl) lines.splice(1, 0, "WhatsApp: " + phoneEl.value.trim());
      return lines.join("\n");
    }

    [serviceEl, songsEl, stemsEl, rushEl].forEach(function (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });
    render();

    if (sendBtn) {
      sendBtn.addEventListener("click", function () {
        if (form.reportValidity && !form.reportValidity()) return; // requires WhatsApp number
        var contactForm = $("[data-contact-form]");
        var messageEl = contactForm ? $("#contact-message", contactForm) : null;
        var nameEl = contactForm ? $("#contact-name", contactForm) : null;
        var target = $("#contacto");
        if (messageEl) messageEl.value = summaryText();
        if (target) {
          window.scrollTo({
            top: target.getBoundingClientRect().top + scrollY - 72,
            behavior: reduced ? "auto" : "smooth"
          });
        }
        if (nameEl) setTimeout(function () { nameEl.focus(); }, reduced ? 0 : 500);
      });
    }

    if (igBtn) {
      igBtn.addEventListener("click", function () {
        if (form.reportValidity && !form.reportValidity()) return; // requires WhatsApp number
        // Open synchronously (in direct response to the click) so popup blockers
        // don't treat it as an unsolicited window — an async clipboard wait first
        // breaks that "user gesture" chain in some browsers.
        var igUrl = (window.__BRAND__ && window.__BRAND__.instagramUrl) || "https://www.instagram.com/sizze1";
        window.open(igUrl, "_blank", "noopener");

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(summaryText()).then(function () {
            if (!statusEl) return;
            statusEl.textContent = "Presupuesto copiado — pégalo en tu DM de Instagram.";
            statusEl.hidden = false;
          }).catch(function () {});
        }
      });
    }
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
      if (btn) { btn.classList.remove("is-playing"); btn.setAttribute("aria-pressed", "false"); btn.setAttribute("aria-label", "Reproducir vista previa"); }
      if (icon) icon.textContent = "▶";
      if (mount) { mount.hidden = true; mount.innerHTML = ""; }
    }

    cards.forEach(function (card) {
      var btn = $("[data-beat-play]", card);
      var mount = $("[data-beat-player]", card);
      var icon = btn ? $(".beat-play-icon", btn) : null;
      if (!btn || !mount) return;
      var id = card.getAttribute("data-beat-id");
      var title = card.getAttribute("data-beat-title") || "vista previa del beat";

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
        iframe.title = "Reproductor de BeatStars — " + title;
        iframe.allow = "autoplay";
        mount.innerHTML = "";
        mount.appendChild(iframe);
        mount.hidden = false;

        btn.classList.add("is-playing");
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", "Cerrar vista previa");
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
    safe(initQuoteCalculator, "initQuoteCalculator");
    safe(initBeatPlayers, "initBeatPlayers");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
