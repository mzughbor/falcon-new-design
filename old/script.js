// Falcon of Codes — domain check & interactions
(function () {
    function getCurrentNavPage() {
        const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
        if (file.includes("contact")) return "contact";
        if (file === "services.html" || file === "service.html") return "services";
        if (file.includes("about")) return "about";
        return "home";
    }

    function initHeaderNav() {
        const links = document.querySelectorAll(".nav-links a[data-nav]");
        if (!links.length) return;

        const page = getCurrentNavPage();
        links.forEach((link) => link.classList.toggle("is-active", link.dataset.nav === page));

        if (page !== "home") return;

        const logo = document.querySelector(".nav-logo");
        const homeLink = document.querySelector('.nav-links a[data-nav="home"]');
        const portfolioLink = document.querySelector('.nav-links a[data-nav="portfolio"]');
        if (logo) logo.setAttribute("href", "#top");
        if (homeLink) homeLink.setAttribute("href", "#top");
        if (portfolioLink) portfolioLink.setAttribute("href", "#themes");
    }

    function initHeaderScroll(header, nav) {
        if (!header) return;

        let lastY = window.scrollY;
        let ticking = false;
        const TOP_OFFSET = 72;
        const DELTA = 6;

        function updateHeader() {
            const y = window.scrollY;

            if (nav?.classList.contains("nav-open")) {
                header.classList.remove("is-hidden");
                lastY = y;
                ticking = false;
                return;
            }

            if (y <= TOP_OFFSET) {
                header.classList.remove("is-hidden");
            } else if (y > lastY + DELTA) {
                header.classList.add("is-hidden");
            } else if (y < lastY - DELTA) {
                header.classList.remove("is-hidden");
            }

            lastY = y;
            ticking = false;
        }

        window.addEventListener(
            "scroll",
            () => {
                if (!ticking) {
                    requestAnimationFrame(updateHeader);
                    ticking = true;
                }
            },
            { passive: true }
        );
    }

    function initSmoothScroll(nav, header) {
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener("click", (e) => {
                const id = a.getAttribute("href").slice(1);
                if (!id) return;
                const el = document.getElementById(id);
                if (el) {
                    e.preventDefault();
                    nav?.classList.remove("nav-open");
                    header?.classList.remove("is-hidden");
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    function initNavActive() {
        if (!document.getElementById("themes")) return;

        const links = document.querySelectorAll(".nav-links a");
        const sections = [...links]
            .map((link) => {
                const href = link.getAttribute("href") || "";
                if (!href.includes("#")) return null;
                const id = href.startsWith("#") ? href.slice(1) : href.split("#")[1];
                const el = document.getElementById(id);
                return el ? { link, el } : null;
            })
            .filter(Boolean);

        if (!sections.length) return;

        function setActive() {
            const offset = 120;
            let current = sections[0];

            for (const item of sections) {
                if (item.el.getBoundingClientRect().top - offset <= 0) {
                    current = item;
                }
            }

            links.forEach((link) => link.classList.remove("is-active"));
            current.link.classList.add("is-active");
        }

        setActive();
        window.addEventListener("scroll", setActive, { passive: true });
    }

    function initSiteHeader() {
        const header = document.querySelector(".header");
        const nav = document.querySelector(".nav");
        const navToggle = document.querySelector(".nav-toggle");
        if (!header) return;

        initHeaderNav();
        initHeaderScroll(header, nav);
        initNavTransparency();
        initSmoothScroll(nav, header);
        initNavActive();

        navToggle?.addEventListener("click", () => {
            const open = nav.classList.toggle("nav-open");
            navToggle.setAttribute("aria-expanded", open);
            if (open) header.classList.remove("is-hidden");
        });
    }

    function initNavTransparency() {
        if (!document.body.classList.contains('page-about')) return;
        const hero = document.querySelector('.about-hero');
        const nav = document.querySelector('.nav');
        if (!hero || !nav) return;

        try {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    nav.classList.toggle('nav--transparent', entry.isIntersecting);
                });
            }, { root: null, threshold: 0.05 });
            io.observe(hero);
        } catch (e) {
            // IntersectionObserver not supported — fall back to static transparent class
            nav.classList.add('nav--transparent');
        }
    }

    // Load HTML partials (header, footer, mobile nav, etc.)
    (async function loadPartials() {
        const hosts = document.querySelectorAll("[data-partial]");
        await Promise.all([...hosts].map(async (host) => {
            const url = host.getAttribute("data-partial");
            if (!url) return;
            try {
                const res = await fetch(url);
                if (!res.ok) return;
                host.innerHTML = await res.text();
            } catch (_) {
                /* partial unavailable when opened via file:// */
            }
        }));
    })();

    initSiteHeader();
    initMobileTabBar();

    const form = document.getElementById("domainForm");
    const input = document.getElementById("domain");
    const result = document.getElementById("domainResult");
    const noDomainBtn = document.getElementById("noDomainBtn");

    const domainRe = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

    function showOwnedFlow(domain) {
        result.hidden = false;
        result.className = "domain-result ok";
        result.innerHTML = `
      <div style="margin-bottom:8px;font-weight:600">
        Nice â€” let's verify <span style="color:var(--purple)">${domain}</span>
      </div>
      Add this record at your domain registrar, then click verify:
      <div style="margin-top:10px;display:grid;gap:6px;font-family:ui-monospace,monospace;font-size:12.5px">
        <div>TYPE  <code>CNAME</code></div>
        <div>HOST  <code>www</code></div>
        <div>VALUE <code>connect.falcon.codes</code></div>
      </div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" onclick="this.innerText='Verified âœ“';this.disabled=true;this.style.opacity=0.7">Verify domain</button>
        <button type="button" class="btn btn-outline" onclick="document.getElementById('domainResult').hidden=true">Cancel</button>
      </div>
    `;
    }

    function showInvalid() {
        result.hidden = false;
        result.className = "domain-result";
        result.innerHTML = `That doesn't look like a valid domain. Try <code>yourbrand.com</code>.`;
    }

    function showFreeFlow() {
        result.hidden = false;
        result.className = "domain-result ok";
        result.innerHTML = `
      <div style="margin-bottom:8px;font-weight:600">No domain? No stress.</div>
      Pick a free subdomain â€” yours for 24 hours to try the editor.
      <div style="margin-top:12px;display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--border);border-radius:999px;padding:6px 6px 6px 14px">
        <input id="subInput" placeholder="mybrand" style="flex:1;background:transparent;border:0;outline:none;color:var(--text);font:500 15px var(--font);padding:8px 0;min-width:0" />
        <span style="color:var(--text-muted);font-size:14px">.falcon.codes</span>
        <button type="button" class="btn btn-primary" onclick="this.innerText='Reserved âœ“';this.disabled=true;this.style.opacity=0.7">Claim</button>
      </div>
      <div style="margin-top:10px;font-size:12.5px;color:var(--text-muted)">
        Free trial sites are removed after 24h unless upgraded ($1/mo and up).
      </div>
    `;
        setTimeout(() => document.getElementById("subInput")?.focus(), 30);
    }

    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = input.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
        if (!val) { input.focus(); return; }
        if (!domainRe.test(val)) { showInvalid(); return; }
        showOwnedFlow(val);
    });

    noDomainBtn?.addEventListener("click", showFreeFlow);

    function initMobileTabBar() {
        const bar = document.querySelector(".mobile-tabbar");
        if (!bar) return;

        const indicator = bar.querySelector(".mobile-tabbar-indicator");
        const tabs = [...bar.querySelectorAll(".mobile-tab")];
        if (!indicator || !tabs.length) return;

        const path = window.location.pathname;
        const file = (path.split("/").pop() || "index.html").toLowerCase();
        let activePage = "home";
        if (file.includes("contact")) activePage = "contact";
        else if (file === "services.html") activePage = "services";
        else if (file === "service.html") activePage = "service";
        else if (file.includes("about")) activePage = "about";

        tabs.forEach((tab) => tab.classList.remove("is-active"));
        const activeTab = tabs.find((t) => t.dataset.page === activePage) || tabs[0];
        activeTab.classList.add("is-active");

        function moveIndicator(tab, animate = true) {
            const barRect = bar.getBoundingClientRect();
            const icon = tab.querySelector(".mobile-tab-icon");
            const iconRect = (icon || tab).getBoundingClientRect();
            const x = iconRect.left - barRect.left + (iconRect.width - indicator.offsetWidth) / 2;
            indicator.style.transition = animate ? "" : "none";
            indicator.style.transform = `translateX(${x}px)`;
            if (!animate) requestAnimationFrame(() => { indicator.style.transition = ""; });
        }

        moveIndicator(activeTab, false);

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                tabs.forEach((t) => t.classList.remove("is-active"));
                tab.classList.add("is-active");
                moveIndicator(tab);
            });
        });

        window.addEventListener("resize", () => {
            const current = bar.querySelector(".mobile-tab.is-active") || tabs[0];
            moveIndicator(current, false);
        });
    }

    // Theme demos
    const themeCards = document.querySelectorAll(".theme-card");
    const previewPanel = document.getElementById("themePreviewPanel");
    const previewFrame = document.getElementById("themePreviewFrame");
    const previewUrl = document.getElementById("themePreviewUrl");
    const previewName = document.getElementById("themePreviewName");
    const selectedNote = document.getElementById("themeSelectedNote");
    const selectedName = document.getElementById("themeSelectedName");

    function setThemePreview(card) {
        const theme = card.dataset.theme;
        const label = card.dataset.label;
        const url = card.dataset.url;

        themeCards.forEach((c) => c.classList.remove("is-previewing"));
        card.classList.add("is-previewing");

        previewPanel.hidden = false;
        previewFrame.className = `theme-preview-frame theme-frame-${theme}`;
        previewUrl.textContent = url;
        previewName.textContent = label;

        previewPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function chooseTheme(card) {
        const label = card.dataset.label;

        themeCards.forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        setThemePreview(card);

        selectedName.textContent = label;
        selectedNote.hidden = false;
    }

    themeCards.forEach((card) => {
        card.querySelector(".theme-preview-btn")?.addEventListener("click", () => {
            setThemePreview(card);
        });
        card.querySelector(".theme-choose-btn")?.addEventListener("click", () => {
            chooseTheme(card);
        });
    });

    // Theme carousel scroll
    const themeScroll = document.getElementById("themeScroll");
    const scrollPrev = document.querySelector(".theme-scroll-prev");
    const scrollNext = document.querySelector(".theme-scroll-next");

    function getThemeScrollStep() {
        const card = themeScroll?.querySelector(".theme-card");
        if (!card || !themeScroll) return 320;
        const gap = 24;
        return card.offsetWidth + gap;
    }

    function updateThemeScrollButtons() {
        if (!themeScroll || !scrollPrev || !scrollNext) return;
        const maxScroll = themeScroll.scrollWidth - themeScroll.clientWidth;
        scrollPrev.disabled = themeScroll.scrollLeft <= 4;
        scrollNext.disabled = themeScroll.scrollLeft >= maxScroll - 4;
    }

    scrollPrev?.addEventListener("click", () => {
        themeScroll?.scrollBy({ left: -getThemeScrollStep(), behavior: "smooth" });
    });

    scrollNext?.addEventListener("click", () => {
        themeScroll?.scrollBy({ left: getThemeScrollStep(), behavior: "smooth" });
    });

    themeScroll?.addEventListener("scroll", updateThemeScrollButtons, { passive: true });
    window.addEventListener("resize", updateThemeScrollButtons);
    updateThemeScrollButtons();

    // About page why-cards accordion (mobile only)
    (function initWhyAccordion() {
        const cards = document.querySelectorAll(".why-card");
        if (!cards.length) return;

        const mq = window.matchMedia("(max-width: 768px)");

        function syncWhyCards() {
            cards.forEach((card) => {
                if (mq.matches) {
                    card.removeAttribute("open");
                } else {
                    card.setAttribute("open", "");
                }
            });
        }

        syncWhyCards();
        mq.addEventListener("change", syncWhyCards);
    })();

    // Contact form
    const contactForm = document.getElementById("contactForm");
    const contactResult = document.getElementById("contactFormResult");

    contactForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = contactForm.querySelector('[name="name"]')?.value.trim();
        const email = contactForm.querySelector('[name="email"]')?.value.trim();
        const message = contactForm.querySelector('[name="message"]')?.value.trim();

        if (!name || !email || !message) {
            contactResult.hidden = false;
            contactResult.textContent = "Please fill in your name, email, and message.";
            contactResult.style.color = "#dc2626";
            contactResult.style.background = "#fee2e2";
            return;
        }

        contactResult.hidden = false;
        contactResult.textContent = "Thanks! Your message was sent — we'll reply within 24 hours.";
        contactResult.style.color = "var(--purple)";
        contactResult.style.background = "rgba(147, 84, 183, 0.08)";
        contactForm.reset();
    });
})();