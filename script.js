// =========================================================================
// STUDYNET — HOMEPAGE SOMMAIRE, URL-SYNCED SEARCH/FILTERS & BOOKMARK SHEET
// =========================================================================

(function () {
    "use strict";

    var VIEW_KEY = "studynet:syllabus:view";
    var TOTAL_COURSES = 17;

    var searchInput = document.getElementById("searchInput");
    var clearSearchBtn = document.getElementById("clearSearch");
    var searchShortcut = document.getElementById("searchShortcut");
    var resetFiltersBtn = document.getElementById("resetFilters");
    var inlineResetBtn = document.getElementById("inlineResetFilters");
    var filterChips = document.querySelectorAll(".filter-chip");
    var viewBtns = document.querySelectorAll(".view-btn");
    var syllabusList = document.getElementById("snTourSyllabus");
    var items = document.querySelectorAll(".syllabus-item");
    var emptyState = document.getElementById("emptyState");
    var emptyTitle = document.getElementById("emptyTitle");
    var resultsInfo = document.getElementById("resultsInfo");

    var activeCategory = "all";
    var activeView = "index";
    var debounceTimer = null;

    function normalizeText(text) {
        return String(text || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function safeGet(key) {
        try { return window.localStorage.getItem(key); } catch (_e) { return null; }
    }

    function safeSet(key, val) {
        try { window.localStorage.setItem(key, val); } catch (_e) { /* noop */ }
    }

    // Sync search, domain filter & layout mode to URL query without pushing history spam
    function syncUrl() {
        if (!window.history || !window.history.replaceState) return;
        try {
            var url = new URL(window.location.href);
            var rawQ = searchInput ? searchInput.value.trim() : "";
            if (rawQ) url.searchParams.set("q", rawQ);
            else url.searchParams.delete("q");

            if (activeCategory !== "all") url.searchParams.set("domaine", activeCategory);
            else url.searchParams.delete("domaine");

            if (activeView !== "index") url.searchParams.set("vue", activeView);
            else url.searchParams.delete("vue");

            window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        } catch (_e) { /* noop */ }
    }

    function setView(view, persist) {
        activeView = view === "sheets" ? "sheets" : "index";
        if (syllabusList) {
            syllabusList.setAttribute("data-layout", activeView);
        }
        viewBtns.forEach(function (btn) {
            var selected = btn.getAttribute("data-view") === activeView;
            btn.classList.toggle("is-active", selected);
            btn.setAttribute("aria-pressed", String(selected));
        });
        if (persist) {
            safeSet(VIEW_KEY, activeView);
            syncUrl();
        }
    }

    function setCategory(cat) {
        var valid = ["all", "programmation", "sciences", "systemes", "web"];
        activeCategory = valid.indexOf(cat) !== -1 ? cat : "all";
        filterChips.forEach(function (chip) {
            var selected = chip.getAttribute("data-filter") === activeCategory;
            chip.classList.toggle("is-active", selected);
            chip.setAttribute("aria-pressed", String(selected));
        });
    }

    function updateSyllabus() {
        var rawQuery = searchInput ? searchInput.value.trim() : "";
        var query = normalizeText(rawQuery);
        var hasQuery = query.length > 0;
        var isFiltered = hasQuery || activeCategory !== "all";

        if (clearSearchBtn) clearSearchBtn.hidden = !hasQuery;
        if (searchShortcut) searchShortcut.hidden = hasQuery;
        if (inlineResetBtn) inlineResetBtn.hidden = !isFiltered;

        var visibleSubjects = 0;
        var visibleSupports = 0;

        items.forEach(function (item) {
            var cat = item.getAttribute("data-category") || "";
            var text = normalizeText(item.textContent);
            var keywords = normalizeText(item.getAttribute("data-search") || "");
            var courseIds = (item.getAttribute("data-courses") || "").split(",").filter(Boolean);

            var okCat = activeCategory === "all" || cat === activeCategory;
            var okQuery = !hasQuery || text.indexOf(query) !== -1 || keywords.indexOf(query) !== -1;
            var visible = okCat && okQuery;

            item.hidden = !visible;
            if (visible) {
                visibleSubjects++;
                visibleSupports += courseIds.length || 1;
            }
        });

        if (resultsInfo) {
            if (!isFiltered) {
                resultsInfo.textContent = "9 matières affichées · 17 supports disponibles";
            } else if (visibleSubjects === 0) {
                resultsInfo.textContent = rawQuery
                    ? "Aucune matière ne correspond à « " + rawQuery + " »"
                    : "Aucune matière dans ce filtre";
            } else {
                resultsInfo.textContent =
                    visibleSubjects + (visibleSubjects > 1 ? " matières trouvées · " : " matière trouvée · ") +
                    visibleSupports + (visibleSupports > 1 ? " supports" : " support");
            }
        }

        if (emptyTitle) {
            emptyTitle.textContent = rawQuery
                ? "Rien ne correspond à « " + rawQuery + " »"
                : "Aucune matière ne correspond à ce filtre";
        }
        if (emptyState) emptyState.hidden = visibleSubjects !== 0;
        if (syllabusList) syllabusList.hidden = visibleSubjects === 0;

        syncUrl();
    }

    function resetAllFilters() {
        if (searchInput) searchInput.value = "";
        setCategory("all");
        updateSyllabus();
    }

    // Restore state from URL query or saved view preference
    (function hydrateInitialState() {
        var savedView = safeGet(VIEW_KEY);
        try {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            var dom = params.get("domaine");
            var vue = params.get("vue") || savedView;
            if (q && searchInput) searchInput.value = q;
            if (dom) setCategory(dom);
            if (vue) setView(vue, false);
        } catch (_e) {
            if (savedView) setView(savedView, false);
        }
        updateSyllabus();
    })();

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(updateSyllabus, 80);
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", function () {
            if (searchInput) {
                searchInput.value = "";
                searchInput.focus();
            }
            updateSyllabus();
        });
    }

    [resetFiltersBtn, inlineResetBtn].forEach(function (btn) {
        if (!btn) return;
        btn.addEventListener("click", function () {
            resetAllFilters();
            if (searchInput) searchInput.focus();
        });
    });

    filterChips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            setCategory(chip.getAttribute("data-filter") || "all");
            updateSyllabus();
        });
    });

    viewBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            setView(btn.getAttribute("data-view") || "index", true);
        });
    });

    // Keyboard shortcuts: "/" focuses search, "Escape" clears focused search
    document.addEventListener("keydown", function (event) {
        var tag = document.activeElement ? document.activeElement.tagName : "";
        var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && searchInput) {
            event.preventDefault();
            searchInput.focus();
            var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            searchInput.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
        } else if (event.key === "Escape" && document.activeElement === searchInput && searchInput.value) {
            searchInput.value = "";
            updateSyllabus();
        }
    });

    // -----------------------------------------------------------------------
    // Bookmark & Local Study Progress Hydration
    // -----------------------------------------------------------------------
    function formatRelativeDate(iso) {
        if (!iso) return "";
        try {
            var d = new Date(iso);
            if (isNaN(d.getTime())) return "";
            var diffMin = Math.round((Date.now() - d.getTime()) / 60000);
            if (diffMin < 2) return "Consulté à l'instant";
            if (diffMin < 60) return "Consulté il y a " + diffMin + " min";
            var diffH = Math.round(diffMin / 60);
            if (diffH < 24) return "Consulté il y a " + diffH + " h";
            return "Consulté le " + d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
        } catch (_e) {
            return "";
        }
    }

    function renderStudyProgress() {
        if (!window.StudyNet) return;
        var state = window.StudyNet.readProgress();
        var completed = state.completed || {};
        var doneTotal = Object.keys(completed).length;

        var ratio = document.getElementById("progressRatio");
        var fill = document.getElementById("progressFill");
        var meter = document.getElementById("progressMeter");
        var caption = document.getElementById("progressCaption");
        var resumeLabel = document.getElementById("resumeLabel");
        var resumeLink = document.getElementById("resumeLink");
        var resumeTitle = document.getElementById("resumeTitle");
        var resumeCta = document.getElementById("resumeCta");
        var resumeMeta = document.getElementById("resumeMeta");
        var resetWrap = document.getElementById("bookmarkResetWrap");

        if (ratio) ratio.textContent = doneTotal + " / " + TOTAL_COURSES;
        if (meter) meter.setAttribute("aria-valuenow", String(doneTotal));
        if (fill) {
            var pct = Math.min(100, Math.round((doneTotal / TOTAL_COURSES) * 100));
            fill.style.width = pct + "%";
        }
        if (caption) {
            if (doneTotal === 0) {
                caption.textContent = "Aucun support marqué comme étudié pour l'instant.";
            } else if (doneTotal === TOTAL_COURSES) {
                caption.textContent = "Les 17 supports du programme sont marqués comme étudiés.";
            } else {
                caption.textContent =
                    doneTotal + (doneTotal > 1 ? " supports étudiés" : " support étudié") +
                    " sur les 17 du programme.";
            }
        }

        if (state.last && state.last.path && resumeLink && resumeTitle) {
            if (resumeLabel) resumeLabel.textContent = "Reprendre la lecture";
            resumeLink.href = state.last.path;
            resumeTitle.textContent = state.last.code + " · " + state.last.title;
            if (resumeCta) resumeCta.textContent = "Reprendre →";
            if (resumeMeta) {
                var when = formatRelativeDate(state.last.visitedAt);
                resumeMeta.textContent = state.last.subject + (when ? " · " + when : "");
            }
        } else if (resumeLink && resumeTitle) {
            if (resumeLabel) resumeLabel.textContent = "Point de départ conseillé";
            resumeLink.href = "cours/algorithme/algorithmique.html";
            resumeTitle.textContent = "03 · Algorithmique";
            if (resumeCta) resumeCta.textContent = "Ouvrir →";
            if (resumeMeta) {
                resumeMeta.textContent = "Bases de la logique, pseudo-code, tableaux, tri et exercices corrigés.";
            }
        }

        if (resetWrap) {
            resetWrap.hidden = doneTotal === 0 && !state.last;
        }

        // Decorate each subject row and individual chapter chip
        items.forEach(function (item) {
            var ids = (item.getAttribute("data-courses") || "").split(",").filter(Boolean);
            var doneHere = ids.filter(function (id) { return Boolean(completed[id]); }).length;
            var badge = item.querySelector("[data-subject-status]");
            if (badge) {
                if (doneHere === 0) {
                    badge.hidden = true;
                    badge.textContent = "";
                } else {
                    badge.hidden = false;
                    badge.textContent = ids.length === 1
                        ? "Étudié"
                        : doneHere + "/" + ids.length + " étudiés";
                }
            }
        });

        document.querySelectorAll("[data-chapter-id]").forEach(function (link) {
            var id = link.getAttribute("data-chapter-id");
            link.classList.toggle("is-done", Boolean(completed[id]));
        });
    }

    // Safe inline confirmation for resetting progress (no window.confirm)
    var resetTrigger = document.getElementById("resetProgressTrigger");
    var resetConfirm = document.getElementById("resetProgressConfirm");
    var confirmBtn = document.getElementById("confirmResetBtn");
    var cancelBtn = document.getElementById("cancelResetBtn");

    if (resetTrigger && resetConfirm) {
        resetTrigger.addEventListener("click", function () {
            resetTrigger.hidden = true;
            resetConfirm.hidden = false;
            if (cancelBtn) cancelBtn.focus();
        });
    }
    if (cancelBtn && resetTrigger && resetConfirm) {
        cancelBtn.addEventListener("click", function () {
            resetConfirm.hidden = true;
            resetTrigger.hidden = false;
            resetTrigger.focus();
        });
    }
    if (confirmBtn && resetTrigger && resetConfirm) {
        confirmBtn.addEventListener("click", function () {
            if (window.StudyNet) {
                window.StudyNet.resetProgress();
                window.StudyNet.notify("Progression locale réinitialisée.");
            }
            resetConfirm.hidden = true;
            resetTrigger.hidden = false;
        });
    }

    window.addEventListener("studynet:progress", renderStudyProgress);
    window.addEventListener("pageshow", renderStudyProgress);
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderStudyProgress);
    } else {
        renderStudyProgress();
    }

    // Active section indicator in top navigation
    var navLinks = document.querySelectorAll(".home-nav-link");
    var observed = document.querySelectorAll("#matieres, #methode");
    if ("IntersectionObserver" in window && observed.length) {
        var obs = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var target = "#" + entry.target.id;
                    navLinks.forEach(function (link) {
                        if (link.getAttribute("href") === target) {
                            link.setAttribute("aria-current", "true");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
        );
        observed.forEach(function (sec) { obs.observe(sec); });
    }
})();
