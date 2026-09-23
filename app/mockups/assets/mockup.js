/* Voice Agent — static mockups. Shared behaviour (no build step, works from file://).
   Every page: <script src="assets/icons.js"></script><script src="assets/mockup.js"></script> at the end of <body>.

   Page hooks
   <body data-nav="agents" data-crumbs='[["Agents","agents.html"],["Lead Follow-up Agent"]]'>   (omit data-nav on auth pages)
   <i data-icon="phone"></i>                       inline lucide icon (class ic-sm / ic-lg optional via data-size="sm|lg")
   [data-tabs] > [data-tab="id"] + [data-panel="id"]   tab groups (first tab active unless .active is set)
   [data-open="modalId"] / [data-close]             modals (.modal-backdrop#modalId)
   [data-menu="menuId"]                             toggles .menu#menuId (place both inside a .pos-rel)
   [data-wizard] with .step-panel[data-step], .stepper .st[data-go], [data-next], [data-prev]
   tr[data-href] / [data-href]                      whole-row navigation
   .play[data-wave="#id"]                           play/pause animation on a .wave
   [data-toast="message"]                           click shows a toast
   [data-copy="text"]                               click copies + toast
   [data-toggle="#id"]                              toggles [hidden] on target
   input[data-reveal] + button[data-reveal-btn]     show/hide password
*/
(function () {
  var ICONS = window.MOCK_ICONS || {};

  function icon(name, size) {
    var body = ICONS[name] || ICONS["circle"] || "";
    var cls = "ic" + (size ? " ic-" + size : "");
    return '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + body + "</svg>";
  }
  window.mockIcon = icon;

  function hydrateIcons(root) {
    (root || document).querySelectorAll("i[data-icon]").forEach(function (el) {
      if (el.firstChild) return;
      el.innerHTML = icon(el.getAttribute("data-icon"), el.getAttribute("data-size"));
    });
  }

  /* ---------- Shell ---------- */
  var NAV = [
    ["dashboard", "Dashboard", "dashboard.html", "layout-dashboard"],
    ["agents", "Agents", "agents.html", "bot"],
    ["calls", "Calls", "calls.html", "phone-call"],
    ["knowledge", "Knowledge", "knowledge.html", "book-open"],
    ["integrations", "Integrations", "integrations.html", "plug"],
    ["phone-numbers", "Phone Numbers", "phone-numbers.html", "phone"],
    ["analytics", "Analytics", "analytics.html", "chart-column"],
  ];

  function buildShell() {
    var body = document.body;
    var active = body.getAttribute("data-nav");
    if (!active) return;
    var content = document.getElementById("content");
    if (!content) return;

    var crumbs = [];
    try { crumbs = JSON.parse(body.getAttribute("data-crumbs") || "[]"); } catch (e) {}
    var crumbHtml = crumbs.map(function (c, i) {
      var last = i === crumbs.length - 1;
      var node = last || !c[1] ? '<span class="here">' + c[0] + "</span>" : '<a href="' + c[1] + '">' + c[0] + "</a>";
      return (i ? '<span class="sep">/</span>' : "") + node;
    }).join("");

    var nav = NAV.map(function (n) {
      return '<a href="' + n[2] + '" class="' + (n[0] === active ? "active" : "") + '">' + icon(n[3]) + "<span>" + n[1] + "</span>" +
        (n[0] === "agents" ? '<span class="badge plain b-soft" style="margin-left:auto;padding:1px 8px;">5</span>' : "") + "</a>";
    }).join("");

    var shell =
      '<div class="app">' +
      '<aside class="sidebar" id="sidebar">' +
        '<a class="brand" href="dashboard.html"><span class="brand-orb"></span><span class="brand-name">Voice Agent</span></a>' +
        '<nav class="nav" aria-label="Primary">' + nav + "</nav>" +
        '<div class="sidebar-foot">' +
          '<nav class="nav" style="padding:0 0 8px;flex:none;overflow:visible"><a href="settings-organization.html" class="' + (active === "settings" ? "active" : "") + '">' + icon("settings") + "<span>Settings</span></a></nav>" +
          '<div class="menu" id="accountMenu" style="bottom:calc(100% - 8px);left:12px;right:12px;">' +
            '<div class="menu-label eyebrow">Signed in as</div>' +
            '<a href="settings-account.html">' + icon("user") + 'Account</a>' +
            '<a href="settings-security.html">' + icon("shield-check") + 'Security</a>' +
            '<a href="settings-team.html">' + icon("users") + 'Team</a>' +
            '<hr><a href="login.html" class="danger">' + icon("log-out") + 'Log out</a>' +
          "</div>" +
          '<button class="account-btn" data-menu="accountMenu" type="button"><span class="avatar a-lavender">PR</span>' +
            '<span class="who"><b>Petros Rodinos</b><span>Aegean Homes · Owner</span></span>' + icon("chevron-up", "sm") + "</button>" +
        "</div>" +
      "</aside>" +
      '<div class="scrim" id="scrim"></div>' +
      '<div class="main">' +
        '<header class="topbar">' +
          '<button class="icon-btn menu-toggle" id="menuToggle" aria-label="Open menu">' + icon("menu") + "</button>" +
          '<div class="crumbs">' + crumbHtml + "</div>" +
          '<div class="spacer"></div>' +
          '<div class="search" role="search">' + icon("search", "sm") + '<span>Search agents, calls…</span><kbd>Ctrl K</kbd></div>' +
          '<a class="icon-btn" href="alerts.html" aria-label="Alerts, 3 open" title="3 open alerts">' + icon("bell") + '<span class="pip"></span></a>' +
          '<a class="btn btn-primary hide-sm" href="agent-new.html">' + icon("plus", "sm") + "New agent</a>" +
        "</header>" +
        '<main class="page" id="main"></main>' +
      "</div></div>";

    var holder = document.createElement("div");
    holder.innerHTML = shell;
    var app = holder.firstChild;
    var main = app.querySelector("#main");
    while (content.firstChild) main.appendChild(content.firstChild);
    var overlays = document.querySelectorAll("body > .modal-backdrop");
    content.replaceWith(app);
    overlays.forEach(function (o) { document.body.appendChild(o); });

    var sb = document.getElementById("sidebar"), scrim = document.getElementById("scrim");
    document.getElementById("menuToggle").addEventListener("click", function () { sb.classList.add("open"); scrim.classList.add("open"); });
    scrim.addEventListener("click", function () { sb.classList.remove("open"); scrim.classList.remove("open"); });
  }

  /* ---------- Behaviours ---------- */
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = icon("circle-check", "sm") + "<span></span>";
    t.lastChild.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabs = group.querySelectorAll("[data-tab]");
      function show(id) {
        tabs.forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-tab") === id); });
        group.querySelectorAll("[data-panel]").forEach(function (p) {
          if (p.closest("[data-tabs]") === group) p.classList.toggle("on", p.getAttribute("data-panel") === id);
        });
      }
      tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.getAttribute("data-tab")); }); });
      var first = group.querySelector("[data-tab].active") || tabs[0];
      if (first) show(first.getAttribute("data-tab"));
    });
  }

  function initWizard() {
    document.querySelectorAll("[data-wizard]").forEach(function (w) {
      var panels = w.querySelectorAll(".step-panel");
      var steps = w.querySelectorAll(".stepper .st");
      var cur = 0;
      function go(i) {
        cur = Math.max(0, Math.min(panels.length - 1, i));
        panels.forEach(function (p, idx) { p.classList.toggle("on", idx === cur); });
        steps.forEach(function (s, idx) {
          s.classList.toggle("current", idx === cur);
          s.classList.toggle("done", idx < cur);
          var n = s.querySelector(".n");
          if (n) n.innerHTML = idx < cur ? icon("check", "sm") : String(idx + 1);
        });
        var prev = w.querySelector("[data-prev]"), next = w.querySelector("[data-next]");
        if (prev) prev.style.visibility = cur === 0 ? "hidden" : "visible";
        if (next) next.style.display = cur === panels.length - 1 ? "none" : "";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      w.querySelectorAll("[data-next]").forEach(function (b) { b.addEventListener("click", function () { go(cur + 1); }); });
      w.querySelectorAll("[data-prev]").forEach(function (b) { b.addEventListener("click", function () { go(cur - 1); }); });
      steps.forEach(function (s, idx) { s.addEventListener("click", function () { go(idx); }); });
      go(0);
    });
  }

  function closeMenus(except) {
    document.querySelectorAll(".menu.open").forEach(function (m) { if (m !== except) m.classList.remove("open"); });
  }

  function initClicks() {
    document.addEventListener("click", function (e) {
      var t = e.target;

      var menuBtn = t.closest("[data-menu]");
      if (menuBtn) {
        var m = document.getElementById(menuBtn.getAttribute("data-menu"));
        if (m) { var was = m.classList.contains("open"); closeMenus(); m.classList.toggle("open", !was); }
        e.preventDefault();
        return;
      }
      if (!t.closest(".menu")) closeMenus();

      var open = t.closest("[data-open]");
      if (open) {
        var modal = document.getElementById(open.getAttribute("data-open"));
        closeMenus();
        if (modal) modal.classList.add("open");
        e.preventDefault();
        return;
      }
      if (t.closest("[data-close]")) {
        var bd = t.closest(".modal-backdrop");
        if (bd) bd.classList.remove("open");
        var ct = t.closest("[data-toast]");
        if (ct) toast(ct.getAttribute("data-toast"));
        e.preventDefault();
        return;
      }
      if (t.classList && t.classList.contains("modal-backdrop")) { t.classList.remove("open"); return; }

      var tg = t.closest("[data-toast]");
      if (tg) { toast(tg.getAttribute("data-toast")); }

      var cp = t.closest("[data-copy]");
      if (cp) { try { navigator.clipboard.writeText(cp.getAttribute("data-copy")); } catch (err) {} toast("Copied to clipboard"); }

      var tog = t.closest("[data-toggle]");
      if (tog) { var el = document.querySelector(tog.getAttribute("data-toggle")); if (el) el.hidden = !el.hidden; }

      var rv = t.closest("[data-reveal-btn]");
      if (rv) {
        var inp = rv.parentElement.querySelector("input[data-reveal]");
        if (inp) inp.type = inp.type === "password" ? "text" : "password";
        e.preventDefault();
        return;
      }

      var pl = t.closest(".play[data-wave]");
      if (pl) {
        var wave = document.querySelector(pl.getAttribute("data-wave"));
        if (wave) {
          var on = wave.classList.toggle("playing");
          pl.innerHTML = icon(on ? "pause" : "play", "sm");
          wave.querySelectorAll("span").forEach(function (s, i) { s.classList.toggle("done", on && i < wave.children.length * 0.35); });
        }
        return;
      }

      var row = t.closest("[data-href]");
      if (row && !t.closest("a, button, input, select, label, .menu")) { window.location.href = row.getAttribute("data-href"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.open").forEach(function (m) { m.classList.remove("open"); });
        closeMenus();
      }
    });
  }

  /* Waveforms: <div class="wave" data-bars="64"></div> */
  function initWaves() {
    document.querySelectorAll(".wave[data-bars]").forEach(function (w) {
      var n = parseInt(w.getAttribute("data-bars"), 10) || 48, seed = 7;
      for (var i = 0; i < n; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        var r = seed / 233280;
        var h = 18 + Math.round(Math.abs(Math.sin(i / 3.1)) * 46 + r * 30);
        var s = document.createElement("span");
        s.style.setProperty("--h", Math.min(100, h) + "%");
        s.style.setProperty("--i", i);
        w.appendChild(s);
      }
    });
  }

  /* Chart tooltips: any [data-tip] element inside .chart-wrap */
  function initChartTips() {
    document.querySelectorAll(".chart-wrap").forEach(function (wrap) {
      var tip = document.createElement("div");
      tip.className = "chart-tip"; tip.hidden = true; wrap.appendChild(tip);
      wrap.addEventListener("mousemove", function (e) {
        var el = e.target.closest("[data-tip]");
        if (!el) { tip.hidden = true; return; }
        var r = wrap.getBoundingClientRect();
        tip.textContent = el.getAttribute("data-tip");
        tip.style.left = e.clientX - r.left + "px"; tip.style.top = e.clientY - r.top + "px"; tip.hidden = false;
      });
      wrap.addEventListener("mouseleave", function () { tip.hidden = true; });
    });
  }

  /* Tiny SVG chart helper — window.mockChart(svgEl, opts)
     opts: { labels:[], bars:[[..],[..]], lines:[[..]], stacked:bool, names:[..], yMax, yStep, height, xEvery, fmt(v) , unit }
     bars[0] = ink, bars[1] = light (hairline-strong); lines[0] = ink, lines[1] = muted. Add class "chart-wrap" to the parent for tooltips. */
  function drawChart(svg, o) {
    var NS = "http://www.w3.org/2000/svg";
    var W = 640, H = o.height || 220, L = o.left || 36, R = 8, T = 12, B = 26;
    var n = o.labels.length, pw = W - L - R, ph = H - T - B, slot = pw / n;
    var bars = o.bars || [], lines = o.lines || [], fmt = o.fmt || function (v) { return String(v); };
    var names = o.names || [];
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "chart");
    svg.setAttribute("role", "img");
    var max = o.yMax;
    if (!max) {
      var all = [];
      lines.forEach(function (l) { all = all.concat(l); });
      if (o.stacked) o.labels.forEach(function (_, i) { all.push(bars.reduce(function (a, s) { return a + s[i]; }, 0)); });
      else bars.forEach(function (b) { all = all.concat(b); });
      max = Math.max.apply(null, all);
    }
    var step = o.yStep || Math.pow(10, Math.floor(Math.log10(max / 4))) * ([1, 2, 2.5, 5, 10].filter(function (m) { return m * Math.pow(10, Math.floor(Math.log10(max / 4))) >= max / 4; })[0]);
    max = Math.ceil(max / step) * step;
    function y(v) { return T + ph - (v / max) * ph; }
    function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }
    for (var v = 0; v <= max + 1e-9; v += step) {
      el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: v === 0 ? "axis" : "grid-line" });
      var tx = el("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end" }); tx.textContent = fmt(v, true);
    }
    var every = o.xEvery || 1;
    o.labels.forEach(function (lab, i) {
      if (i % every) return;
      var t = el("text", { x: L + slot * i + slot / 2, y: H - 6, "text-anchor": "middle" }); t.textContent = lab;
    });
    var gw = Math.min(o.stacked ? 26 : 22, slot * 0.6), per = o.stacked ? 1 : bars.length || 1;
    var bw = o.stacked ? gw : Math.max(6, (gw * (per > 1 ? 1.5 : 1)) / per);
    o.labels.forEach(function (lab, i) {
      var cx = L + slot * i + slot / 2, acc = 0;
      bars.forEach(function (b, si) {
        var v = b[i], cls = si === 0 ? "bar" : "bar-2";
        if (o.stacked) {
          var y0 = y(acc + v), y1 = y(acc), h = Math.max(0, y1 - y0 - (acc > 0 ? 2 : 0));
          el("rect", { x: cx - bw / 2, y: y0, width: bw, height: h, rx: 3, class: cls });
          acc += v;
        } else {
          var x = cx - (bw * per) / 2 + si * bw + (per > 1 ? si * 2 : 0) - (per > 1 ? 1 : 0);
          el("rect", { x: x, y: y(v), width: bw, height: Math.max(0, y(0) - y(v)), rx: 3, class: cls });
        }
      });
      var tip = lab + " — " + bars.map(function (b, si) { return (names[si] ? names[si] + " " : "") + fmt(b[i]); }).concat(lines.map(function (l, li) { return (names[bars.length + li] ? names[bars.length + li] + " " : "") + fmt(l[i]); })).join(" · ");
      el("rect", { x: cx - slot / 2, y: T, width: slot, height: ph, fill: "transparent", "data-tip": tip });
    });
    lines.forEach(function (l, li) {
      var d = l.map(function (v, i) { return (i ? "L" : "M") + (L + slot * i + slot / 2).toFixed(1) + " " + y(v).toFixed(1); }).join(" ");
      el("path", { d: d, class: li === 0 ? "series" : "series-2" });
      if (o.points) l.forEach(function (v, i) { el("circle", { cx: L + slot * i + slot / 2, cy: y(v), r: 3.5, class: "pt" }); });
    });
  }
  window.mockChart = drawChart;

  function initCharts() {
    document.querySelectorAll("svg[data-chart]").forEach(function (svg) {
      try { drawChart(svg, JSON.parse(svg.getAttribute("data-chart"))); } catch (e) { console.error("chart", e); }
    });
  }

  function init() {
    buildShell();
    initCharts();
    hydrateIcons();
    initTabs();
    initWizard();
    initClicks();
    initWaves();
    initChartTips();
    hydrateIcons();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
