/* =========================================================
   Solare Domotica — main.js
   ========================================================= */
(function(){
  "use strict";

  var WHATSAPP_NUMBER = "393513866250"; // +39 351 386 6250

  // Optional lead-capture webhook (abandoned-form recovery). Leave empty and
  // the feature quietly does nothing — the site works perfectly without it.
  // Set this to a Google Apps Script Web App URL to log every prospect who
  // starts the simulator (including those who don't finish) to a Google
  // Sheet you can open or export to CSV/TXT at any time. Full setup guide:
  // /LEAD-CAPTURE-SETUP.md
  var LEAD_WEBHOOK_URL = "";

  /* ---------- Lead capture (progressive + abandonment recovery) ---------- */
  function sendLead(status, data, useBeacon){
    if(!LEAD_WEBHOOK_URL) return; // not configured — no-op, see LEAD-CAPTURE-SETUP.md
    var payload = {
      status: status,                 // "in_progress" | "completed" | "abandoned"
      lang: currentLang,
      page: location.pathname,
      when: new Date().toISOString(),
      type: data.type || "",
      equip: data.equip || "",
      city: data.city || "",
      message: data.message || "",
      firstname: data.firstname || "",
      phone: data.phone || "",
      step: data.step || "",
      totalSteps: data.totalSteps || ""
    };
    try{
      var body = JSON.stringify(payload);
      if(useBeacon && navigator.sendBeacon){
        navigator.sendBeacon(LEAD_WEBHOOK_URL, new Blob([body], { type: "text/plain;charset=UTF-8" }));
      } else {
        fetch(LEAD_WEBHOOK_URL, { method: "POST", mode: "no-cors", keepalive: true, body: body });
      }
    }catch(e){ /* never let lead tracking break the site */ }
  }

  /* ---------- i18n engine ---------- */
  function detectLang(){
    var saved = null;
    try{ saved = localStorage.getItem("solaris_lang"); }catch(e){}
    if(saved === "fr" || saved === "en" || saved === "it") return saved;
    var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || navigator.userLanguage || "fr"];
    for(var i=0; i<langs.length; i++){
      var l = (langs[i] || "").toLowerCase();
      if(l.indexOf("fr") === 0) return "fr";
      if(l.indexOf("it") === 0) return "it";
      if(l.indexOf("en") === 0) return "en";
    }
    return "en";
  }

  var currentLang = detectLang();

  function t(key){
    var dict = window.SOLARIS_I18N[currentLang] || {};
    return (key in dict) ? dict[key] : (window.SOLARIS_I18N.fr[key] || key);
  }

  function applyI18n(){
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el){
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function(el){
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    var titleKey = document.body.getAttribute("data-page-title") || "meta.title";
    var descKey = document.body.getAttribute("data-page-desc") || "meta.desc";
    document.title = t(titleKey);
    var metaDesc = document.querySelector('meta[name="description"]');
    if(metaDesc) metaDesc.setAttribute("content", t(descKey));

    document.querySelectorAll(".lang-switch button").forEach(function(btn){
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === currentLang);
    });
  }

  function setLang(lang){
    currentLang = lang;
    try{ localStorage.setItem("solaris_lang", lang); }catch(e){}
    applyI18n();
    if(window.SOLARIS_SIM && window.SOLARIS_SIM.refresh) window.SOLARIS_SIM.refresh();
  }

  document.addEventListener("click", function(e){
    var btn = e.target.closest("[data-lang]");
    if(btn){ setLang(btn.getAttribute("data-lang")); }
  });

  /* ---------- Mobile nav ---------- */
  function initMobileNav(){
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    var close = document.querySelector(".mobile-nav-top button");
    if(!toggle || !nav) return;
    function open(){ nav.classList.add("is-open"); document.body.style.overflow = "hidden"; }
    function shut(){ nav.classList.remove("is-open"); document.body.style.overflow = ""; }
    toggle.addEventListener("click", open);
    if(close) close.addEventListener("click", shut);
    nav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", shut); });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq(){
    document.querySelectorAll(".faq-item").forEach(function(item){
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if(!q || !a) return;
      q.addEventListener("click", function(){
        var isOpen = item.classList.contains("is-open");
        item.parentNode.querySelectorAll(".faq-item").forEach(function(other){
          other.classList.remove("is-open");
          other.querySelector(".faq-a").style.maxHeight = null;
        });
        if(!isOpen){
          item.classList.add("is-open");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------- Cookie banner ---------- */
  /* Compliance note: auto-hiding the banner is NEVER treated as consent.
     Only an explicit tap on "accept" records consent. If the banner is
     auto-hidden or dismissed without a choice, no value is stored, so the
     banner reappears next visit and no non-essential cookie is enabled.
     A persistent reopen button lets the visitor decide at any time. */
  function initCookieBar(){
    var bar = document.querySelector(".cookie-bar");
    var reopen = document.querySelector(".cookie-reopen");
    if(!bar) return;
    var consent = null;
    try{ consent = localStorage.getItem("solaris_cookie_consent"); }catch(e){}

    var autoHideTimer = null;

    function show(){
      bar.classList.add("is-visible");
      requestAnimationFrame(function(){ bar.classList.add("is-shown"); });
      autoHideTimer = setTimeout(dismiss, 8000);
    }
    function dismiss(){
      bar.classList.remove("is-shown");
      setTimeout(function(){ bar.classList.remove("is-visible"); }, 300);
      if(reopen) reopen.classList.add("is-visible");
      if(autoHideTimer){ clearTimeout(autoHideTimer); autoHideTimer = null; }
    }

    if(!consent){
      setTimeout(show, 600);
    } else if(reopen){
      reopen.classList.add("is-visible");
    }

    bar.querySelectorAll("[data-cookie]").forEach(function(btn){
      btn.addEventListener("click", function(){
        try{ localStorage.setItem("solaris_cookie_consent", btn.getAttribute("data-cookie")); }catch(e){}
        dismiss();
      });
    });

    if(reopen){
      reopen.addEventListener("click", function(){
        reopen.classList.remove("is-visible");
        show();
      });
    }
  }

  /* ---------- WhatsApp helper ---------- */
  function waLink(message){
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }
  function isMobileUA(){
    // User-Agent strings are increasingly trimmed by browsers (Chrome's
    // "UA reduction"), so UA sniffing alone can miss real mobile devices.
    // Back it up with touch + coarse-pointer + viewport-width signals.
    var uaMatch = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    var uaDataMobile = !!(navigator.userAgentData && navigator.userAgentData.mobile);
    var touchCapable = (navigator.maxTouchPoints || 0) > 0 ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    var narrowViewport = window.innerWidth <= 820;
    return uaMatch || uaDataMobile || (touchCapable && narrowViewport);
  }
  // On mobile, a new-tab window.open() often just opens a silent background
  // tab instead of handing off to the WhatsApp app — navigating the current
  // tab is what reliably triggers the OS-level app link. On desktop there is
  // no app to hand off to, so a new tab (WhatsApp Web) is the better choice,
  // since it keeps the site open behind it.
  function openWhatsApp(url){
    if(isMobileUA()){
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener");
    }
  }

  function initWhatsAppCtas(){
    document.querySelectorAll("[data-wa-cta]").forEach(function(el){
      var msgKey = el.getAttribute("data-wa-cta");
      var messages = {
        fr: "Bonjour Solare Domotica, je souhaite être contacté au sujet d'un projet (" + (msgKey || "site web") + ").",
        en: "Hello Solare Domotica, I'd like to be contacted about a project (" + (msgKey || "website") + ").",
        it: "Ciao Solare Domotica, vorrei essere contattato per un progetto (" + (msgKey || "sito web") + ")."
      };
      el.setAttribute("href", "#");
      el.addEventListener("click", function(ev){
        ev.preventDefault();
        openWhatsApp(waLink(messages[currentLang] || messages.fr));
      });
    });
    document.querySelectorAll("[data-wa-call]").forEach(function(el){
      var messages = {
        fr: "Bonjour Solare Domotica, je souhaite parler à un expert.",
        en: "Hello Solare Domotica, I'd like to talk to an expert.",
        it: "Ciao Solare Domotica, vorrei parlare con un esperto."
      };
      el.setAttribute("href", "#");
      el.addEventListener("click", function(ev){
        ev.preventDefault();
        openWhatsApp(waLink(messages[currentLang] || messages.fr));
      });
    });
  }

  /* ---------- Objective cards -> jump to simulator ---------- */
  function initObjectiveCards(){
    document.querySelectorAll("[data-sim-type]").forEach(function(card){
      card.addEventListener("click", function(){
        var kind = card.getAttribute("data-sim-type");
        var sim = document.getElementById("simulateur");
        if(!sim) return;
        if(window.SOLARIS_SIM){
          window.SOLARIS_SIM.presetType(kind);
        }
        sim.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- Simulator ---------- */
  function initSimulator(){
    var root = document.querySelector(".simulator");
    if(!root) return;

    var steps = Array.prototype.slice.call(root.querySelectorAll(".sim-step"));
    var progressItems = Array.prototype.slice.call(root.querySelectorAll(".sim-progress i"));
    var successPanel = root.querySelector(".sim-success");
    var backBtn = root.querySelector(".sim-back");
    var nextBtn = root.querySelector(".sim-next");
    var current = 0;
    var autoAdvanceTimer = null;
    var started = false;
    var completed = false;
    var LAST = steps.length - 1;

    // Language-neutral keys are stored (type: villa|business|yacht|remote|other,
    // equip: array of cam|alarm|solar|alerts|auto|unsure); display text is
    // resolved in the *current* language when building the recap / message.
    var state = { type: null, equip: [], city: "", message: "", firstname: "", phone: "" };

    var VALUE_LABELS = {
      type:  { villa: "sim.s1.o1", business: "sim.s1.o2", yacht: "sim.s1.o3", remote: "sim.s1.o4", other: "sim.s1.o5" },
      equip: { cam: "sim.s2.o1", alarm: "sim.s2.o2", solar: "sim.s2.o3", alerts: "sim.s2.o4", auto: "sim.s2.o5", unsure: "sim.s2.o6" }
    };
    function displayType(){ var k = VALUE_LABELS.type[state.type]; return k ? t(k) : "—"; }
    function displayEquip(){
      if(!state.equip.length) return "—";
      return state.equip.map(function(k){ return VALUE_LABELS.equip[k] ? t(VALUE_LABELS.equip[k]) : k; }).join(", ");
    }

    function updateProgress(){
      progressItems.forEach(function(el, i){
        el.classList.toggle("is-done", i < current);
        el.classList.toggle("is-active", i === current);
      });
    }

    function nextLabel(){ return current === LAST ? t("sim.s4.cta") : t("sim.nav.next"); }

    function showStep(i){
      steps.forEach(function(s, idx){ s.classList.toggle("is-active", idx === i); });
      current = i;
      updateProgress();
      backBtn.disabled = (i === 0);
      nextBtn.textContent = nextLabel();
      root.querySelector(".sim-nav").style.display = "flex";
    }

    function canAdvance(i){
      if(i === 0) return !!state.type;
      if(i === 1) return state.equip.length > 0;
      if(i === 2) return state.city.length > 1;
      if(i === 3) return !!(state.firstname && state.phone.replace(/\D/g, "").length >= 6);
      return true;
    }

    function shake(){
      var activeStep = root.querySelector(".sim-step.is-active");
      if(!activeStep) return;
      activeStep.classList.remove("shake");
      void activeStep.offsetWidth;
      activeStep.classList.add("shake");
    }

    function advance(){
      if(!canAdvance(current)){ shake(); return; }
      if(current === LAST){ submit(); return; }
      showStep(current + 1);
      sendLead("in_progress", snapshotState());
    }

    function setChoiceUI(choice, on){
      choice.classList.toggle("is-selected", on);
      choice.setAttribute("aria-checked", on ? "true" : "false");
    }

    function selectChoice(choice, opts){
      var group = choice.closest(".choice-grid");
      var field = group.getAttribute("data-field");
      var value = choice.getAttribute("data-value");
      started = true;

      if(group.hasAttribute("data-multi")){
        // Multi-select: toggle; "unsure" is exclusive of every other option.
        var on = !choice.classList.contains("is-selected");
        if(on && value === "unsure"){
          group.querySelectorAll(".choice").forEach(function(c){ setChoiceUI(c, c === choice); });
        } else {
          setChoiceUI(choice, on);
          if(on){
            var u = group.querySelector('.choice[data-value="unsure"]');
            if(u) setChoiceUI(u, false);
          }
        }
        state[field] = Array.prototype.map.call(group.querySelectorAll(".choice.is-selected"), function(c){
          return c.getAttribute("data-value");
        });
        return; // multi-select never auto-advances: the visitor taps Continue
      }

      group.querySelectorAll(".choice").forEach(function(c){ setChoiceUI(c, c === choice); });
      state[field] = value;
      if(!(opts && opts.silent)){
        window.clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = window.setTimeout(advance, 380); // let the selection be seen before advancing
      }
    }

    root.querySelectorAll(".choice").forEach(function(choice){
      choice.addEventListener("click", function(){ selectChoice(choice); });
      choice.addEventListener("keydown", function(e){
        if(e.key === "Enter" || e.key === " " || e.key === "Spacebar"){
          e.preventDefault();
          selectChoice(choice);
        }
      });
    });

    root.querySelectorAll("[data-field]").forEach(function(input){
      if(input.tagName !== "INPUT" && input.tagName !== "TEXTAREA") return;
      input.addEventListener("input", function(){
        state[input.getAttribute("data-field")] = input.value.trim();
        started = true;
      });
      input.addEventListener("keydown", function(e){
        if(e.key === "Enter" && input.tagName === "INPUT"){ e.preventDefault(); advance(); }
      });
    });

    function buildRecap(){
      var recap = root.querySelector(".recap");
      if(!recap) return;
      // DOM methods (not innerHTML): free text is always treated as plain text.
      recap.textContent = "";
      var rows = [
        [t("sim.recap.type"), displayType()],
        [t("sim.recap.equip"), displayEquip()],
        [t("sim.recap.city"), state.city || "—"]
      ];
      if(state.message) rows.push([t("sim.recap.msg"), state.message]);
      rows.push([t("sim.recap.name"), state.firstname || "—"], [t("sim.recap.phone"), state.phone || "—"]);
      rows.forEach(function(pair){
        var row = document.createElement("div");
        var b = document.createElement("b");
        b.textContent = pair[0] + ":";
        row.appendChild(b);
        row.appendChild(document.createTextNode(" " + pair[1]));
        recap.appendChild(row);
      });
    }

    // "Première orientation": honest, qualitative — no price, no savings promise.
    function buildPack(){
      var list = root.querySelector(".pack-list");
      if(!list) return;
      list.textContent = "";
      var keys = ["sim.pack." + (state.type || "other")];
      ["solar", "alerts", "auto"].forEach(function(k){
        if(state.equip.indexOf(k) !== -1) keys.push("sim.pack." + k);
      });
      keys.forEach(function(k){
        var li = document.createElement("li");
        li.textContent = t(k);
        list.appendChild(li);
      });
    }

    function buildWaMessage(){
      var T = {
        fr: ["Bonjour Solare Domotica, voici ma demande d'étude :", "Projet : ", "Équipements : ", "Zone : ", "Précision : ", "Nom : ", "Téléphone : ", "Je peux envoyer des photos du lieu ici."],
        en: ["Hello Solare Domotica, here is my study request:", "Project: ", "Equipment: ", "Area: ", "Note: ", "Name: ", "Phone: ", "I can send photos of the place here."],
        it: ["Ciao Solare Domotica, ecco la mia richiesta di studio:", "Progetto: ", "Dotazioni: ", "Zona: ", "Nota: ", "Nome: ", "Telefono: ", "Posso inviare qui le foto del luogo."]
      };
      var m = T[currentLang] || T.fr;
      var lines = [m[0], m[1] + displayType(), m[2] + displayEquip(), m[3] + (state.city || "—")];
      if(state.message) lines.push(m[4] + state.message);
      lines.push(m[5] + (state.firstname || "—"), m[6] + (state.phone || "—"), m[7]);
      return lines.join("\n");
    }

    function snapshotState(){
      var s = {};
      for(var k in state){ s[k] = state[k]; }
      s.equip = state.equip.join(",");
      s.step = current + 1;
      s.totalSteps = steps.length;
      return s;
    }

    function submit(){
      buildRecap();
      buildPack();
      steps.forEach(function(s){ s.classList.remove("is-active"); });
      root.querySelector(".sim-nav").style.display = "none";
      root.querySelector(".sim-progress").style.display = "none";
      successPanel.classList.add("is-active");
      completed = true;
      sendLead("completed", snapshotState());

      // Show the pre-study first, then hand off to WhatsApp automatically.
      // Desktop: new tab (WhatsApp Web). Mobile: navigate the current tab so
      // the OS opens the WhatsApp app reliably, after a pause long enough to
      // read the first orientation.
      var waUrl = waLink(buildWaMessage());
      if(isMobileUA()){
        window.setTimeout(function(){ window.location.href = waUrl; }, 2200);
      } else {
        window.open(waUrl, "_blank", "noopener");
      }

      var waBtn = successPanel.querySelector("[data-wa-submit]");
      if(waBtn){
        waBtn.onclick = function(){ openWhatsApp(waLink(buildWaMessage())); };
      }
    }

    nextBtn.addEventListener("click", advance);
    backBtn.addEventListener("click", function(){ if(current > 0) showStep(current - 1); });

    var retryBtn = successPanel.querySelector("[data-sim-retry]");
    if(retryBtn){
      retryBtn.addEventListener("click", function(){
        successPanel.classList.remove("is-active");
        root.querySelector(".sim-progress").style.display = "flex";
        completed = false;
        showStep(0);
      });
    }

    // Abandoned form: last snapshot via sendBeacon when the visitor leaves.
    function handleLeaveIfAbandoned(){
      if(started && !completed){ sendLead("abandoned", snapshotState(), true); }
    }
    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState === "hidden") handleLeaveIfAbandoned();
    });
    window.addEventListener("pagehide", handleLeaveIfAbandoned);

    function presetType(key){
      var choice = steps[0].querySelector('.choice[data-value="' + key + '"]');
      if(!choice) return false;
      selectChoice(choice, { silent: true });
      showStep(1); // type already known → go straight to equipment
      return true;
    }

    window.SOLARIS_SIM = {
      presetType: presetType,
      refresh: function(){
        updateProgress();
        nextBtn.textContent = nextLabel();
        if(successPanel.classList.contains("is-active")){ buildRecap(); buildPack(); }
      }
    };

    showStep(0);

    // Deep link from other pages: index.html?projet=yacht#simulateur
    try {
      var wanted = new URLSearchParams(window.location.search).get("projet");
      if(wanted){ presetType(wanted); started = false; }
    } catch(e){}
  }

  /* ---------- Active nav link on scroll (best-effort, light) ---------- */
  function initActiveNav(){
    var links = document.querySelectorAll(".main-nav a[href^='#']");
    if(!links.length) return;
    var sections = Array.prototype.map.call(links, function(a){
      return document.querySelector(a.getAttribute("href"));
    }).filter(Boolean);
    if(!sections.length) return;
    var onScroll = function(){
      var pos = window.scrollY + 120;
      var activeIdx = 0;
      sections.forEach(function(sec, i){ if(sec.offsetTop <= pos) activeIdx = i; });
      links.forEach(function(a, i){ a.classList.toggle("is-active", i === activeIdx); });
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Intro carousel (hero / objectif / positionnement) ---------- */
  function initCarousel(){
    var section = document.querySelector(".intro-carousel");
    var track = document.querySelector(".carousel-track");
    if(!track || !section) return;
    var slides = Array.prototype.slice.call(track.querySelectorAll(".carousel-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".carousel-dot"));
    var prevBtn = document.querySelector(".carousel-arrow--prev");
    var nextBtn = document.querySelector(".carousel-arrow--next");
    var hint = document.querySelector(".carousel-hint");
    if(!slides.length) return;

    var AUTOPLAY_MS = 2200;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var inView = false;
    var userInteracted = false;
    var timer = null;

    function activeIndex(){
      var w = track.clientWidth || 1;
      var i = Math.round(track.scrollLeft / w);
      return Math.max(0, Math.min(slides.length - 1, i)); // guard against rounding drift
    }
    function update(){
      var idx = activeIndex();
      dots.forEach(function(d,i){ d.classList.toggle("is-active", i === idx); });
      if(prevBtn) prevBtn.classList.toggle("is-disabled", idx === 0);
      if(nextBtn) nextBtn.classList.toggle("is-disabled", idx === slides.length - 1);
    }
    function goTo(i, silent){
      i = ((i % slides.length) + slides.length) % slides.length; // wrap around, loop
      track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
      if(!silent) hideHint();
    }
    function hideHint(){
      if(hint && !userInteracted){
        userInteracted = true;
        hint.classList.add("is-hidden");
      }
    }

    function stopAutoplay(){
      if(timer){ clearTimeout(timer); timer = null; }
    }
    function startAutoplay(){
      stopAutoplay();
      if(reduceMotion) return; // respect vestibular/motion preferences
      var currentSlide = slides[activeIndex()];
      var duration = (currentSlide && parseInt(currentSlide.getAttribute("data-duration"), 10)) || AUTOPLAY_MS;
      timer = setTimeout(function(){
        if(inView && document.visibilityState === "visible"){
          goTo(activeIndex() + 1, true);
        }
        startAutoplay(); // reschedule using whichever slide is now active
      }, duration);
    }

    var ticking = false;
    var settleTimer = null;
    track.addEventListener("scroll", function(){
      if(!ticking){
        window.requestAnimationFrame(function(){ update(); ticking = false; });
        ticking = true;
      }
      // Once the swipe/scroll settles on a slide, restart autoplay so the
      // delay always matches whichever slide the visitor actually landed on.
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(function(){ if(inView) startAutoplay(); }, 160);
    }, { passive: true });

    dots.forEach(function(d, i){ d.addEventListener("click", function(){ goTo(i); }); });
    if(prevBtn) prevBtn.addEventListener("click", function(){ goTo(activeIndex() - 1); });
    if(nextBtn) nextBtn.addEventListener("click", function(){ goTo(activeIndex() + 1); });
    track.addEventListener("pointerdown", hideHint, { passive: true });
    track.addEventListener("touchstart", hideHint, { passive: true });
    window.addEventListener("resize", function(){ goTo(activeIndex(), true); });
    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState === "visible" && inView) startAutoplay(); else stopAutoplay();
    });

    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          inView = entry.isIntersecting;
          if(inView) startAutoplay(); else stopAutoplay();
        });
      }, { threshold: 0.4 });
      io.observe(section);
    } else {
      inView = true;
      startAutoplay();
    }

    update();
  }

  /* ---------- Solare Domotica Connect — fast 2-step conversion form ---------- */
  function initConnectForm(){
    var root = document.querySelector(".fast-form");
    if(!root) return;

    var steps = Array.prototype.slice.call(root.querySelectorAll(".sim-step"));
    var progressItems = Array.prototype.slice.call(root.querySelectorAll(".sim-progress i"));
    var successPanel = root.querySelector(".sim-success");
    var backBtn = root.querySelector(".sim-back");
    var nextBtn = root.querySelector(".sim-next");
    var current = 0;
    var autoAdvanceTimer = null;
    var started = false;
    var completed = false;

    var state = { target: null, firstname: "", phone: "" };

    var TARGET_LABELS = { home: "connect.form.s1.o1", car: "connect.form.s1.o2", office: "connect.form.s1.o3", all: "connect.form.s1.o4" };
    function displayTarget(){
      return state.target && TARGET_LABELS[state.target] ? t(TARGET_LABELS[state.target]) : "—";
    }

    function updateProgress(){
      progressItems.forEach(function(el, i){
        el.classList.toggle("is-done", i < current);
        el.classList.toggle("is-active", i === current);
      });
    }
    function showStep(i){
      steps.forEach(function(s, idx){ s.classList.toggle("is-active", idx === i); });
      current = i;
      updateProgress();
      backBtn.disabled = (i === 0);
      nextBtn.textContent = (i === steps.length - 1) ? t("connect.form.cta") : t("sim.nav.next");
    }
    function canAdvance(i){
      if(i === 0) return !!state.target;
      if(i === 1) return !!(state.firstname && state.phone);
      return true;
    }
    function advance(){
      if(!canAdvance(current)){
        var activeStep = root.querySelectorAll(".sim-step.is-active")[0];
        activeStep.classList.remove("shake");
        void activeStep.offsetWidth;
        activeStep.classList.add("shake");
        return;
      }
      if(current === steps.length - 1){ submit(); return; }
      showStep(current + 1);
    }
    function selectChoice(choice){
      var group = choice.closest(".choice-grid");
      var field = group.getAttribute("data-field");
      group.querySelectorAll(".choice").forEach(function(c){ c.classList.remove("is-selected"); c.setAttribute("aria-checked","false"); });
      choice.classList.add("is-selected");
      choice.setAttribute("aria-checked","true");
      state[field] = choice.getAttribute("data-value");
      started = true;
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = window.setTimeout(advance, 380);
    }
    root.querySelectorAll(".choice").forEach(function(choice){
      choice.addEventListener("click", function(){ selectChoice(choice); });
      choice.addEventListener("keydown", function(e){
        if(e.key === "Enter" || e.key === " " || e.key === "Spacebar"){ e.preventDefault(); selectChoice(choice); }
      });
    });
    root.querySelectorAll("input[data-field]").forEach(function(input){
      input.addEventListener("input", function(){
        state[input.getAttribute("data-field")] = input.value.trim();
        started = true;
      });
    });

    function buildMessage(){
      var templates = {
        fr: [
          "Bonjour Solare Domotica, je souhaite activer Solare Domotica Connect :",
          "Je veux connecter : " + displayTarget(),
          "Prénom : " + (state.firstname || "—"),
          "Téléphone : " + (state.phone || "—")
        ],
        en: [
          "Hello Solare Domotica, I'd like to activate Solare Domotica Connect:",
          "I want to connect: " + displayTarget(),
          "First name: " + (state.firstname || "—"),
          "Phone: " + (state.phone || "—")
        ],
        it: [
          "Ciao Solare Domotica, vorrei attivare Solare Domotica Connect:",
          "Voglio collegare: " + displayTarget(),
          "Nome: " + (state.firstname || "—"),
          "Telefono: " + (state.phone || "—")
        ]
      };
      return (templates[currentLang] || templates.fr).join("\n");
    }
    function snapshotState(){
      return { type: "connect", equip: state.target || "", city: "", message: "",
        firstname: state.firstname, phone: state.phone,
        step: current + 1, totalSteps: steps.length };
    }

    function submit(){
      steps.forEach(function(s){ s.classList.remove("is-active"); });
      root.querySelector(".sim-nav").style.display = "none";
      root.querySelector(".sim-progress").style.display = "none";
      successPanel.classList.add("is-active");
      completed = true;
      sendLead("completed", snapshotState());

      var waUrl = waLink(buildMessage());
      if(isMobileUA()){
        window.setTimeout(function(){ window.location.href = waUrl; }, 900);
      } else {
        window.open(waUrl, "_blank", "noopener");
      }
    }

    nextBtn.addEventListener("click", advance);
    backBtn.addEventListener("click", function(){ if(current > 0) showStep(current - 1); });

    function handleLeaveIfAbandoned(){
      if(started && !completed) sendLead("abandoned", snapshotState(), true);
    }
    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState === "hidden") handleLeaveIfAbandoned();
    });
    window.addEventListener("pagehide", handleLeaveIfAbandoned);

    showStep(0);
  }

  document.addEventListener("DOMContentLoaded", function(){
    applyI18n();
    initMobileNav();
    initFaq();
    initCookieBar();
    initWhatsAppCtas();
    initObjectiveCards();
    initSimulator();
    initConnectForm();
    initActiveNav();
    initCarousel();
  });
})();
