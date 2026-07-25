/**
 * Shared services data loader (local JSON — no API).
 * Source: data/services-details.json
 * Structure must stay as-is; only image path strings may change.
 */
(function (global) {
    const DATA_URL = "data/services-details.json";

    /** @deprecated Dedicated clones still exist; list + shared href always use the template. */
    const SERVICE_PAGES = {
        "web-dev": "web.html",
        seo: "seo.html",
        uiux: "ui.html",
        ecommerce: "e-commerce.html",
    };

    /** Sandy list-card thumbs (services.html). All other services use FALLBACK_LIST_THUMB. */
    const FALLBACK_LIST_THUMB = "images/strategyyy.png";
    const LIST_THUMBS = {
        "web-dev": "images/web developmenttt.png",
        uiux: "images/ديزاين.png",
        seo: "images/seoservices.png",
        "paid-ads": "images/paid advertising.png",
        cashflow: "images/cash flow.png",
        auditing: "images/حسابات.png",
        ecommerce: "images/e-commerce.png",
        "legal-consulting": "images/strategyyy.png",
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
        if (!service || !service.id) return "services.html";
        return `service-template.html?id=${encodeURIComponent(service.id)}`;
    }

    function getListThumb(service) {
        if (!service) return FALLBACK_LIST_THUMB;
        if (LIST_THUMBS[service.id]) return LIST_THUMBS[service.id];
        return FALLBACK_LIST_THUMB;
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

    const CATEGORY_LABELS = {
        "software-web-development": "Software & Web",
        "digital-solutions": "Digital Solutions",
        "financial-accounting": "Financial & Accounting",
        "legal-services": "Legal Services",
    };

    function getCategoryLabel(category) {
        return CATEGORY_LABELS[category] || "Services";
    }

    function shuffle(list) {
        const arr = list.slice();
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    /** Same category, excluding current — typically 3 siblings. */
    function getRelatedServices(service, allServices) {
        if (!service || !Array.isArray(allServices)) return [];
        return allServices.filter(
            (s) => s.id !== service.id && s.category === service.category
        );
    }

    /** Random picks from other categories (default 3). */
    function getOtherServices(service, allServices, count) {
        if (!service || !Array.isArray(allServices)) return [];
        const limit = typeof count === "number" ? count : 3;
        const pool = allServices.filter(
            (s) => s.id !== service.id && s.category !== service.category
        );
        return shuffle(pool).slice(0, limit);
    }

    global.FalconServices = {
        DATA_URL,
        SERVICE_PAGES,
        CATEGORY_LABELS,
        loadServicesDetails,
        getServices,
        getServiceById,
        getServicePageHref,
        getListThumb,
        getServiceLede,
        firstSentence,
        resolveServiceIdFromPage,
        getCategoryLabel,
        getRelatedServices,
        getOtherServices,
    };
})(window);
