/**
 * Binds one service detail page from data/services-details.json.
 * Reads body[data-service-id] or ?id=
 *
 * data-bind hooks:
 *   title, description, slogan, hero-image, cta-image, features
 * Headlines / process / tools stay page-local (not in JSON).
 */
(function () {
    const FS = window.FalconServices;
    if (!FS) {
        console.error("services-data.js must load before service-page.js");
        return;
    }

    const FEATURE_ICONS = [
        "fa-solid fa-briefcase",
        "fa-solid fa-layer-group",
        "fa-solid fa-gears",
        "fa-solid fa-rocket",
    ];
    const FEATURE_TONES = ["", "purple", "blue", "pink"];

    function setText(selector, value) {
        if (value == null || value === "") return;
        document.querySelectorAll(selector).forEach((el) => {
            el.textContent = value;
        });
    }

    function setHtml(selector, value) {
        if (value == null || value === "") return;
        document.querySelectorAll(selector).forEach((el) => {
            el.innerHTML = value;
        });
    }

    function setImg(selector, src, alt) {
        if (!src) return;
        document.querySelectorAll(selector).forEach((el) => {
            el.setAttribute("src", src);
            if (alt) el.setAttribute("alt", alt);
        });
    }

    function bindFeatures(service) {
        const grid = document.querySelector('[data-bind="features"]');
        if (!grid || !Array.isArray(service.features)) return;

        const cards = grid.querySelectorAll(".service-card");
        if (cards.length) {
            service.features.forEach((feature, index) => {
                const card = cards[index];
                if (!card) return;
                const title = card.querySelector("h3");
                if (title) title.textContent = feature;
            });
            return;
        }

        grid.innerHTML = service.features
            .map((feature, index) => {
                const tone = FEATURE_TONES[index % FEATURE_TONES.length];
                const icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
                const toneClass = tone ? ` ${tone}` : "";
                return `
                <div class="service-card">
                    <div class="icon${toneClass}">
                        <i class="${icon}"></i>
                    </div>
                    <h3>${escapeHtml(feature)}</h3>
                    <p>${escapeHtml(FS.firstSentence(service.description, 90))}</p>
                </div>`;
            })
            .join("");
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function bindService(service) {
        document.body.dataset.serviceId = service.id;
        if (service.slug) document.body.dataset.serviceSlug = service.slug;

        document.title = `${service.title} | Falcon Codes`;

        setText('[data-bind="title"]', service.title);
        setText('[data-bind="description"]', FS.firstSentence(service.description));
        setText('[data-bind="slogan"]', service.slogan);

        const heroSrc = service.images && service.images[0];
        const ctaSrc =
            (service.images && service.images[1]) ||
            (service.extraImages && service.extraImages[0]);

        setImg('[data-bind="hero-image"]', heroSrc, service.title);
        setImg('[data-bind="cta-image"]', ctaSrc, service.title);

        bindFeatures(service);

        // Optional extraContent blocks if markup exists
        if (Array.isArray(service.extraContent)) {
            service.extraContent.forEach((block, index) => {
                setText(`[data-bind="extra-title-${index}"]`, block.title);
                setText(`[data-bind="extra-description-${index}"]`, block.description);
            });
        }
    }

    async function init() {
        const id = FS.resolveServiceIdFromPage();
        if (!id) {
            console.warn("service-page: no data-service-id or ?id= found");
            return;
        }

        try {
            const service = await FS.getServiceById(id);
            if (!service) {
                console.error(`service-page: service id "${id}" not found in JSON`);
                return;
            }
            bindService(service);
            document.dispatchEvent(
                new CustomEvent("falcon:service-bound", { detail: { service } })
            );
        } catch (err) {
            console.error("service-page: failed to bind", err);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
