/**
 * Binds one service detail page from data/services-details.json.
 * Reads body[data-service-id] or ?id=
 *
 * data-bind hooks:
 *   title, headline, description (lede), hero-image, cta-image,
 *   features-title, features, process-title, process,
 *   tools-title, tools, related-services, other-services,
 *   slogan, cta-support
 */
(function () {
    function clearLoading() {
        document.body.classList.remove("is-loading");
        const loader = document.querySelector(".service-loading");
        if (loader) {
            loader.setAttribute("aria-busy", "false");
            loader.hidden = true;
        }
    }

    function showError(message) {
        clearLoading();
        document.body.classList.add("is-error");
        const err = document.querySelector(".service-load-error");
        if (err) {
            if (message) err.textContent = message;
            err.hidden = false;
        }
    }

    const FS = window.FalconServices;
    if (!FS) {
        console.error("services-data.js must load before service-page.js");
        showError("Unable to load this service. Please try again.");
        return;
    }

    const FEATURE_ICONS = [
        "fa-solid fa-briefcase",
        "fa-solid fa-layer-group",
        "fa-solid fa-gears",
        "fa-solid fa-rocket",
    ];
    const FEATURE_TONES = ["", "purple", "blue", "pink"];

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function setText(selector, value) {
        if (value == null || value === "") return;
        document.querySelectorAll(selector).forEach((el) => {
            el.textContent = value;
        });
    }

    function setHtml(selector, html) {
        if (html == null || html === "") return;
        document.querySelectorAll(selector).forEach((el) => {
            el.innerHTML = html;
        });
    }

    function setImg(selector, src, alt) {
        if (!src) return;
        document.querySelectorAll(selector).forEach((el) => {
            el.setAttribute("src", src);
            if (alt) el.setAttribute("alt", alt);
        });
    }

    function normalizeFeatures(service) {
        const list = service.features || [];
        return list.map((item, index) => {
            if (typeof item === "string") {
                return {
                    title: item,
                    description: FS.firstSentence(service.lede || service.description, 90),
                    iconType: "fa",
                    icon: FEATURE_ICONS[index % FEATURE_ICONS.length],
                    tone: FEATURE_TONES[index % FEATURE_TONES.length],
                };
            }
            return {
                title: item.title || "",
                description: item.description || "",
                iconType: item.iconType || "fa",
                icon: item.icon || FEATURE_ICONS[index % FEATURE_ICONS.length],
                tone: item.tone || FEATURE_TONES[index % FEATURE_TONES.length],
            };
        });
    }

    function featureIconHtml(feature) {
        if (feature.iconType === "img") {
            return `<img src="${escapeHtml(feature.icon)}" alt="">`;
        }
        return `<i class="${escapeHtml(feature.icon)}"></i>`;
    }

    function bindFeatures(service) {
        const grid = document.querySelector('[data-bind="features"]');
        if (!grid) return;
        const features = normalizeFeatures(service);
        grid.innerHTML = features
            .map((feature) => {
                const toneClass = feature.tone ? ` ${escapeHtml(feature.tone)}` : "";
                return `
                <div class="service-card">
                    <div class="icon${toneClass}">
                        ${featureIconHtml(feature)}
                    </div>
                    <h3>${escapeHtml(feature.title)}</h3>
                    <p>${escapeHtml(feature.description)}</p>
                </div>`;
            })
            .join("");
    }

    function bindProcess(service) {
        const root = document.querySelector('[data-bind="process"]');
        if (!root || !Array.isArray(service.process)) return;

        const steps = service.process
            .map((step, index) => {
                const active = index === 0 ? " active" : "";
                return `
                <div class="step${active}">
                    <div class="circle">${escapeHtml(step.number || String(index + 1).padStart(2, "0"))}</div>
                    <h4>${escapeHtml(step.title || "")}</h4>
                    <p>${escapeHtml(step.description || "")}</p>
                </div>`;
            })
            .join("");

        root.innerHTML = `<div class="timeline-line"></div>${steps}`;
    }

    function bindTools(service) {
        const root = document.querySelector('[data-bind="tools"]');
        if (!root || !Array.isArray(service.tools)) return;

        root.innerHTML = service.tools
            .map(
                (tool) => `
                <div class="tech-item">
                    <img src="${escapeHtml(tool.image || "")}" alt="">
                    <span>${escapeHtml(tool.name || "")}</span>
                </div>`
            )
            .join("");
    }

    function relatedItemHtml(service) {
        const href = FS.getServicePageHref(service);
        const blurb = FS.getServiceLede
            ? FS.getServiceLede(service)
            : FS.firstSentence(service.description || "", 96);
        const thumb = FS.getListThumb ? FS.getListThumb(service) : "";
        const thumbHtml = thumb
            ? `<span class="related-service-thumb"><img src="${escapeHtml(thumb)}" alt="" loading="lazy"></span>`
            : `<span class="related-service-thumb related-service-thumb--icon" aria-hidden="true"><i class="fa-solid fa-layer-group"></i></span>`;

        return `
            <a class="related-service-link" href="${escapeHtml(href)}">
                ${thumbHtml}
                <span class="related-service-copy">
                    <strong>${escapeHtml(service.title || "")}</strong>
                    <span>${escapeHtml(blurb)}</span>
                </span>
                <span class="related-service-arrow" aria-hidden="true">→</span>
            </a>`;
    }

    function bindRelatedSection(service, allServices) {
        const section = document.querySelector(".related-services");
        const relatedRoot = document.querySelector('[data-bind="related-services"]');
        const otherRoot = document.querySelector('[data-bind="other-services"]');
        if (!section || (!relatedRoot && !otherRoot)) return;

        const list = Array.isArray(allServices) ? allServices : [];
        const getRelated = FS.getRelatedServices
            ? FS.getRelatedServices.bind(FS)
            : (svc, all) =>
                  all.filter((s) => s.id !== svc.id && s.category === svc.category);
        const getOther = FS.getOtherServices
            ? FS.getOtherServices.bind(FS)
            : (svc, all, count) =>
                  all
                      .filter((s) => s.id !== svc.id && s.category !== svc.category)
                      .slice(0, count || 3);
        const categoryLabel = FS.getCategoryLabel
            ? FS.getCategoryLabel(service.category)
            : service.category || "Services";

        const related = getRelated(service, list);
        const others = getOther(service, list, 3);

        setText('[data-bind="related-label"]', categoryLabel);
        setText('[data-bind="related-heading"]', "Related Services");
        setText('[data-bind="other-heading"]', "Other Services");
        setText(
            '[data-bind="related-support"]',
            `More from ${categoryLabel}`
        );
        setText(
            '[data-bind="other-support"]',
            "Discover services from our other categories"
        );

        if (relatedRoot) {
            relatedRoot.innerHTML = related.length
                ? related.map(relatedItemHtml).join("")
                : `<p class="related-empty">No related services in this category.</p>`;
        }
        if (otherRoot) {
            otherRoot.innerHTML = others.length
                ? others.map(relatedItemHtml).join("")
                : `<p class="related-empty">No other services to show.</p>`;
        }

        section.hidden = false;
        section.setAttribute("data-bound", "true");
    }

    function bindHeadline(service) {
        const el = document.querySelector('[data-bind="headline"]');
        if (!el || !service.headline) return;
        const before = service.headline.before || "";
        const accent = service.headline.accent || "";
        el.innerHTML = `${escapeHtml(before)}${accent ? `<span>${escapeHtml(accent)}</span>` : ""}`;
    }

    function bindService(service, allServices) {
        document.body.dataset.serviceId = service.id;
        if (service.slug) document.body.dataset.serviceSlug = service.slug;

        document.title = `${service.title} | Falcon Codes`;

        setText('[data-bind="title"]', service.title);
        bindHeadline(service);
        setText(
            '[data-bind="description"]',
            service.lede || FS.firstSentence(service.description)
        );

        const heroSrc = service.images && service.images[0];
        const ctaSrc =
            (service.images && service.images[1]) ||
            (service.extraImages && service.extraImages[0]);

        setImg('[data-bind="hero-image"]', heroSrc, service.title);
        setImg('[data-bind="cta-image"]', ctaSrc, service.title);

        setText('[data-bind="features-title"]', service.featuresSectionTitle || "What We Offer");
        bindFeatures(service);

        setText('[data-bind="process-title"]', service.processSectionTitle || "Our Process");
        bindProcess(service);

        setText('[data-bind="tools-title"]', service.toolsSectionTitle || "Tools We Use");
        bindTools(service);

        bindRelatedSection(service, allServices || []);

        setText('[data-bind="slogan"]', service.slogan);
        setText('[data-bind="cta-support"]', service.ctaSupport);

        if (Array.isArray(service.extraContent)) {
            service.extraContent.forEach((block, index) => {
                setText(`[data-bind="extra-title-${index}"]`, block.title);
                setText(`[data-bind="extra-description-${index}"]`, block.description);
            });
        }
    }

    function refreshAnimations() {
        const revealElements = document.querySelectorAll(
            ".hero-text, .hero-image, .service-card, .step, .tech-item"
        );
        revealElements.forEach((el) => {
            el.classList.add("fade-up");
            el.classList.add("show");
        });
        document.querySelectorAll(".service-card").forEach((card, index) => {
            card.style.animationDelay = `${index * 0.15}s`;
        });
    }

    async function init() {
        const id = FS.resolveServiceIdFromPage();
        if (!id) {
            console.warn("service-page: no data-service-id or ?id= found");
            showError("Unable to load this service. Please try again.");
            return;
        }

        try {
            const allServices = await FS.getServices();
            const service = allServices.find((s) => s.id === id) || null;
            if (!service) {
                console.error(`service-page: service id "${id}" not found in JSON`);
                showError("Unable to load this service. Please try again.");
                return;
            }
            bindService(service, allServices);
            clearLoading();
            refreshAnimations();
            document.dispatchEvent(
                new CustomEvent("falcon:service-bound", { detail: { service } })
            );
        } catch (err) {
            console.error("service-page: failed to bind", err);
            showError("Unable to load this service. Please try again.");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
