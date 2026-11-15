// =========================================================
// STUDYNET — SHARED COURSE UI ENHANCEMENTS
// Reading progress bar, back-to-top button & deep-link tabs
// =========================================================

(function () {
    "use strict";

    // 1. Reading progress bar
    const progress = document.createElement("div");
    progress.className = "sn-progress";
    progress.setAttribute("aria-hidden", "true");

    const bar = document.createElement("div");
    bar.className = "sn-progress-bar";
    progress.appendChild(bar);
    document.body.prepend(progress);

    // 2. Floating back-to-top button (skip if page already defines one)
    const hasNativeTopBtn = Boolean(
        document.querySelector(".back-top, .backtop, #backTop, #backToTop")
    );
    let topBtn = null;

    if (!hasNativeTopBtn) {
        topBtn = document.createElement("button");
        topBtn.type = "button";
        topBtn.className = "sn-top-btn";
        topBtn.setAttribute("aria-label", "Retour en haut de la page");
        topBtn.title = "Haut de page";
        topBtn.textContent = "↑";
        topBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        document.body.appendChild(topBtn);
    }

    function onScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        bar.style.width = pct.toFixed(2) + "%";

        if (topBtn) {
            topBtn.classList.toggle("is-visible", scrollTop > 420);
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    // 3. Activate tabbed sections when arriving via URL hash (#cours, #exercices, #quiz, etc.)
    function activateHashTab() {
        const rawHash = (window.location.hash || "").replace(/^#/, "").trim();
        if (!rawHash) return;

        // Map French/English aliases so every hub quick-link works
        const aliases = {
            cours: ["cours", "course"],
            course: ["course", "cours"],
            exercices: ["exercices", "projects", "projets"],
            projects: ["projects", "exercices", "projets"],
            projets: ["projets", "projects", "exercices"],
            quiz: ["quiz"]
        };

        const candidates = aliases[rawHash] || [rawHash];
        let targetId = null;
        for (let i = 0; i < candidates.length; i++) {
            if (document.getElementById(candidates[i])) {
                targetId = candidates[i];
                break;
            }
        }
        if (!targetId) return;

        // html_css.html data-section nav buttons
        const dataBtn = document.querySelector(
            '.nav-btn[data-section="' + targetId + '"]'
        );
        if (dataBtn) {
            dataBtn.click();
            return;
        }

        // PHP.html showSection(id, btn)
        if (typeof window.showSection === "function") {
            const phpBtn = document.querySelector(
                ".nav-btn[onclick*=\"'" + targetId + "'\"]"
            );
            if (phpBtn) {
                window.showSection(targetId, phpBtn);
                return;
            }
        }

        // limites-continuite.html showTab(id)
        if (typeof window.showTab === "function") {
            const tabEl = document.getElementById(targetId);
            if (tabEl && tabEl.classList.contains("section")) {
                document.querySelectorAll(".section").forEach(function (s) {
                    s.classList.remove("active");
                });
                document.querySelectorAll(".tab").forEach(function (t) {
                    const oc = t.getAttribute("onclick") || "";
                    t.classList.toggle(
                        "active",
                        oc.indexOf("'" + targetId + "'") !== -1
                    );
                });
                tabEl.classList.add("active");
                return;
            }
        }

        // Generalites-et-notions-de-base.htm showPart(id, btn)
        if (typeof window.showPart === "function") {
            const partBtn = document.querySelector(
                ".tabs button[onclick*=\"'" + targetId + "'\"]"
            );
            if (partBtn) {
                window.showPart(targetId, partBtn);
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", activateHashTab);
    } else {
        activateHashTab();
    }
    window.addEventListener("hashchange", activateHashTab);
})();
