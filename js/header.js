// Site header + mobile tab bar (adapted for Sandy's pages; home = index.html)
(function () {
    function getCurrentNavPage() {
        const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
        if (file.includes("contact")) return "contact";
        if (file.includes("service") || file === "web.html") return "services";
        if (file.includes("about")) return "about";
        if (file === "index.html" || file === "falcon.html" || file === "" || file === "header.html") return "home";
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
        if (portfolioLink) portfolioLink.setAttribute("href", "#projects");
    }

    function initHeaderScroll(header, nav) {
        if (!header) return;

        let lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
        let ticking = false;
        const TOP_OFFSET = 72;
        const DELTA = 8;

        function updateHeader() {
            const y = window.pageYOffset || document.documentElement.scrollTop || 0;

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

        // Ensure correct state on load / hash jump
        updateHeader();
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

    // About / Services: CSS starts transparent (no flash). Only add .nav--solid after hero exits.
    function initNavTransparency() {
        const nav = document.querySelector(".site-header .nav");
        if (!nav) return;

        let hero = null;
        if (document.body.classList.contains("page-about")) {
            hero = document.querySelector(".about-hero");
        } else if (document.body.classList.contains("page-services")) {
            hero = document.querySelector(".hero");
        }
        if (!hero) return;

        const setSolid = (solid) => {
            nav.classList.toggle("nav--solid", solid);
        };

        // Mid-page refresh: only solid if hero is already gone
        setSolid(hero.getBoundingClientRect().bottom <= 48);

        if (!("IntersectionObserver" in window)) return;

        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                setSolid(!entry.isIntersecting);
            },
            { root: null, threshold: 0, rootMargin: "-48px 0px 0px 0px" }
        );
        io.observe(hero);
    }

    function initSiteHeader() {
        const header = document.querySelector("#site-header") || document.querySelector(".site-header");
        const nav = document.querySelector(".nav");
        const navToggle = document.querySelector(".nav-toggle");
        if (!header) return;

        initHeaderNav();
        initHeaderScroll(header, nav);
        initNavTransparency();
        initSmoothScroll(nav, header);

        navToggle?.addEventListener("click", () => {
            const open = nav.classList.toggle("nav-open");
            navToggle.setAttribute("aria-expanded", open);
            navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            if (open) header.classList.remove("is-hidden");
        });

        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => {
                nav?.classList.remove("nav-open");
                navToggle?.setAttribute("aria-expanded", "false");
                navToggle?.setAttribute("aria-label", "Open menu");
            });
        });
    }

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
        else if (file.includes("service") || file === "web.html") activePage = "services";
        else if (file.includes("about")) activePage = "about";
        else if (window.location.hash === "#projects") activePage = "portfolio";

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

    initSiteHeader();
    initMobileTabBar();
})();
