/**
 * Shared services data loader (local JSON — no API).
 * Source: data/services-details.json
 * Structure must stay as-is; only image path strings may change.
 */
(function (global) {
    const DATA_URL = "data/services-details.json";

    /** Dedicated HTML pages for known services; others use the template. */
    const SERVICE_PAGES = {
        "web-dev": "web.html",
        seo: "seo.html",
        uiux: "ui.html",
        ecommerce: "e-commerce.html",
    };

    /** Optional list-card thumbnails (services.html). Prefer local unified assets. */
    const LIST_THUMBS = {
        "web-dev": "images/web developmenttt.png",
        uiux: "images/ديزاين.png",
        seo: "images/seoservices.png",
        ecommerce: "images/e-commerce.png",
        mobile: "images/services/mobile-phone-background-images.jpg",
        "social-media": "images/services/pile-popular-social-media-logos.jpg",
        content:
            "images/services/close-up-man-hand-holding-tablet-with-group-businesspeople-with-creative-smartphone-hologram-blue-red-hearts-blue-background-social-media-likes-digital-marketing-concept.jpg",
        "paid-ads":
            "images/services/close-up-smartphone-money-graphs-charts-workplace-office-business-concept.jpg",
        auditing: "images/services/business-man-working-office-2desktop.jpg",
        "financial-reporting": "images/services/money-around-world.jpg",
        "cost-accounting": "images/services/cropped-image-businessman-using-laptop-desk.jpg",
        cashflow: "images/services/business-man-working-office-desktop.jpg",
        "legal-consulting": "images/services/golden-scales-justice-gavel-books-grey-background.jpg",
        "contract-drafting":
            "images/services/photo-realistic-certificate-handshake-symbolizing-formal-thanks-with-space-text-adobe-sto.jpg",
        compliance: "images/services/people-working-table.jpg",
        "dispute-resolution": "images/services/business-man-working-office-desktop.jpg",
    };

    let cache = null;

    async function loadServicesDetails() {
        if (cache) return cache;
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error(`Failed to load ${DATA_URL}: ${res.status}`);
        cache = await res.json();
        return cache;
    }

    async function getServices() {
        const data = await loadServicesDetails();
        return Array.isArray(data.services) ? data.services : [];
    }

    async function getServiceById(id) {
        if (!id) return null;
        const services = await getServices();
        return services.find((s) => s.id === id) || null;
    }

    function getServicePageHref(service) {
        if (!service) return "services.html";
        if (SERVICE_PAGES[service.id]) return SERVICE_PAGES[service.id];
        return `service-template.html?id=${encodeURIComponent(service.id)}`;
    }

    function getListThumb(service) {
        if (!service) return "";
        if (LIST_THUMBS[service.id]) return LIST_THUMBS[service.id];
        if (service.images && service.images[0]) return service.images[0];
        return "images/services laptop.png";
    }

    function getServiceLede(service) {
        if (!service) return "";
        if (service.lede) return service.lede;
        return firstSentence(service.description || "", 96);
    }

    function firstSentence(text, maxLen) {
        if (!text) return "";
        const match = String(text).match(/^[^.!?]+[.!?]/);
        let out = match ? match[0].trim() : String(text).trim();
        if (maxLen && out.length > maxLen) out = out.slice(0, maxLen - 1).trim() + "…";
        return out;
    }

    function resolveServiceIdFromPage() {
        const params = new URLSearchParams(global.location.search);
        const fromQuery = params.get("id");
        if (fromQuery) return fromQuery;
        const body = global.document && global.document.body;
        return (body && body.dataset.serviceId) || null;
    }

    global.FalconServices = {
        DATA_URL,
        SERVICE_PAGES,
        loadServicesDetails,
        getServices,
        getServiceById,
        getServicePageHref,
        getListThumb,
        getServiceLede,
        firstSentence,
        resolveServiceIdFromPage,
    };
})(window);
