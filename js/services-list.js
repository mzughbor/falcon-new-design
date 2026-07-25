/**
 * Renders the All Services grid on services.html from data/services-details.json.
 */
(function () {
    const FS = window.FalconServices;
    if (!FS) {
        console.error("services-data.js must load before services-list.js");
        return;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function cardHtml(service) {
        const href = FS.getServicePageHref(service);
        const thumb = FS.getListThumb(service);
        const blurb = FS.getServiceLede
            ? FS.getServiceLede(service)
            : FS.firstSentence(service.description, 96);
        return `
            <div class="service-card">
                <div class="service-image">
                    <img src="${escapeHtml(thumb)}" alt="${escapeHtml(service.title)}">
                </div>
                <h3>${escapeHtml(service.title)}</h3>
                <p>${escapeHtml(blurb)}</p>
                <a href="${escapeHtml(href)}" class="service-link">
                    Learn More
                    <span>→</span>
                </a>
            </div>`;
    }

    function observeCards(root) {
        const cards = root.querySelectorAll(".service-card");
        if (!("IntersectionObserver" in window)) {
            cards.forEach((card) => card.classList.add("show"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const card = entry.target;
                    const delay = Number(card.dataset.delay || 0);
                    setTimeout(() => card.classList.add("show"), delay);
                    observer.unobserve(card);
                });
            },
            { threshold: 0.15 }
        );

        cards.forEach((card, index) => {
            card.dataset.delay = String((index % 4) * 120);
            observer.observe(card);
        });
    }

    async function init() {
        const grid = document.querySelector("[data-services-grid]");
        if (!grid) return;

        try {
            const services = await FS.getServices();
            grid.innerHTML = services.map(cardHtml).join("");
            observeCards(grid);
            document.dispatchEvent(
                new CustomEvent("falcon:services-list-rendered", {
                    detail: { count: services.length },
                })
            );
        } catch (err) {
            console.error("services-list: failed to render", err);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
