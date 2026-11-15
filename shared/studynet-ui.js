// =========================================================================
// STUDYNET — GLOBAL UI/UX SHELL, THEME, PROGRESS, CATALOGUE & ONBOARDING
// Zero external dependencies. Safe storage, keyboard a11y & reduced motion.
// =========================================================================

(function () {
    "use strict";

    var THEME_KEY = "studynet:theme";
    var PROGRESS_KEY = "studynet:progress:v1";
    var ONBOARD_KEY = "studynet:onboard:v1:done";
    var SIDEBAR_KEY = "studynet:sidebar:collapsed";

    // Complete L1 TI syllabus registry (strictly URL-encoded, exact case)
    var CATALOGUE = [
        { id: "elec", code: "01", title: "Électricité & Arduino Uno", subject: "Électricité", domain: "Sciences & Maths", path: "cours/electricite/electricite.html" },
        { id: "math-lim", code: "02.1", title: "Limites et continuité", subject: "Mathématiques", domain: "Sciences & Maths", hub: "cours/math/mathematiques.html", path: "cours/math/les%20chapitres/limites-continuite/limites-continuite.html" },
        { id: "math-der", code: "02.2", title: "Dérivabilité", subject: "Mathématiques", domain: "Sciences & Maths", hub: "cours/math/mathematiques.html", path: "cours/math/les%20chapitres/derivabilite/derivabilite.html" },
        { id: "math-tri", code: "02.3", title: "Fonctions trigonométriques", subject: "Mathématiques", domain: "Sciences & Maths", hub: "cours/math/mathematiques.html", path: "cours/math/les%20chapitres/fonctions-sinusoidales/fonctions-sinusoidales.html" },
        { id: "math-dl", code: "02.4", title: "Développements limités", subject: "Mathématiques", domain: "Sciences & Maths", hub: "cours/math/mathematiques.html", path: "cours/math/les%20chapitres/developpements-limites/developpements-limites.html" },
        { id: "algo", code: "03", title: "Algorithmique", subject: "Algorithmique", domain: "Programmation", path: "cours/algorithme/algorithmique.html" },
        { id: "os", code: "04", title: "Systèmes d'exploitation & Linux", subject: "Systèmes d'exploitation", domain: "Systèmes & Archi", path: "cours/systeme%20d%27exploitation/systemes-exploitation.html" },
        { id: "python", code: "05", title: "Programmation Python", subject: "Python", domain: "Programmation", path: "cours/language%20python/python.html" },
        { id: "fond-arch", code: "06.1", title: "Architecture des ordinateurs", subject: "Fondamentaux", domain: "Systèmes & Archi", hub: "cours/Fondamentaux/fondamentaux-informatique.html", path: "cours/Fondamentaux/les%20chapitres/Architecture-des-ordinateurs-L1TI/Architecture-des-ordinateurs-L1TI.html" },
        { id: "fond-rep", code: "06.2", title: "Représentation de l'information", subject: "Fondamentaux", domain: "Systèmes & Archi", hub: "cours/Fondamentaux/fondamentaux-informatique.html", path: "cours/Fondamentaux/les%20chapitres/Representation-information-machine-L1TI/Representation-information-machine-L1TI.html" },
        { id: "tp-math", code: "07", title: "TP Mathématiques (GNU Octave)", subject: "TP Mathématiques", domain: "Sciences & Maths", path: "cours/tp%20math/tp-mathematiques.html" },
        { id: "web-gen", code: "08.1", title: "Généralités et notions de base", subject: "Langages Web", domain: "Web", hub: "cours/web/langages-web.html", path: "cours/web/les%20chapitres/Generalites-et-notions-de-base/Generalites-et-notions-de-base.htm" },
        { id: "web-html", code: "08.2", title: "HTML & CSS", subject: "Langages Web", domain: "Web", hub: "cours/web/langages-web.html", path: "cours/web/les%20chapitres/html_css/html_css.html" },
        { id: "web-php", code: "08.3", title: "PHP & formulaires", subject: "Langages Web", domain: "Web", hub: "cours/web/langages-web.html", path: "cours/web/les%20chapitres/php/PHP.html" },
        { id: "web-sql", code: "08.4", title: "Bases de données & SQL", subject: "Langages Web", domain: "Web", hub: "cours/web/langages-web.html", path: "cours/web/les%20chapitres/SQL-bases-de-donnees/SQL-bases-de-donnees.html" },
        { id: "web-js", code: "08.5", title: "JavaScript", subject: "Langages Web", domain: "Web", hub: "cours/web/langages-web.html", path: "cours/web/les%20chapitres/JavaScript/JavaScript.html" },
        { id: "lang-c", code: "09", title: "Langage C", subject: "Langage C", domain: "Programmation", path: "cours/language%20c/langage-c.html" }
    ];

    // Safe localStorage helpers (never throw in private mode or sandboxed iframes)
    function storageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (_e) {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
            return true;
        } catch (_e) {
            return false;
        }
    }

    function storageRemove(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (_e) { /* noop */ }
    }

    function normalize(str) {
        return String(str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function getRootPrefix() {
        var attr = document.documentElement.getAttribute("data-sn-root");
        if (attr !== null) return attr;
        return "";
    }

    function resolveUrl(relPath) {
        var prefix = getRootPrefix();
        if (!prefix || prefix === ".") return relPath;
        return prefix.replace(/\/+$/, "") + "/" + relPath;
    }

    // -----------------------------------------------------------------------
    // 1. Polite live region & non-blocking toast notifications
    // -----------------------------------------------------------------------
    var liveRegion = null;
    var toastRegion = null;

    function ensureRegions() {
        if (!document.body) return;
        if (!liveRegion) {
            liveRegion = document.createElement("div");
            liveRegion.className = "sn-sr-only";
            liveRegion.setAttribute("role", "status");
            liveRegion.setAttribute("aria-live", "polite");
            liveRegion.setAttribute("aria-atomic", "true");
            document.body.appendChild(liveRegion);
        }
        if (!toastRegion) {
            toastRegion = document.createElement("div");
            toastRegion.className = "sn-toast-region";
            document.body.appendChild(toastRegion);
        }
    }

    function announce(msg) {
        ensureRegions();
        if (!liveRegion) return;
        liveRegion.textContent = "";
        window.setTimeout(function () {
            liveRegion.textContent = msg;
        }, 25);
    }

    function notify(message, tone) {
        ensureRegions();
        if (!toastRegion) return;
        // Keep at most 2 visible notifications
        while (toastRegion.children.length >= 2) {
            toastRegion.removeChild(toastRegion.firstChild);
        }
        var el = document.createElement("div");
        el.className = "sn-toast" + (tone === "warn" ? " sn-toast--warn" : "");
        el.setAttribute("role", tone === "warn" ? "alert" : "status");

        var span = document.createElement("span");
        span.textContent = String(message || "");

        var close = document.createElement("button");
        close.type = "button";
        close.className = "sn-toast-close";
        close.setAttribute("aria-label", "Fermer le message");
        close.textContent = "×";

        function dismiss() {
            if (el.parentNode) el.parentNode.removeChild(el);
        }

        close.addEventListener("click", dismiss);
        el.appendChild(span);
        el.appendChild(close);
        toastRegion.appendChild(el);

        window.setTimeout(dismiss, 4500);
    }

    // -----------------------------------------------------------------------
    // 2. Human error mapper + retry card (never surfaces raw stack traces)
    // -----------------------------------------------------------------------
    function toAppError(err) {
        var ref = Math.random().toString(36).slice(2, 8).toUpperCase();
        var raw = String((err && err.message) || "");
        if (/offline|fetch|network|load|timeout/i.test(raw)) {
            return {
                title: "Connexion interrompue",
                message: "Une ressource externe n'a pas pu se charger. Tes cours et ta progression locale restent intacts.",
                retryable: true,
                ref: ref
            };
        }
        return {
            title: "Affichage partiellement interrompu",
            message: "Une action n'a pas abouti. Rien n'est perdu — tu peux réessayer ou revenir au sommaire.",
            retryable: true,
            ref: ref
        };
    }

    function renderErrorState(container, err, onRetry) {
        if (!container) return;
        var info = err && err.title ? err : toAppError(err);
        container.innerHTML = "";
        var card = document.createElement("div");
        card.className = "sn-error-state";
        card.setAttribute("role", "alert");

        var copy = document.createElement("div");
        copy.className = "sn-error-copy";
        var h3 = document.createElement("h3");
        h3.textContent = info.title;
        var p = document.createElement("p");
        p.textContent = info.message + " ";
        if (info.ref) {
            var refEl = document.createElement("span");
            refEl.className = "sn-error-ref";
            refEl.textContent = "(Réf. " + info.ref + ")";
            p.appendChild(refEl);
        }
        copy.appendChild(h3);
        copy.appendChild(p);

        var actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "0.5rem";

        if (info.retryable && typeof onRetry === "function") {
            var retryBtn = document.createElement("button");
            retryBtn.type = "button";
            retryBtn.className = "sn-btn sn-btn--primary";
            retryBtn.textContent = "Réessayer";
            retryBtn.addEventListener("click", function () {
                if (retryBtn.disabled) return;
                retryBtn.disabled = true;
                retryBtn.setAttribute("aria-busy", "true");
                retryBtn.textContent = "Chargement…";
                Promise.resolve()
                    .then(onRetry)
                    .finally(function () {
                        retryBtn.disabled = false;
                        retryBtn.setAttribute("aria-busy", "false");
                        retryBtn.textContent = "Réessayer";
                    });
            });
            actions.appendChild(retryBtn);
        }

        card.appendChild(copy);
        card.appendChild(actions);
        container.appendChild(card);
    }

    // -----------------------------------------------------------------------
    // 3. Theme system (system default + manual override + meta theme-color)
    // -----------------------------------------------------------------------
    function getEffectiveTheme() {
        var attr = document.documentElement.getAttribute("data-theme");
        if (attr === "dark" || attr === "light") return attr;
        var saved = storageGet(THEME_KEY);
        if (saved === "dark" || saved === "light") return saved;
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    }

    function applyTheme(theme, persist, shouldAnnounce) {
        var next = theme === "dark" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute("content", next === "dark" ? "#151210" : "#FAF7F1");
        }
        if (persist) {
            storageSet(THEME_KEY, next);
        }
        document.querySelectorAll("[data-sn-theme-toggle]").forEach(function (btn) {
            var isDark = next === "dark";
            btn.setAttribute("aria-pressed", String(isDark));
            btn.setAttribute(
                "aria-label",
                isDark ? "Activer le thème clair" : "Activer le thème sombre"
            );
            btn.setAttribute(
                "title",
                isDark ? "Passer en mode clair" : "Passer en mode sombre"
            );
        });
        if (shouldAnnounce) {
            announce(next === "dark" ? "Thème sombre activé" : "Thème clair activé");
        }
    }

    function initTheme() {
        applyTheme(getEffectiveTheme(), false, false);

        document.querySelectorAll("[data-sn-theme-toggle]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var next = getEffectiveTheme() === "dark" ? "light" : "dark";
                applyTheme(next, true, true);
            });
        });

        if (window.matchMedia) {
            var mq = window.matchMedia("(prefers-color-scheme: dark)");
            var onSystemChange = function (e) {
                if (!storageGet(THEME_KEY)) {
                    applyTheme(e.matches ? "dark" : "light", false, false);
                }
            };
            if (typeof mq.addEventListener === "function") {
                mq.addEventListener("change", onSystemChange);
            }
        }
    }

    // -----------------------------------------------------------------------
    // 4. Local Study Progress (completed courses + last visited bookmark)
    // -----------------------------------------------------------------------
    function readProgress() {
        var raw = storageGet(PROGRESS_KEY);
        if (!raw) return { completed: {}, last: null };
        try {
            var parsed = JSON.parse(raw);
            return {
                completed: (parsed && typeof parsed.completed === "object" && parsed.completed) || {},
                last: (parsed && parsed.last) || null
            };
        } catch (_e) {
            return { completed: {}, last: null };
        }
    }

    function writeProgress(state) {
        storageSet(PROGRESS_KEY, JSON.stringify(state));
        window.dispatchEvent(new CustomEvent("studynet:progress", { detail: state }));
    }

    function recordCourseVisit(courseId) {
        var item = CATALOGUE.find(function (c) { return c.id === courseId; });
        if (!item) return;
        var state = readProgress();
        state.last = {
            id: item.id,
            code: item.code,
            title: item.title,
            subject: item.subject,
            path: item.path,
            visitedAt: new Date().toISOString()
        };
        writeProgress(state);
    }

    function toggleCourseDone(courseId) {
        var state = readProgress();
        var nextDone = !state.completed[courseId];
        if (nextDone) {
            state.completed[courseId] = new Date().toISOString();
        } else {
            delete state.completed[courseId];
        }
        writeProgress(state);
        return nextDone;
    }

    function resetProgress() {
        storageRemove(PROGRESS_KEY);
        var empty = { completed: {}, last: null };
        window.dispatchEvent(new CustomEvent("studynet:progress", { detail: empty }));
        return empty;
    }

    function syncMarkButtons(courseId) {
        var state = readProgress();
        var done = Boolean(state.completed[courseId]);
        document.querySelectorAll("[data-sn-mark]").forEach(function (btn) {
            btn.classList.toggle("sn-btn--done", done);
            btn.setAttribute("aria-pressed", String(done));
            var label = btn.querySelector("[data-sn-mark-label]");
            if (label) {
                label.textContent = done ? "Cours étudié" : "Marquer comme étudié";
            } else {
                btn.textContent = done ? "Cours étudié" : "Marquer comme étudié";
            }
        });
    }

    function initCourseTracking() {
        var courseId = document.documentElement.getAttribute("data-sn-course");
        if (!courseId) return;

        recordCourseVisit(courseId);
        syncMarkButtons(courseId);

        document.querySelectorAll("[data-sn-mark]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var done = toggleCourseDone(courseId);
                syncMarkButtons(courseId);
                notify(
                    done
                        ? "Cours marqué comme étudié dans ton sommaire."
                        : "Repère « étudié » retiré pour ce cours."
                );
            });
        });

        // Append previous / next chapter pager before footer if not already present
        var idx = CATALOGUE.findIndex(function (c) { return c.id === courseId; });
        var footer = document.querySelector("footer.sn-footer");
        if (idx !== -1 && footer && !document.querySelector("nav.sn-pager")) {
            var prev = idx > 0 ? CATALOGUE[idx - 1] : null;
            var next = idx < CATALOGUE.length - 1 ? CATALOGUE[idx + 1] : null;
            var nav = document.createElement("nav");
            nav.className = "sn-pager";
            nav.setAttribute("aria-label", "Navigation entre les cours");

            if (prev) {
                var aPrev = document.createElement("a");
                aPrev.className = "sn-pager-link sn-pager-link--prev";
                aPrev.href = resolveUrl(prev.path);
                aPrev.innerHTML =
                    '<span class="sn-pager-dir">← Cours précédent · ' + prev.code + "</span>" +
                    '<span class="sn-pager-title"></span>';
                aPrev.querySelector(".sn-pager-title").textContent = prev.title;
                nav.appendChild(aPrev);
            } else {
                var homeLink = document.createElement("a");
                homeLink.className = "sn-pager-link sn-pager-link--prev";
                homeLink.href = resolveUrl("index.html#matieres");
                homeLink.innerHTML =
                    '<span class="sn-pager-dir">← Sommaire L1 TI</span>' +
                    '<span class="sn-pager-title">Toutes les matières</span>';
                nav.appendChild(homeLink);
            }

            if (next) {
                var aNext = document.createElement("a");
                aNext.className = "sn-pager-link sn-pager-link--next";
                aNext.href = resolveUrl(next.path);
                aNext.innerHTML =
                    '<span class="sn-pager-dir">Cours suivant · ' + next.code + " →</span>" +
                    '<span class="sn-pager-title"></span>';
                aNext.querySelector(".sn-pager-title").textContent = next.title;
                nav.appendChild(aNext);
            } else {
                var endLink = document.createElement("a");
                endLink.className = "sn-pager-link sn-pager-link--next";
                endLink.href = resolveUrl("index.html#matieres");
                endLink.innerHTML =
                    '<span class="sn-pager-dir">Fin du parcours →</span>' +
                    '<span class="sn-pager-title">Revenir au sommaire L1 TI</span>';
                nav.appendChild(endLink);
            }

            footer.parentNode.insertBefore(nav, footer);
        }
    }

    // Decorate hub chapter rows with completion state
    function decorateHubProgress() {
        var nodes = document.querySelectorAll("[data-sn-course-item]");
        if (!nodes.length) return;
        var state = readProgress();
        var doneCount = 0;

        nodes.forEach(function (node) {
            var id = node.getAttribute("data-sn-course-item");
            var isDone = Boolean(state.completed[id]);
            if (isDone) doneCount++;
            node.classList.toggle("is-completed", isDone);
            var badge = node.querySelector("[data-sn-status]");
            if (badge) {
                badge.hidden = !isDone;
                badge.textContent = isDone ? "Étudié" : "";
            }
        });

        var summary = document.querySelector("[data-sn-hub-progress]");
        if (summary) {
            summary.textContent =
                doneCount + " sur " + nodes.length +
                (nodes.length > 1 ? " chapitres étudiés" : " chapitre étudié");
        }
    }

    // -----------------------------------------------------------------------
    // 5. Focus-trap utility for accessible dialogs & drawers
    // -----------------------------------------------------------------------
    function trapFocus(container, event) {
        if (event.key !== "Tab") return;
        var focusables = Array.prototype.slice.call(
            container.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter(function (el) {
            return !el.hidden && el.offsetParent !== null;
        });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    // -----------------------------------------------------------------------
    // 6. Desktop Sidebar Collapse + Mobile TOC Drawer on Course Pages
    // -----------------------------------------------------------------------
    function initCourseNavigation() {
        if (!document.body.classList.contains("sn-course-page")) return;

        var sidebar = document.querySelector("aside.sidebar");
        if (sidebar) {
            document.body.classList.add("sn-has-sidebar");
            if (storageGet(SIDEBAR_KEY) === "1") {
                document.body.classList.add("sn-sidebar-collapsed");
            }
        }

        function syncCollapseBtns() {
            var collapsed = document.body.classList.contains("sn-sidebar-collapsed");
            document.querySelectorAll("[data-sn-sidebar-toggle]").forEach(function (btn) {
                btn.setAttribute("aria-pressed", String(collapsed));
                btn.setAttribute(
                    "aria-label",
                    collapsed ? "Afficher le sommaire latéral" : "Masquer le sommaire latéral"
                );
                btn.setAttribute(
                    "title",
                    collapsed ? "Afficher le sommaire" : "Masquer le sommaire"
                );
            });
        }
        syncCollapseBtns();

        document.querySelectorAll("[data-sn-sidebar-toggle]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var next = !document.body.classList.contains("sn-sidebar-collapsed");
                document.body.classList.toggle("sn-sidebar-collapsed", next);
                storageSet(SIDEBAR_KEY, next ? "1" : "0");
                syncCollapseBtns();
                announce(next ? "Sommaire latéral masqué" : "Sommaire latéral affiché");
            });
        });

        // Mobile TOC drawer — collects links from sidebar or course headings
        var drawerBackdrop = null;
        var drawerEl = null;
        var lastDrawerTrigger = null;

        function collectTocEntries() {
            var entries = [];
            // Top section links first
            document.querySelectorAll(".sn-topnav a").forEach(function (a) {
                entries.push({ type: "link", label: a.textContent.trim(), href: a.getAttribute("href"), clickEl: a });
            });
            if (sidebar) {
                entries.push({ type: "group", label: "Chapitres & sections" });
                sidebar.querySelectorAll("a[href]").forEach(function (a) {
                    var txt = a.textContent.replace(/\s+/g, " ").trim();
                    if (txt) entries.push({ type: "link", label: txt, href: a.getAttribute("href") });
                });
            } else {
                var headings = document.querySelectorAll("main section[id] > h2, main section[id] h2");
                if (headings.length) {
                    entries.push({ type: "group", label: "Sections de la page" });
                    var seen = {};
                    headings.forEach(function (h) {
                        var sec = h.closest("section[id]");
                        if (!sec || seen[sec.id]) return;
                        seen[sec.id] = true;
                        entries.push({ type: "link", label: h.textContent.replace(/\s+/g, " ").trim(), href: "#" + sec.id });
                    });
                }
            }
            return entries;
        }

        function closeDrawer() {
            if (!drawerEl) return;
            drawerEl.hidden = true;
            if (drawerBackdrop) drawerBackdrop.hidden = true;
            document.body.style.overflow = "";
            document.querySelectorAll("[data-sn-toc-open]").forEach(function (b) {
                b.setAttribute("aria-expanded", "false");
            });
            if (lastDrawerTrigger) lastDrawerTrigger.focus();
        }

        function openDrawer(trigger) {
            lastDrawerTrigger = trigger || document.activeElement;
            if (!drawerEl) {
                drawerBackdrop = document.createElement("div");
                drawerBackdrop.className = "sn-drawer-backdrop";
                drawerBackdrop.addEventListener("click", closeDrawer);

                drawerEl = document.createElement("div");
                drawerEl.className = "sn-drawer";
                drawerEl.setAttribute("role", "dialog");
                drawerEl.setAttribute("aria-modal", "true");
                drawerEl.setAttribute("aria-label", "Sommaire du cours");

                var head = document.createElement("div");
                head.className = "sn-drawer-head";
                var title = document.createElement("p");
                title.className = "sn-drawer-title";
                title.textContent = "Sommaire du cours";
                var closeBtn = document.createElement("button");
                closeBtn.type = "button";
                closeBtn.className = "sn-icon-btn";
                closeBtn.setAttribute("aria-label", "Fermer le sommaire");
                closeBtn.textContent = "Fermer";
                closeBtn.addEventListener("click", closeDrawer);
                head.appendChild(title);
                head.appendChild(closeBtn);

                var body = document.createElement("nav");
                body.className = "sn-drawer-body";
                body.setAttribute("aria-label", "Sections du cours");

                drawerEl.appendChild(head);
                drawerEl.appendChild(body);
                drawerEl.addEventListener("keydown", function (e) {
                    if (e.key === "Escape") {
                        e.preventDefault();
                        closeDrawer();
                    } else {
                        trapFocus(drawerEl, e);
                    }
                });

                document.body.appendChild(drawerBackdrop);
                document.body.appendChild(drawerEl);
            }

            var navBody = drawerEl.querySelector(".sn-drawer-body");
            navBody.innerHTML = "";

            // Always include return link at top of mobile drawer
            var backHref = document.documentElement.getAttribute("data-sn-parent") || resolveUrl("index.html#matieres");
            var backLabel = document.documentElement.getAttribute("data-sn-parent-label") || "Toutes les matières";
            var backLink = document.createElement("a");
            backLink.className = "sn-drawer-link";
            backLink.href = backHref;
            backLink.textContent = "← " + backLabel;
            navBody.appendChild(backLink);

            collectTocEntries().forEach(function (entry) {
                if (entry.type === "group") {
                    var g = document.createElement("p");
                    g.className = "sn-drawer-group";
                    g.textContent = entry.label;
                    navBody.appendChild(g);
                } else {
                    var a = document.createElement("a");
                    a.className = "sn-drawer-link";
                    a.href = entry.href;
                    a.textContent = entry.label;
                    a.addEventListener("click", function () {
                        var href = entry.href || "";
                        closeDrawer();
                        if (href.charAt(0) === "#") {
                            window.setTimeout(function () {
                                activateHashTab(href.slice(1));
                            }, 10);
                        }
                    });
                    navBody.appendChild(a);
                }
            });

            drawerBackdrop.hidden = false;
            drawerEl.hidden = false;
            document.body.style.overflow = "hidden";
            if (trigger) trigger.setAttribute("aria-expanded", "true");
            var firstBtn = drawerEl.querySelector("button, a[href]");
            if (firstBtn) firstBtn.focus();
        }

        document.querySelectorAll("[data-sn-toc-open]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openDrawer(btn);
            });
        });

        // Wrap wide course tables so narrow 320px screens scroll cleanly without page overflow
        document.querySelectorAll("table").forEach(function (tbl) {
            if (tbl.closest(".preview-frame, .table-wrap, .table-wrapper, .table-scroll, .sn-table-scroll")) return;
            var wrap = document.createElement("div");
            wrap.className = "sn-table-scroll";
            tbl.parentNode.insertBefore(wrap, tbl);
            wrap.appendChild(tbl);
        });
    }

    // -----------------------------------------------------------------------
    // 7. Quick Course Catalogue Palette (Ctrl+K / Catalogue button)
    // -----------------------------------------------------------------------
    var paletteRoot = null;
    var paletteInput = null;
    var paletteList = null;
    var paletteTrigger = null;
    var activePaletteIdx = 0;

    function renderPaletteResults(query, withSkeleton) {
        if (!paletteList) return;
        var q = normalize(query).trim();
        var state = readProgress();
        var matches = CATALOGUE.filter(function (item) {
            if (!q) return true;
            return normalize(item.code + " " + item.title + " " + item.subject + " " + item.domain).indexOf(q) !== -1;
        });

        function paint() {
            paletteList.innerHTML = "";
            activePaletteIdx = 0;
            if (!matches.length) {
                var empty = document.createElement("li");
                empty.className = "sn-palette-empty";
                empty.textContent = "Aucun cours ne correspond à « " + query.trim() + " ». Essaie « Python », « SQL », « limites » ou « Linux ».";
                paletteList.appendChild(empty);
                return;
            }
            matches.forEach(function (item, i) {
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.className = "sn-palette-item" + (i === 0 ? " is-active" : "");
                a.href = resolveUrl(item.path);

                var main = document.createElement("span");
                main.className = "sn-palette-item-main";
                var code = document.createElement("span");
                code.className = "sn-palette-code";
                code.textContent = item.code;
                var title = document.createElement("span");
                title.className = "sn-palette-title";
                title.textContent = item.title;
                main.appendChild(code);
                main.appendChild(title);
                a.appendChild(main);

                var right = document.createElement("span");
                right.style.display = "inline-flex";
                right.style.alignItems = "center";
                right.style.gap = "0.5rem";

                if (state.completed[item.id]) {
                    var done = document.createElement("span");
                    done.className = "sn-palette-done";
                    done.textContent = "Étudié";
                    right.appendChild(done);
                }

                var sub = document.createElement("span");
                sub.className = "sn-palette-sub";
                sub.textContent = item.subject;
                right.appendChild(sub);

                a.appendChild(right);
                li.appendChild(a);
                paletteList.appendChild(li);
            });
        }

        if (withSkeleton) {
            paletteList.innerHTML =
                '<li class="sn-skeleton-list" aria-hidden="true">' +
                '<div class="sn-skeleton sn-skeleton-row"></div>' +
                '<div class="sn-skeleton sn-skeleton-row"></div>' +
                '<div class="sn-skeleton sn-skeleton-row"></div>' +
                "</li>";
            window.setTimeout(paint, 90);
        } else {
            paint();
        }
    }

    function closePalette() {
        if (!paletteRoot || paletteRoot.hidden) return;
        paletteRoot.hidden = true;
        document.body.style.overflow = "";
        if (paletteTrigger && typeof paletteTrigger.focus === "function") {
            paletteTrigger.focus();
        }
    }

    function openPalette(trigger) {
        paletteTrigger = trigger || document.activeElement;
        var firstOpen = false;
        if (!paletteRoot) {
            firstOpen = true;
            paletteRoot = document.createElement("div");
            paletteRoot.className = "sn-palette";
            paletteRoot.setAttribute("role", "dialog");
            paletteRoot.setAttribute("aria-modal", "true");
            paletteRoot.setAttribute("aria-label", "Accès rapide aux 17 cours");

            var backdrop = document.createElement("div");
            backdrop.className = "sn-palette-backdrop";
            backdrop.addEventListener("click", closePalette);

            var dialog = document.createElement("div");
            dialog.className = "sn-palette-dialog";

            var searchRow = document.createElement("div");
            searchRow.className = "sn-palette-search";
            searchRow.innerHTML =
                '<svg class="sn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>';

            var lbl = document.createElement("label");
            lbl.className = "sn-sr-only";
            lbl.setAttribute("for", "snPaletteInput");
            lbl.textContent = "Rechercher un cours ou un chapitre";

            paletteInput = document.createElement("input");
            paletteInput.type = "search";
            paletteInput.id = "snPaletteInput";
            paletteInput.className = "sn-palette-input";
            paletteInput.placeholder = "Aller à un cours (Python, Dérivabilité, SQL, Linux…)";
            paletteInput.autocomplete = "off";

            var escBtn = document.createElement("button");
            escBtn.type = "button";
            escBtn.className = "sn-icon-btn";
            escBtn.setAttribute("aria-label", "Fermer le catalogue");
            escBtn.textContent = "Échap";
            escBtn.addEventListener("click", closePalette);

            searchRow.appendChild(lbl);
            searchRow.appendChild(paletteInput);
            searchRow.appendChild(escBtn);

            paletteList = document.createElement("ul");
            paletteList.className = "sn-palette-list";

            var foot = document.createElement("div");
            foot.className = "sn-palette-foot";
            foot.innerHTML =
                "<span>17 supports de cours · L1 TI</span>" +
                "<span>↑↓ naviguer · Entrée ouvrir</span>";

            dialog.appendChild(searchRow);
            dialog.appendChild(paletteList);
            dialog.appendChild(foot);
            paletteRoot.appendChild(backdrop);
            paletteRoot.appendChild(dialog);
            document.body.appendChild(paletteRoot);

            paletteInput.addEventListener("input", function () {
                renderPaletteResults(paletteInput.value, false);
            });

            paletteRoot.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    closePalette();
                    return;
                }
                var items = paletteList.querySelectorAll(".sn-palette-item");
                if (e.key === "ArrowDown" && items.length) {
                    e.preventDefault();
                    items[activePaletteIdx].classList.remove("is-active");
                    activePaletteIdx = (activePaletteIdx + 1) % items.length;
                    items[activePaletteIdx].classList.add("is-active");
                    items[activePaletteIdx].scrollIntoView({ block: "nearest" });
                } else if (e.key === "ArrowUp" && items.length) {
                    e.preventDefault();
                    items[activePaletteIdx].classList.remove("is-active");
                    activePaletteIdx = (activePaletteIdx - 1 + items.length) % items.length;
                    items[activePaletteIdx].classList.add("is-active");
                    items[activePaletteIdx].scrollIntoView({ block: "nearest" });
                } else if (e.key === "Enter" && document.activeElement === paletteInput && items[activePaletteIdx]) {
                    e.preventDefault();
                    window.location.href = items[activePaletteIdx].href;
                } else {
                    trapFocus(dialog, e);
                }
            });
        }

        paletteRoot.hidden = false;
        document.body.style.overflow = "hidden";
        paletteInput.value = "";
        var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        renderPaletteResults("", firstOpen && !reduced);
        paletteInput.focus();
    }

    function initPalette() {
        document.querySelectorAll("[data-sn-catalogue-open]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openPalette(btn);
            });
        });

        document.addEventListener("keydown", function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                if (paletteRoot && !paletteRoot.hidden) {
                    closePalette();
                } else {
                    openPalette(document.activeElement);
                }
            }
        });
    }

    // -----------------------------------------------------------------------
    // 8. Offline Status Banner & MathJax Network Resilience + Retry
    // -----------------------------------------------------------------------
    function initResilience() {
        var banner = null;

        function updateOnlineStatus() {
            var online = navigator.onLine !== false;
            if (!online) {
                if (!banner) {
                    banner = document.createElement("div");
                    banner.className = "sn-offline-banner";
                    banner.setAttribute("role", "status");
                    banner.setAttribute("aria-live", "polite");
                    banner.innerHTML =
                        '<div class="sn-offline-inner">' +
                        '<span><span class="sn-offline-label">Mode hors ligne.</span>Les cours déjà ouverts restent lisibles et ta progression locale est conservée.</span>' +
                        "</div>";
                    var topbar = document.querySelector("header.sn-topbar");
                    if (topbar && topbar.nextSibling) {
                        topbar.parentNode.insertBefore(banner, topbar.nextSibling);
                    } else {
                        document.body.prepend(banner);
                    }
                }
                banner.hidden = false;
            } else if (banner) {
                banner.hidden = true;
                notify("Connexion rétablie.");
            }
        }

        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);
        updateOnlineStatus();

        // MathJax fallback with Retry on developpements-limites.html
        var mjScript = document.querySelector('script[src*="mathjax"]');
        if (mjScript) {
            var slot = document.createElement("div");
            var hero = document.querySelector(".sn-course-hero");
            if (hero && hero.nextSibling) {
                hero.parentNode.insertBefore(slot, hero.nextSibling);
            }
            var showMjFallback = function () {
                if (window.MathJax && window.MathJax.typesetPromise) {
                    slot.innerHTML = "";
                    return;
                }
                renderErrorState(
                    slot,
                    {
                        title: "Rendu des formules MathJax indisponible",
                        message: "La bibliothèque de formules n'a pas pu se charger (connexion lente ou hors ligne). Le cours et les formules source restent lisibles.",
                        retryable: true,
                        ref: "MATHJAX"
                    },
                    function () {
                        return new Promise(function (resolve) {
                            var s = document.createElement("script");
                            s.src = mjScript.src;
                            s.async = true;
                            s.onload = function () {
                                slot.innerHTML = "";
                                if (window.MathJax && window.MathJax.typesetPromise) {
                                    window.MathJax.typesetPromise();
                                }
                                notify("Formules mathématiques chargées.");
                                resolve();
                            };
                            s.onerror = function () {
                                notify("Toujours hors ligne — réessaie dès que la connexion revient.", "warn");
                                resolve();
                            };
                            document.head.appendChild(s);
                        });
                    }
                );
            };
            mjScript.addEventListener("error", showMjFallback);
            window.setTimeout(function () {
                if (!window.MathJax || !window.MathJax.typesetPromise) {
                    showMjFallback();
                }
            }, 9000);
        }

        // Print buttons
        document.querySelectorAll("[data-sn-print]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                window.print();
            });
        });
    }

    // -----------------------------------------------------------------------
    // 9. Reading progress bar, back-to-top button & hash tab deep-linking
    // -----------------------------------------------------------------------
    function activateHashTab(explicitHash) {
        var rawHash = (explicitHash || (window.location.hash || "").replace(/^#/, "")).trim();
        if (!rawHash) return;

        var aliases = {
            cours: ["cours", "course"],
            course: ["course", "cours"],
            exercices: ["exercices", "projects", "projets"],
            projects: ["projects", "exercices", "projets"],
            projets: ["projets", "projects", "exercices"],
            quiz: ["quiz"]
        };

        var candidates = aliases[rawHash] || [rawHash];
        var targetId = null;
        for (var i = 0; i < candidates.length; i++) {
            if (document.getElementById(candidates[i])) {
                targetId = candidates[i];
                break;
            }
        }
        if (!targetId) return;

        var dataBtn = document.querySelector('.nav-btn[data-section="' + targetId + '"]');
        if (dataBtn) {
            dataBtn.click();
            return;
        }
        if (typeof window.showSection === "function") {
            var phpBtn = document.querySelector(".nav-btn[onclick*=\"'" + targetId + "'\"]");
            if (phpBtn) {
                window.showSection(targetId, phpBtn);
                return;
            }
        }
        if (typeof window.showTab === "function") {
            var tabEl = document.getElementById(targetId);
            if (tabEl && tabEl.classList.contains("section")) {
                document.querySelectorAll(".section").forEach(function (s) { s.classList.remove("active"); });
                document.querySelectorAll(".tab").forEach(function (t) {
                    var oc = t.getAttribute("onclick") || "";
                    t.classList.toggle("active", oc.indexOf("'" + targetId + "'") !== -1);
                });
                tabEl.classList.add("active");
                return;
            }
        }
        if (typeof window.showPart === "function") {
            var partBtn = document.querySelector(".tabs button[onclick*=\"'" + targetId + "'\"]");
            if (partBtn) {
                window.showPart(targetId, partBtn);
            }
        }
    }

    function initScrollChrome() {
        var progress = document.createElement("div");
        progress.className = "sn-progress";
        progress.setAttribute("aria-hidden", "true");
        var bar = document.createElement("div");
        bar.className = "sn-progress-bar";
        progress.appendChild(bar);
        document.body.prepend(progress);

        var hasNativeTop = Boolean(document.querySelector(".back-top, .backtop, #backTop, #backToTop"));
        var topBtn = null;
        if (!hasNativeTop) {
            topBtn = document.createElement("button");
            topBtn.type = "button";
            topBtn.className = "sn-top-btn";
            topBtn.setAttribute("aria-label", "Remonter en haut de la page");
            topBtn.title = "Haut de page";
            topBtn.textContent = "↑";
            topBtn.addEventListener("click", function () {
                var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
            });
            document.body.appendChild(topBtn);
        }

        function onScroll() {
            var scrollTop = window.scrollY || document.documentElement.scrollTop;
            var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var pct = docH > 0 ? Math.min(100, (scrollTop / docH) * 100) : 0;
            bar.style.width = pct.toFixed(2) + "%";
            if (topBtn) {
                topBtn.classList.toggle("is-visible", scrollTop > 480);
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        onScroll();

        // Topnav links on tabbed courses activate the corresponding tab cleanly
        document.querySelectorAll(".sn-topnav a[href^='#']").forEach(function (a) {
            a.addEventListener("click", function () {
                var h = (a.getAttribute("href") || "").slice(1);
                window.setTimeout(function () { activateHashTab(h); }, 10);
            });
        });

        activateHashTab();
        window.addEventListener("hashchange", function () { activateHashTab(); });
    }

    // -----------------------------------------------------------------------
    // 10. Guided Spotlight Coach Mark Tour (4 steps, skippable, replayable)
    // -----------------------------------------------------------------------
    var TOUR_STEPS = [
        {
            target: "snTourSearch",
            title: "Trouve une matière en une seconde",
            body: "Appuie sur « / » pour filtrer par matière, langage ou notion, ou combine avec un filtre de domaine."
        },
        {
            target: "snTourSyllabus",
            title: "Accède directement aux 17 supports",
            body: "Chaque ligne du sommaire ouvre la matière complète ou l'un de ses chapitres (cours, exercices, quiz)."
        },
        {
            target: "snTourBookmark",
            title: "Reprends là où tu t'es arrêté",
            body: "Ton dernier cours ouvert et les chapitres marqués « étudiés » restent enregistrés sur cet appareil, sans compte."
        },
        {
            target: "snTourControls",
            title: "Catalogue rapide et mode sombre",
            body: "Ouvre n'importe quel cours avec Ctrl+K et bascule entre papier clair et mode sombre depuis toutes les pages."
        }
    ];

    var coachLayer = null;
    var coachStepIdx = 0;
    var coachTrigger = null;

    function startTour(trigger) {
        var available = TOUR_STEPS.filter(function (s) {
            return Boolean(document.getElementById(s.target));
        });
        if (!available.length) return;

        coachTrigger = trigger || document.activeElement;
        coachStepIdx = 0;

        if (!coachLayer) {
            coachLayer = document.createElement("div");
            coachLayer.className = "sn-coach-layer";
            coachLayer.setAttribute("role", "dialog");
            coachLayer.setAttribute("aria-modal", "true");
            coachLayer.innerHTML =
                '<div class="sn-coach-scrim"></div>' +
                '<div class="sn-coach-ring" aria-hidden="true"></div>' +
                '<div class="sn-coach-card">' +
                '  <p class="sn-coach-step"></p>' +
                '  <h2 class="sn-coach-title"></h2>' +
                '  <p class="sn-coach-body"></p>' +
                '  <div class="sn-coach-actions">' +
                '    <button type="button" class="sn-btn sn-btn--ghost" data-coach="skip">Passer</button>' +
                '    <div class="sn-coach-nav">' +
                '      <button type="button" class="sn-btn" data-coach="prev">Précédent</button>' +
                '      <button type="button" class="sn-btn sn-btn--primary" data-coach="next">Suivant</button>' +
                "    </div>" +
                "  </div>" +
                '  <div class="sn-coach-dots" aria-hidden="true"></div>' +
                "</div>";
            document.body.appendChild(coachLayer);

            coachLayer.querySelector(".sn-coach-scrim").addEventListener("click", finishTour);
            coachLayer.querySelector('[data-coach="skip"]').addEventListener("click", finishTour);
            coachLayer.querySelector('[data-coach="prev"]').addEventListener("click", function () {
                if (coachStepIdx > 0) {
                    coachStepIdx--;
                    showStep(true);
                }
            });
            coachLayer.querySelector('[data-coach="next"]').addEventListener("click", function () {
                if (coachStepIdx < available.length - 1) {
                    coachStepIdx++;
                    showStep(true);
                } else {
                    finishTour();
                }
            });
            coachLayer.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    finishTour();
                } else {
                    trapFocus(coachLayer.querySelector(".sn-coach-card"), e);
                }
            });
            window.addEventListener("resize", function () {
                if (coachLayer && !coachLayer.hidden) positionCoach();
            }, { passive: true });
            window.addEventListener("scroll", function () {
                if (coachLayer && !coachLayer.hidden) positionCoach();
            }, { passive: true });
        }

        function positionCoach() {
            var step = available[coachStepIdx];
            var target = document.getElementById(step.target);
            if (!target) return;
            var rect = target.getBoundingClientRect();
            var ring = coachLayer.querySelector(".sn-coach-ring");
            var card = coachLayer.querySelector(".sn-coach-card");
            var pad = 6;
            var h = Math.min(rect.height, window.innerHeight * 0.52);

            ring.style.left = Math.max(4, rect.left - pad) + "px";
            ring.style.top = Math.max(4, rect.top - pad) + "px";
            ring.style.width = Math.min(window.innerWidth - 8, rect.width + pad * 2) + "px";
            ring.style.height = (h + pad * 2) + "px";

            var cardW = card.offsetWidth || 340;
            var cardH = card.offsetHeight || 200;
            var left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - cardW - 12));
            var spaceBelow = window.innerHeight - (rect.top + h + 16);
            var top = spaceBelow >= cardH + 12
                ? rect.top + h + 14
                : Math.max(12, rect.top - cardH - 14);

            card.style.left = left + "px";
            card.style.top = Math.min(top, window.innerHeight - cardH - 12) + "px";
        }

        function showStep(scrollToTarget) {
            var step = available[coachStepIdx];
            var target = document.getElementById(step.target);
            coachLayer.setAttribute(
                "aria-label",
                "Visite guidée — étape " + (coachStepIdx + 1) + " sur " + available.length + " : " + step.title
            );
            coachLayer.querySelector(".sn-coach-step").textContent =
                "Étape " + (coachStepIdx + 1) + " sur " + available.length;
            coachLayer.querySelector(".sn-coach-title").textContent = step.title;
            coachLayer.querySelector(".sn-coach-body").textContent = step.body;

            var prevBtn = coachLayer.querySelector('[data-coach="prev"]');
            var nextBtn = coachLayer.querySelector('[data-coach="next"]');
            prevBtn.hidden = coachStepIdx === 0;
            nextBtn.textContent = coachStepIdx === available.length - 1 ? "Terminer" : "Suivant →";

            var dots = coachLayer.querySelector(".sn-coach-dots");
            dots.innerHTML = "";
            for (var i = 0; i < available.length; i++) {
                var d = document.createElement("span");
                d.className = "sn-coach-dot" + (i === coachStepIdx ? " is-active" : "");
                dots.appendChild(d);
            }

            if (scrollToTarget && target) {
                var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
                window.setTimeout(positionCoach, reduced ? 10 : 260);
            } else {
                positionCoach();
            }
            nextBtn.focus();
        }

        function finishTour() {
            storageSet(ONBOARD_KEY, "1");
            if (coachLayer) coachLayer.hidden = true;
            var onboardBar = document.getElementById("snOnboardBar");
            if (onboardBar) onboardBar.hidden = true;
            if (coachTrigger && typeof coachTrigger.focus === "function") {
                coachTrigger.focus();
            }
        }

        coachLayer.hidden = false;
        showStep(true);
    }

    function initOnboarding() {
        document.querySelectorAll("[data-sn-tour-start]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                startTour(btn);
            });
        });

        var onboardBar = document.getElementById("snOnboardBar");
        if (onboardBar) {
            if (!storageGet(ONBOARD_KEY)) {
                onboardBar.hidden = false;
            }
            var dismissBtn = onboardBar.querySelector("[data-sn-tour-dismiss]");
            if (dismissBtn) {
                dismissBtn.addEventListener("click", function () {
                    storageSet(ONBOARD_KEY, "1");
                    onboardBar.hidden = true;
                    announce("Bandeau de bienvenue masqué. Tu peux relancer la visite via le bouton Visite guidée.");
                });
            }
        }
    }

    // Expose public API for homepage & course scripts
    window.StudyNet = {
        catalogue: CATALOGUE,
        notify: notify,
        announce: announce,
        toAppError: toAppError,
        renderErrorState: renderErrorState,
        readProgress: readProgress,
        toggleCourseDone: toggleCourseDone,
        resetProgress: resetProgress,
        openCatalogue: openPalette,
        startTour: startTour,
        resolveUrl: resolveUrl
    };

    function activateHashTab(hash) {
        if (!hash || hash.charAt(0) !== "#") return false;
        var id = hash.slice(1);
        if (!id) return false;

        // html_css.html (.nav-btn[data-section])
        var dsBtn = document.querySelector('.nav-btn[data-section="' + id + '"]');
        if (dsBtn) {
            dsBtn.click();
            return true;
        }
        // PHP.html (showSection)
        if (typeof window.showSection === "function") {
            var phpBtn = document.querySelector('.main-nav .nav-btn[onclick*="\'' + id + '\'"]');
            if (phpBtn) {
                window.showSection(id, phpBtn);
                return true;
            }
        }
        // Generalites-et-notions-de-base.htm (showPart)
        if (typeof window.showPart === "function") {
            var genBtn = document.querySelector('.tabs button[onclick*="\'' + id + '\'"]');
            if (genBtn) {
                window.showPart(id, genBtn);
                return true;
            }
        }
        // limites-continuite.html (showTab)
        if (typeof window.showTab === "function" && (id === "cours" || id === "exercices" || id === "quiz")) {
            window.showTab(id);
            return true;
        }
        return false;
    }

    function initTabHashSync() {
        document.querySelectorAll(".sn-topnav a[href^='#']").forEach(function (link) {
            link.addEventListener("click", function (e) {
                var href = link.getAttribute("href");
                if (activateHashTab(href)) {
                    e.preventDefault();
                    if (window.history && window.history.replaceState) {
                        try { window.history.replaceState(null, "", href); } catch (_err) { /* noop */ }
                    }
                }
            });
        });
        if (window.location.hash) {
            window.setTimeout(function () {
                activateHashTab(window.location.hash);
            }, 0);
        }
        window.addEventListener("hashchange", function () {
            activateHashTab(window.location.hash);
        });
    }

    function boot() {
        initTheme();
        initScrollChrome();
        initCourseTracking();
        decorateHubProgress();
        initCourseNavigation();
        initTabHashSync();
        initPalette();
        initResilience();
        initOnboarding();

        // Update copyright year dynamically
        document.querySelectorAll("[data-sn-year], #currentYear").forEach(function (el) {
            el.textContent = String(new Date().getFullYear());
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
