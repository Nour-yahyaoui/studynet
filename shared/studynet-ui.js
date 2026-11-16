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

    // -----------------------------------------------------------------------
    // 10. VS Code Dark+ Colorful Multi-Language Syntax Highlighter
    // -----------------------------------------------------------------------
    var VSC_SETS = (function () {
        function toSet(str) {
            var map = Object.create(null);
            str.split(" ").forEach(function (w) { if (w) map[w] = true; });
            return map;
        }
        return {
            sqlKw: toSet(
                "SELECT DISTINCT FROM AND OR NOT IN IS NULL LIKE ILIKE BETWEEN AS " +
                "ASC DESC FETCH FIRST NEXT ROWS ONLY INSERT INTO VALUES " +
                "UPDATE SET DELETE TRUNCATE CREATE ALTER DROP RENAME DATABASE SCHEMA TABLE " +
                "VIEW INDEX SEQUENCE TRIGGER PROCEDURE FUNCTION PRIMARY FOREIGN KEY REFERENCES " +
                "UNIQUE CHECK DEFAULT CONSTRAINT AUTO_INCREMENT IDENTITY ADD COLUMN MODIFY " +
                "CHANGE CASCADE RESTRICT NO ACTION BEGIN START TRANSACTION COMMIT ROLLBACK " +
                "SAVEPOINT GRANT REVOKE TO WITH SHOW TABLES DATABASES DESCRIBE EXPLAIN USE " +
                "TRUE FALSE ENGINE CHARACTER CHARSET COLLATE IF"
            ),
            sqlCtl: toSet(
                "JOIN INNER LEFT RIGHT FULL OUTER CROSS NATURAL ON USING WHERE HAVING " +
                "GROUP ORDER BY LIMIT OFFSET CASE WHEN THEN ELSE END EXISTS UNION INTERSECT " +
                "EXCEPT ALL ANY SOME"
            ),
            sqlType: toSet(
                "INT INTEGER SMALLINT BIGINT TINYINT MEDIUMINT DECIMAL NUMERIC FLOAT DOUBLE " +
                "REAL CHAR VARCHAR NCHAR NVARCHAR TEXT TINYTEXT MEDIUMTEXT LONGTEXT DATE TIME " +
                "DATETIME TIMESTAMP YEAR BOOLEAN BOOL BIT BLOB JSON ENUM SERIAL UNSIGNED"
            ),
            sqlFn: toSet(
                "COUNT SUM AVG MIN MAX COALESCE IFNULL NULLIF CONCAT CONCAT_WS SUBSTRING SUBSTR " +
                "LENGTH CHAR_LENGTH UPPER LOWER TRIM LTRIM RTRIM REPLACE ROUND CEIL CEILING " +
                "FLOOR ABS MOD POWER SQRT NOW CURDATE CURTIME CURRENT_DATE CURRENT_TIME " +
                "CURRENT_TIMESTAMP DATEDIFF TIMESTAMPDIFF DATE_ADD DATE_SUB DATE_FORMAT DAY " +
                "MONTH QUARTER HOUR MINUTE SECOND CAST CONVERT GROUP_CONCAT ROW_NUMBER RANK DENSE_RANK"
            ),
            sqlTableAfter: toSet("FROM JOIN INTO UPDATE TABLE VIEW DATABASE SCHEMA REFERENCES USE DESCRIBE TRUNCATE"),
            jsKw: toSet(
                "const let var function class extends new this super typeof instanceof in of " +
                "delete void static get set debugger"
            ),
            jsCtl: toSet(
                "if else for while do switch case default break continue return try catch " +
                "finally throw async await import from export as yield with"
            ),
            jsConst: toSet("true false null undefined NaN Infinity"),
            jsType: toSet(
                "Array Object String Number Boolean Math Date JSON Promise Map Set WeakMap " +
                "WeakSet RegExp Error TypeError RangeError SyntaxError Symbol URL URLSearchParams " +
                "FormData Headers Request Response Event CustomEvent HTMLElement NodeList " +
                "IntersectionObserver MutationObserver console document window navigator history " +
                "localStorage sessionStorage location"
            ),
            phpKw: toSet(
                "function class interface trait extends implements public protected private " +
                "static final abstract const var new clone instanceof echo print global use " +
                "namespace array callable iterable object string int float bool void mixed self parent and or xor"
            ),
            phpCtl: toSet(
                "if elseif else endif for endfor foreach endforeach while endwhile do switch " +
                "case default endswitch break continue return try catch finally throw match " +
                "include include_once require require_once goto declare yield as die exit"
            ),
            phpConst: toSet("true false null TRUE FALSE NULL PHP_EOL PHP_SELF MYSQLI_ASSOC MYSQLI_NUM MYSQLI_BOTH"),
            pyKw: toSet("def class lambda and or not in is global nonlocal del self cls"),
            pyCtl: toSet(
                "if elif else for while break continue return import from as try except " +
                "finally raise with pass yield assert async await match case"
            ),
            pyConst: toSet("True False None"),
            pyType: toSet(
                "int float str bool list dict set tuple frozenset bytes bytearray range object " +
                "complex type Exception ValueError TypeError KeyError IndexError ZeroDivisionError " +
                "FileNotFoundError IOError RuntimeError AttributeError StopIteration"
            ),
            pyFn: toSet(
                "print input len sum min max abs round sorted reversed enumerate zip map filter " +
                "open isinstance issubclass id hex bin oct ord chr pow divmod any all dir help format super"
            ),
            cKw: toSet(
                "int float double char void long short unsigned signed const static extern " +
                "register volatile auto inline restrict struct union enum typedef sizeof bool _Bool"
            ),
            cCtl: toSet("if else for while do switch case default break continue return goto"),
            cType: toSet(
                "FILE size_t ssize_t ptrdiff_t int8_t int16_t int32_t int64_t uint8_t uint16_t " +
                "uint32_t uint64_t time_t clock_t String Serial byte word boolean Servo LiquidCrystal"
            ),
            cConst: toSet(
                "NULL EOF true false TRUE FALSE EXIT_SUCCESS EXIT_FAILURE INT_MAX INT_MIN " +
                "HIGH LOW INPUT OUTPUT INPUT_PULLUP LED_BUILTIN PI A0 A1 A2 A3 A4 A5 " +
                "SEEK_SET SEEK_CUR SEEK_END stdin stdout stderr"
            ),
            octKw: toSet("function endfunction global persistent"),
            octCtl: toSet(
                "if elseif else endif for endfor while endwhile do until switch case otherwise " +
                "endswitch try catch end_try_catch end return break continue parfor"
            ),
            octConst: toSet("pi inf Inf NaN nan eps ans true false on off realmax realmin"),
            octCmd: toSet(
                "clc clear close hold grid box axis who whos help doc format diary echo more pkg load save"
            ),
            bashCtl: toSet(
                "if then elif else fi for in do done while until case esac function select " +
                "return exit break continue sudo time coproc"
            ),
            bashKw: toSet("local export readonly declare typeset unset alias unalias source set shopt"),
            asmCtl: toSet(
                "JMP JZ JNZ JE JNE JG JGE JL JLE JA JAE JB JBE JC JNC JO JNO JS JNS " +
                "CALL RET IRET CMP TEST LOOP HLT HALT INT NOP STOP END"
            ),
            asmKw: toSet(
                "LOAD STORE LDA STA LDI STI MOV MOVA MOVB ADD SUB MUL IMUL DIV IDIV INC DEC " +
                "NEG AND OR XOR NOT SHL SHR SAL SAR ROL ROR PUSH POP IN OUT LEA XCHG READ WRITE"
            ),
            algoKw: toSet(
                "algorithme variables variable constantes constante type types enregistrement " +
                "finenregistrement fonction finfonction procedure finprocedure debut fin " +
                "entree entrees sortie sorties parametres parametre resultat debutalgorithme finalgorithme"
            ),
            algoCtl: toSet(
                "si alors sinon sinonsi finsi pour de a pas faire finpour tantque fintantque " +
                "repeter jusqu jusqua selon cas autrement finselon retourner renvoyer sortir continuer"
            ),
            algoType: toSet(
                "entier entiers reel reels booleen booleens caractere caracteres chaine chaines " +
                "tableau tableaux matrice liste pile file arbre noeud pointeur fichier"
            ),
            algoConst: toSet("vrai faux nil nul null et ou non xor div mod"),
            algoFn: toSet("lire ecrire afficher saisir allouer liberer longueur racine abs alea"),
            cssValKw: toSet(
                "none auto block inline inline-block flex inline-flex grid inline-grid contents " +
                "relative absolute fixed sticky static hidden visible scroll clip pointer default " +
                "center left right justify start end flex-start flex-end space-between space-around " +
                "space-evenly stretch baseline row column wrap nowrap solid dashed dotted double " +
                "transparent currentColor inherit initial unset revert bold normal italic underline " +
                "uppercase lowercase capitalize cover contain no-repeat repeat border-box content-box " +
                "ease linear ease-in ease-out ease-in-out infinite both forwards backwards white black"
            )
        };
    })();

    var VSC_BRACKET_CLS = ["b1", "b2", "b3"];

    function vscEsc(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Emit token HTML while splitting across newlines so .vsc-line spans stay strictly nested
    function vscSpan(cls, text) {
        if (!text) return "";
        if (!cls) return vscEsc(text);
        if (text.indexOf("\n") === -1) {
            return '<span class="vsc-' + cls + '">' + vscEsc(text) + "</span>";
        }
        return text
            .split("\n")
            .map(function (seg) {
                return seg ? '<span class="vsc-' + cls + '">' + vscEsc(seg) + "</span>" : "";
            })
            .join("\n");
    }

    function vscBracket(ch, depthRef) {
        var cls;
        if (ch === "(" || ch === "[" || ch === "{") {
            cls = VSC_BRACKET_CLS[depthRef.d % 3];
            depthRef.d++;
            return vscSpan(cls, ch);
        }
        depthRef.d = Math.max(0, depthRef.d - 1);
        cls = VSC_BRACKET_CLS[depthRef.d % 3];
        return vscSpan(cls, ch);
    }

    function vscStripAccents(s) {
        return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function vscReadString(src, i, quote, allowDoubleQuoteEscape) {
        var n = src.length;
        var j = i + 1;
        while (j < n) {
            var c = src.charAt(j);
            if (c === "\\") {
                j += 2;
                continue;
            }
            if (c === quote) {
                if (allowDoubleQuoteEscape && src.charAt(j + 1) === quote) {
                    j += 2;
                    continue;
                }
                j++;
                break;
            }
            j++;
        }
        return j;
    }

    function vscFormatCString(raw) {
        // Highlight %d, %.2f, %s and \n, \t inside C/Python/PHP strings like VS Code Dark+
        var out = "";
        var re = /(\\[nrt0\\'"x][0-9a-fA-F]{0,2}|%[-+0 #]*\d*(?:\.\d+)?[hlL]?[diuoxXfFeEgGaAcspn%])/g;
        var last = 0;
        var m;
        while ((m = re.exec(raw)) !== null) {
            if (m.index > last) out += vscSpan("str", raw.slice(last, m.index));
            out += vscSpan("esc", m[0]);
            last = m.index + m[0].length;
        }
        if (last < raw.length) out += vscSpan("str", raw.slice(last));
        return out;
    }

    function vscNextNonSpace(src, idx) {
        var n = src.length;
        while (idx < n && /\s/.test(src.charAt(idx))) idx++;
        return src.charAt(idx) || "";
    }

    function highlightSQL(src) {
        var out = "";
        var i = 0;
        var n = src.length;
        var br = { d: 0 };
        var prevKind = ""; // "tableKw" | "tableName" | "as" | "dot" | "select" | ""

        while (i < n) {
            var c = src.charAt(i);
            var c2 = src.slice(i, i + 2);

            // Whitespace
            if (/\s/.test(c)) {
                var ws = i + 1;
                while (ws < n && /\s/.test(src.charAt(ws))) ws++;
                out += vscEsc(src.slice(i, ws));
                i = ws;
                continue;
            }
            // Single-line SQL comment: -- ... or # ...
            if ((c2 === "--" && (i + 2 >= n || /\s|-/.test(src.charAt(i + 2)))) || c === "#") {
                var le = src.indexOf("\n", i);
                if (le === -1) le = n;
                out += vscSpan("cmt", src.slice(i, le));
                i = le;
                continue;
            }
            // Block comment: /* ... */
            if (c2 === "/*") {
                var ce = src.indexOf("*/", i + 2);
                ce = ce === -1 ? n : ce + 2;
                out += vscSpan("cmt", src.slice(i, ce));
                i = ce;
                continue;
            }
            // Strings: '...' or "..."
            if (c === "'" || c === '"') {
                var se = vscReadString(src, i, c, true);
                out += vscSpan("str", src.slice(i, se));
                i = se;
                prevKind = "";
                continue;
            }
            // Backtick identifier: `col`
            if (c === "`") {
                var be = vscReadString(src, i, "`", true);
                out += vscSpan(prevKind === "tableKw" ? "type" : "var", src.slice(i, be));
                prevKind = prevKind === "tableKw" ? "tableName" : "";
                i = be;
                continue;
            }
            // Numbers
            if (/\d/.test(c)) {
                var nm = src.slice(i).match(/^\d+(?:\.\d+)?/);
                out += vscSpan("num", nm[0]);
                i += nm[0].length;
                prevKind = "";
                continue;
            }
            // Identifiers & SQL keywords (supports French accented names too)
            if (/[A-Za-z_\u00C0-\u017F@]/.test(c)) {
                var wm = src.slice(i).match(/^[A-Za-z0-9_\u00C0-\u017F@]+/);
                var word = wm[0];
                var up = word.toUpperCase();
                var nextCh = vscNextNonSpace(src, i + word.length);
                var rawNext = src.charAt(i + word.length);

                if (prevKind === "dot") {
                    out += vscSpan("var", word);
                    prevKind = "";
                } else if (VSC_SETS.sqlCtl[up]) {
                    out += vscSpan("ctl", word);
                    if (up === "JOIN") prevKind = "tableKw";
                    else if (up === "EXISTS" && prevKind === "tableKw") { /* keep tableKw for CREATE TABLE IF NOT EXISTS */ }
                    else prevKind = "";
                } else if (VSC_SETS.sqlFn[up] && nextCh === "(") {
                    out += vscSpan("fn", word);
                    prevKind = "";
                } else if (VSC_SETS.sqlType[up]) {
                    out += vscSpan("type", word);
                    prevKind = "";
                } else if (VSC_SETS.sqlKw[up]) {
                    out += vscSpan("kw", word);
                    if (VSC_SETS.sqlTableAfter[up]) prevKind = "tableKw";
                    else if (up === "AS") prevKind = "as";
                    else if (up === "SELECT") prevKind = "select";
                    else if (up === "IF" || up === "NOT" || up === "EXISTS") { /* keep tableKw if CREATE TABLE IF NOT EXISTS */ }
                    else prevKind = "";
                } else if (prevKind === "tableKw") {
                    out += vscSpan("type", word);
                    prevKind = rawNext === "." ? "dotPrefix" : "tableName";
                } else if (prevKind === "tableName" || prevKind === "as") {
                    out += vscSpan("sel", word);
                    prevKind = "";
                } else if (rawNext === ".") {
                    out += vscSpan("sel", word);
                    prevKind = "";
                } else if (nextCh === "(") {
                    out += vscSpan("fn", word);
                    prevKind = "";
                } else if (word.charAt(0) === "@") {
                    out += vscSpan("const", word);
                    prevKind = "";
                } else {
                    out += vscSpan("var", word);
                    prevKind = "";
                }
                i += word.length;
                continue;
            }
            // Brackets
            if ("()[]{}".indexOf(c) !== -1) {
                out += vscBracket(c, br);
                prevKind = "";
                i++;
                continue;
            }
            // Dot qualifier
            if (c === ".") {
                out += vscSpan("punct", ".");
                prevKind = "dot";
                i++;
                continue;
            }
            // Wildcard *
            if (c === "*" && (prevKind === "select" || prevKind === "dot" || src.charAt(i - 1) === "(")) {
                out += vscSpan("const", "*");
                prevKind = "";
                i++;
                continue;
            }
            // Semicolon / comma reset context
            if (c === ";" || c === ",") {
                out += vscSpan("punct", c);
                prevKind = "";
                i++;
                continue;
            }
            out += vscSpan("op", c);
            prevKind = "";
            i++;
        }
        return out;
    }

    function highlightCLike(src, mode) {
        // Handles: "javascript", "c", "php-code", "python", "octave"
        var out = "";
        var i = 0;
        var n = src.length;
        var br = { d: 0 };
        var prevWord = "";
        var prevDot = false;
        var lastSigChar = "";

        while (i < n) {
            var c = src.charAt(i);
            var c2 = src.slice(i, i + 2);
            var c3 = src.slice(i, i + 3);

            if (/\s/.test(c)) {
                var ws = i + 1;
                while (ws < n && /\s/.test(src.charAt(ws))) ws++;
                out += vscEsc(src.slice(i, ws));
                i = ws;
                continue;
            }

            // C preprocessor directive at line start: #include <stdio.h>, #define MAX 10
            if (mode === "c" && c === "#" && (i === 0 || src.charAt(i - 1) === "\n" || /^\s*$/.test(src.slice(src.lastIndexOf("\n", i - 1) + 1, i)))) {
                var pe = src.indexOf("\n", i);
                if (pe === -1) pe = n;
                var pline = src.slice(i, pe);
                var pm = pline.match(/^(#\s*[a-zA-Z_]+)(.*)$/);
                if (pm) {
                    out += vscSpan("ctl", pm[1]);
                    var rest = pm[2];
                    var incM = rest.match(/^(\s*)(<[^>]+>|"[^"]+")(.*)$/);
                    if (incM) {
                        out += vscEsc(incM[1]) + vscSpan("str", incM[2]) + highlightCLike(incM[3], "c");
                    } else {
                        var defM = rest.match(/^(\s*)([A-Za-z_]\w*)(.*)$/);
                        if (defM && /define|ifdef|ifndef|undef/.test(pm[1])) {
                            out += vscEsc(defM[1]) + vscSpan("const", defM[2]) + highlightCLike(defM[3], "c");
                        } else {
                            out += highlightCLike(rest, "c");
                        }
                    }
                    i = pe;
                    lastSigChar = "";
                    continue;
                }
            }

            // Comments
            if ((mode === "javascript" || mode === "c" || mode === "php-code") && c2 === "//") {
                var le1 = src.indexOf("\n", i);
                if (le1 === -1) le1 = n;
                out += vscSpan("cmt", src.slice(i, le1));
                i = le1;
                continue;
            }
            if ((mode === "javascript" || mode === "c" || mode === "php-code") && c2 === "/*") {
                var ce1 = src.indexOf("*/", i + 2);
                ce1 = ce1 === -1 ? n : ce1 + 2;
                out += vscSpan("cmt", src.slice(i, ce1));
                i = ce1;
                continue;
            }
            if ((mode === "python" || mode === "php-code" || mode === "octave") && c === "#") {
                var le2 = src.indexOf("\n", i);
                if (le2 === -1) le2 = n;
                out += vscSpan("cmt", src.slice(i, le2));
                i = le2;
                continue;
            }
            if (mode === "octave" && c === "%") {
                var le3 = src.indexOf("\n", i);
                if (le3 === -1) le3 = n;
                out += vscSpan("cmt", src.slice(i, le3));
                i = le3;
                continue;
            }

            // Python triple-quoted strings & f-strings
            if (mode === "python" && /^[fFrRbBuU]{1,2}['"]/.test(src.slice(i, i + 3))) {
                var pfxM = src.slice(i).match(/^([fFrRbBuU]{1,2})("""|'''|["'])/);
                if (pfxM) {
                    var pfx = pfxM[1];
                    var delim = pfxM[2];
                    var isF = /f/i.test(pfx);
                    out += vscSpan("kw", pfx);
                    i += pfx.length;
                    var endIdx;
                    if (delim.length === 3) {
                        var tIdx = src.indexOf(delim, i + 3);
                        endIdx = tIdx === -1 ? n : tIdx + 3;
                    } else {
                        endIdx = vscReadString(src, i, delim, false);
                    }
                    var body = src.slice(i, endIdx);
                    if (isF) {
                        var parts = body.split(/(\{[^{}\n]+\})/);
                        parts.forEach(function (pt) {
                            if (pt.length > 2 && pt.charAt(0) === "{" && pt.charAt(pt.length - 1) === "}") {
                                out += vscSpan("ctl", "{") + highlightCLike(pt.slice(1, -1), "python") + vscSpan("ctl", "}");
                            } else {
                                out += vscSpan("str", pt);
                            }
                        });
                    } else {
                        out += vscSpan("str", body);
                    }
                    i = endIdx;
                    lastSigChar = '"';
                    prevDot = false;
                    continue;
                }
            }
            if (mode === "python" && (c3 === '"""' || c3 === "'''")) {
                var te = src.indexOf(c3, i + 3);
                te = te === -1 ? n : te + 3;
                out += vscSpan("str", src.slice(i, te));
                i = te;
                lastSigChar = '"';
                prevDot = false;
                continue;
            }

            // JS template literal: `...${expr}...`
            if (mode === "javascript" && c === "`") {
                out += vscSpan("str", "`");
                i++;
                var buf = "";
                while (i < n) {
                    var tc = src.charAt(i);
                    if (tc === "\\") {
                        buf += src.slice(i, i + 2);
                        i += 2;
                        continue;
                    }
                    if (tc === "`") {
                        out += vscSpan("str", buf) + vscSpan("str", "`");
                        buf = "";
                        i++;
                        break;
                    }
                    if (tc === "$" && src.charAt(i + 1) === "{") {
                        out += vscSpan("str", buf) + vscSpan("ctl", "${");
                        buf = "";
                        i += 2;
                        var exprStart = i;
                        var bDepth = 1;
                        while (i < n && bDepth > 0) {
                            if (src.charAt(i) === "{") bDepth++;
                            else if (src.charAt(i) === "}") bDepth--;
                            if (bDepth > 0) i++;
                        }
                        out += highlightCLike(src.slice(exprStart, i), "javascript");
                        if (i < n && src.charAt(i) === "}") {
                            out += vscSpan("ctl", "}");
                            i++;
                        }
                        continue;
                    }
                    buf += tc;
                    i++;
                }
                if (buf) out += vscSpan("str", buf);
                lastSigChar = "`";
                prevDot = false;
                continue;
            }

            // Standard strings (in Octave, ' after ident/number/)/] is transpose, not string!)
            if (c === '"' || c === "'") {
                if (mode === "octave" && c === "'" && /[A-Za-z0-9_)\]}]/.test(lastSigChar)) {
                    out += vscSpan("op", "'");
                    i++;
                    lastSigChar = "'";
                    continue;
                }
                var se2 = vscReadString(src, i, c, mode === "octave" && c === "'");
                var sraw = src.slice(i, se2);
                if (mode === "c" && c === '"') {
                    out += vscFormatCString(sraw);
                } else if (mode === "php-code" && c === '"') {
                    // Highlight $variable interpolation inside PHP double-quoted strings
                    var pParts = sraw.split(/(\$[A-Za-z_]\w*)/);
                    pParts.forEach(function (pp) {
                        out += pp.charAt(0) === "$" ? vscSpan("var", pp) : vscFormatCString(pp);
                    });
                } else {
                    out += vscFormatCString(sraw);
                }
                i = se2;
                lastSigChar = c;
                prevDot = false;
                prevWord = "";
                continue;
            }

            // Python decorator @name
            if (mode === "python" && c === "@") {
                var dm = src.slice(i).match(/^@[A-Za-z_][\w.]*/);
                if (dm) {
                    out += vscSpan("fn", dm[0]);
                    i += dm[0].length;
                    lastSigChar = "a";
                    continue;
                }
            }

            // PHP variables $nom, $_POST
            if (mode === "php-code" && c === "$" && /[A-Za-z_]/.test(src.charAt(i + 1) || "")) {
                var vm = src.slice(i).match(/^\$[A-Za-z_]\w*/);
                var vname = vm[0];
                var isSuper = /^\$_(GET|POST|SESSION|COOKIE|SERVER|FILES|REQUEST|ENV|GLOBALS)$/.test(vname);
                out += vscSpan(isSuper ? "const" : "var", vname);
                i += vname.length;
                lastSigChar = "a";
                prevDot = false;
                prevWord = vname;
                continue;
            }

            // Numbers (hex, binary, scientific, decimal)
            if (/\d/.test(c) || (c === "." && /\d/.test(src.charAt(i + 1) || ""))) {
                var numM = src.slice(i).match(/^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFlLuU]*|\.\d+(?:[eE][+-]?\d+)?)/);
                if (numM) {
                    out += vscSpan("num", numM[0]);
                    i += numM[0].length;
                    lastSigChar = "0";
                    prevDot = false;
                    prevWord = "";
                    continue;
                }
            }

            // Identifiers & keywords
            if (/[A-Za-z_\u00C0-\u017F]/.test(c)) {
                var idM = src.slice(i).match(/^[A-Za-z0-9_\u00C0-\u017F]+/);
                var id = idM[0];
                var nxt = vscNextNonSpace(src, i + id.length);
                var cls = "var";

                if (prevDot) {
                    cls = nxt === "(" ? "fn" : "var";
                } else if (prevWord === "function" || prevWord === "def") {
                    cls = "fn";
                } else if (prevWord === "class" || prevWord === "struct" || prevWord === "enum" || prevWord === "new" || prevWord === "extends" || prevWord === "implements") {
                    cls = "type";
                } else if (mode === "javascript") {
                    if (VSC_SETS.jsCtl[id]) cls = "ctl";
                    else if (VSC_SETS.jsKw[id]) cls = "kw";
                    else if (VSC_SETS.jsConst[id]) cls = "const";
                    else if (VSC_SETS.jsType[id]) cls = "type";
                    else if (nxt === "(") cls = "fn";
                    else if (/^[A-Z][A-Z0-9_]{2,}$/.test(id)) cls = "const";
                    else if (/^[A-Z][a-zA-Z0-9]*$/.test(id)) cls = "type";
                } else if (mode === "php-code") {
                    var low = id.toLowerCase();
                    if (VSC_SETS.phpCtl[low]) cls = "ctl";
                    else if (VSC_SETS.phpConst[id] || VSC_SETS.phpConst[low]) cls = "const";
                    else if (VSC_SETS.phpKw[low]) cls = "kw";
                    else if (nxt === "(") cls = "fn";
                    else if (/^[A-Z][A-Z0-9_]{2,}$/.test(id)) cls = "const";
                    else if (/^[A-Z][a-zA-Z0-9]*$/.test(id) || id === "mysqli") cls = "type";
                } else if (mode === "python") {
                    if (VSC_SETS.pyCtl[id]) cls = "ctl";
                    else if (VSC_SETS.pyConst[id]) cls = "const";
                    else if (VSC_SETS.pyKw[id]) cls = "kw";
                    else if (VSC_SETS.pyType[id]) cls = "type";
                    else if (VSC_SETS.pyFn[id] || nxt === "(") cls = "fn";
                    else if (/^[A-Z][A-Z0-9_]{2,}$/.test(id)) cls = "const";
                    else if (/^[A-Z][a-zA-Z0-9]*$/.test(id)) cls = "type";
                } else if (mode === "c") {
                    if (VSC_SETS.cCtl[id]) cls = "ctl";
                    else if (VSC_SETS.cConst[id]) cls = "const";
                    else if (VSC_SETS.cKw[id]) cls = "kw";
                    else if (VSC_SETS.cType[id] || /_t$/.test(id)) cls = "type";
                    else if (nxt === "(") cls = "fn";
                    else if (/^[A-Z][A-Z0-9_]{2,}$/.test(id)) cls = "const";
                } else if (mode === "octave") {
                    if (VSC_SETS.octCtl[id]) cls = "ctl";
                    else if (VSC_SETS.octKw[id]) cls = "kw";
                    else if (VSC_SETS.octConst[id]) cls = "const";
                    else if (nxt === "(" || VSC_SETS.octCmd[id]) cls = "fn";
                }

                out += vscSpan(cls, id);
                prevWord = id;
                prevDot = false;
                lastSigChar = "a";
                i += id.length;
                continue;
            }

            // Member access: . or -> or ::
            if (c2 === "->" || c2 === "::") {
                out += vscSpan("punct", c2);
                prevDot = true;
                lastSigChar = ">";
                i += 2;
                continue;
            }
            if (c2 === "=>") {
                out += vscSpan("kw", "=>");
                prevDot = false;
                lastSigChar = ">";
                i += 2;
                continue;
            }
            if (c === ".") {
                out += vscSpan("punct", ".");
                prevDot = true;
                lastSigChar = ".";
                i++;
                continue;
            }
            if ("()[]{}".indexOf(c) !== -1) {
                out += vscBracket(c, br);
                prevDot = false;
                prevWord = "";
                lastSigChar = c;
                i++;
                continue;
            }
            if (c === ";" || c === "," || c === ":") {
                out += vscSpan("punct", c);
                prevDot = false;
                prevWord = "";
                lastSigChar = c;
                i++;
                continue;
            }
            out += vscSpan("op", c);
            prevDot = false;
            prevWord = "";
            lastSigChar = c;
            i++;
        }
        return out;
    }

    function highlightCSS(src) {
        var out = "";
        var i = 0;
        var n = src.length;
        var br = { d: 0 };
        var inBlock = false;
        var afterColon = false;

        while (i < n) {
            var c = src.charAt(i);
            if (/\s/.test(c)) {
                var ws = i + 1;
                while (ws < n && /\s/.test(src.charAt(ws))) ws++;
                out += vscEsc(src.slice(i, ws));
                i = ws;
                continue;
            }
            if (src.slice(i, i + 2) === "/*") {
                var ce = src.indexOf("*/", i + 2);
                ce = ce === -1 ? n : ce + 2;
                out += vscSpan("cmt", src.slice(i, ce));
                i = ce;
                continue;
            }
            if (c === '"' || c === "'") {
                var se = vscReadString(src, i, c, false);
                out += vscSpan("str", src.slice(i, se));
                i = se;
                continue;
            }
            if (c === "{") {
                out += vscBracket(c, br);
                inBlock = br.d > 0;
                afterColon = false;
                i++;
                continue;
            }
            if (c === "}") {
                out += vscBracket(c, br);
                inBlock = br.d > 0;
                afterColon = false;
                i++;
                continue;
            }
            if (c === "@") {
                var am = src.slice(i).match(/^@[a-zA-Z-]+/);
                if (am) {
                    out += vscSpan("ctl", am[0]);
                    i += am[0].length;
                    continue;
                }
            }
            if (!inBlock) {
                // Selector tokens
                var sm = src.slice(i).match(/^[^{,/\s]+/);
                if (sm) {
                    out += vscSpan("sel", sm[0]);
                    i += sm[0].length;
                    continue;
                }
            } else if (!afterColon) {
                if (c === ":") {
                    // Distinguish media/nested selector vs property declaration
                    var semiPos = src.indexOf(";", i);
                    var bracePos = src.indexOf("{", i);
                    if (bracePos !== -1 && (semiPos === -1 || bracePos < semiPos)) {
                        out += vscSpan("sel", ":");
                    } else {
                        out += vscSpan("punct", ":");
                        afterColon = true;
                    }
                    i++;
                    continue;
                }
                var pm = src.slice(i).match(/^--[a-zA-Z0-9_-]+|^-?[a-zA-Z][a-zA-Z0-9-]*/);
                if (pm) {
                    var brace2 = src.indexOf("{", i);
                    var colon2 = src.indexOf(":", i);
                    var semi2 = src.indexOf(";", i);
                    var isNestedSel = brace2 !== -1 && (semi2 === -1 || brace2 < semi2) && (colon2 === -1 || brace2 < colon2);
                    out += vscSpan(isNestedSel ? "sel" : "var", pm[0]);
                    i += pm[0].length;
                    continue;
                }
            } else {
                // Inside property value
                if (c === ";") {
                    out += vscSpan("punct", ";");
                    afterColon = false;
                    i++;
                    continue;
                }
                if (src.slice(i).match(/^!important\b/i)) {
                    var im = src.slice(i).match(/^!important\b/i);
                    out += vscSpan("ctl", im[0]);
                    i += im[0].length;
                    continue;
                }
                if (c === "#") {
                    var hm = src.slice(i).match(/^#[0-9a-fA-F]{3,8}\b/);
                    if (hm) {
                        out += vscSpan("const", hm[0]);
                        i += hm[0].length;
                        continue;
                    }
                }
                var nm = src.slice(i).match(/^-?(?:\d+\.?\d*|\.\d+)(?:%|px|rem|em|vh|vw|vmin|vmax|ch|fr|deg|rad|turn|s|ms|dpi)?/);
                if (nm && nm[0] && nm[0] !== "-") {
                    out += vscSpan("num", nm[0]);
                    i += nm[0].length;
                    continue;
                }
                var vm = src.slice(i).match(/^--[a-zA-Z0-9_-]+|^[a-zA-Z][a-zA-Z0-9-]*/);
                if (vm) {
                    var vw = vm[0];
                    var nx = src.charAt(i + vw.length);
                    if (vw.slice(0, 2) === "--") out += vscSpan("var", vw);
                    else if (nx === "(") out += vscSpan("fn", vw);
                    else if (VSC_SETS.cssValKw[vw]) out += vscSpan("str", vw);
                    else out += vscSpan("var", vw);
                    i += vw.length;
                    continue;
                }
            }
            if ("()[]".indexOf(c) !== -1) {
                out += vscBracket(c, br);
                i++;
                continue;
            }
            out += vscSpan("punct", c);
            i++;
        }
        return out;
    }

    function highlightHTML(src, allowPHP) {
        var out = "";
        var i = 0;
        var n = src.length;

        while (i < n) {
            // PHP embedded block: <?php ... ?> or <?= ... ?>
            if (allowPHP && src.slice(i, i + 2) === "<?") {
                var openM = src.slice(i).match(/^<\?(?:php|=)?/i);
                out += vscSpan("ctl", openM[0]);
                i += openM[0].length;
                var phpEnd = src.indexOf("?>", i);
                if (phpEnd === -1) {
                    out += highlightCLike(src.slice(i), "php-code");
                    break;
                }
                out += highlightCLike(src.slice(i, phpEnd), "php-code");
                out += vscSpan("ctl", "?>");
                i = phpEnd + 2;
                continue;
            }
            // HTML comment: <!-- ... -->
            if (src.slice(i, i + 4) === "<!--") {
                var ce = src.indexOf("-->", i + 4);
                ce = ce === -1 ? n : ce + 3;
                out += vscSpan("cmt", src.slice(i, ce));
                i = ce;
                continue;
            }
            // DOCTYPE
            if (/^<!doctype/i.test(src.slice(i, i + 9))) {
                var de = src.indexOf(">", i);
                de = de === -1 ? n : de + 1;
                out += vscSpan("kw", src.slice(i, de));
                i = de;
                continue;
            }
            // HTML tag: <tag ...> or </tag>
            var tagM = src.slice(i).match(/^(<\/?)([A-Za-z][A-Za-z0-9:-]*)/);
            if (tagM) {
                var isClosing = tagM[1] === "</";
                var tagName = tagM[2];
                var tagLow = tagName.toLowerCase();
                out += vscSpan("punct", tagM[1]) + vscSpan("kw", tagName);
                i += tagM[0].length;

                // Parse attributes until >
                while (i < n) {
                    if (allowPHP && src.slice(i, i + 2) === "<?") {
                        var pe2 = src.indexOf("?>", i + 2);
                        var pChunk = pe2 === -1 ? src.slice(i) : src.slice(i, pe2 + 2);
                        out += highlightHTML(pChunk, true);
                        i += pChunk.length;
                        continue;
                    }
                    var ac = src.charAt(i);
                    if (/\s/.test(ac)) {
                        var aws = i + 1;
                        while (aws < n && /\s/.test(src.charAt(aws))) aws++;
                        out += vscEsc(src.slice(i, aws));
                        i = aws;
                        continue;
                    }
                    if (src.slice(i, i + 2) === "/>") {
                        out += vscSpan("punct", "/>");
                        i += 2;
                        isClosing = true;
                        break;
                    }
                    if (ac === ">") {
                        out += vscSpan("punct", ">");
                        i++;
                        break;
                    }
                    if (ac === "=") {
                        out += vscSpan("punct", "=");
                        i++;
                        continue;
                    }
                    if (ac === '"' || ac === "'") {
                        var ase = vscReadString(src, i, ac, false);
                        out += vscSpan("str", src.slice(i, ase));
                        i = ase;
                        continue;
                    }
                    var anm = src.slice(i).match(/^[^\s=/>"']+/);
                    if (anm) {
                        out += vscSpan("var", anm[0]);
                        i += anm[0].length;
                        continue;
                    }
                    out += vscEsc(ac);
                    i++;
                }

                // Sub-highlight <style>...</style> as CSS and <script>...</script> as JS
                if (!isClosing && (tagLow === "style" || tagLow === "script")) {
                    var closeRe = new RegExp("</" + tagLow + "\\s*>", "i");
                    var cm = closeRe.exec(src.slice(i));
                    var subEnd = cm ? i + cm.index : n;
                    var subCode = src.slice(i, subEnd);
                    out += tagLow === "style" ? highlightCSS(subCode) : highlightCLike(subCode, "javascript");
                    i = subEnd;
                }
                continue;
            }
            // HTML entities: &amp; &lt;
            if (src.charAt(i) === "&") {
                var em = src.slice(i).match(/^&[a-zA-Z0-9#]+;/);
                if (em) {
                    out += vscSpan("const", em[0]);
                    i += em[0].length;
                    continue;
                }
            }
            out += vscEsc(src.charAt(i));
            i++;
        }
        return out;
    }

    function highlightAlgo(src) {
        var out = "";
        var i = 0;
        var n = src.length;
        var br = { d: 0 };
        var prevHeader = false;

        while (i < n) {
            var c = src.charAt(i);
            var c2 = src.slice(i, i + 2);

            if (/\s/.test(c)) {
                var ws = i + 1;
                while (ws < n && /\s/.test(src.charAt(ws))) ws++;
                out += vscEsc(src.slice(i, ws));
                i = ws;
                continue;
            }
            if (c2 === "//") {
                var le = src.indexOf("\n", i);
                if (le === -1) le = n;
                out += vscSpan("cmt", src.slice(i, le));
                i = le;
                continue;
            }
            if (c2 === "/*") {
                var ce = src.indexOf("*/", i + 2);
                ce = ce === -1 ? n : ce + 2;
                out += vscSpan("cmt", src.slice(i, ce));
                i = ce;
                continue;
            }
            if (c === '"' || c === "'") {
                // Handle Jusqu'à gracefully before treating ' as quote
                var se = vscReadString(src, i, c, false);
                out += vscSpan("str", src.slice(i, se));
                i = se;
                prevHeader = false;
                continue;
            }
            if (c === "\u2190" || c2 === "<-") {
                var arrow = c === "\u2190" ? c : c2;
                out += vscSpan("ctl", arrow);
                i += arrow.length;
                prevHeader = false;
                continue;
            }
            if (/\d/.test(c)) {
                var nm = src.slice(i).match(/^\d+(?:\.\d+)?/);
                out += vscSpan("num", nm[0]);
                i += nm[0].length;
                prevHeader = false;
                continue;
            }
            // Match Jusqu'à as single control keyword
            var jq = src.slice(i).match(/^Jusqu['\u2019][àa]/i);
            if (jq) {
                out += vscSpan("ctl", jq[0]);
                i += jq[0].length;
                prevHeader = false;
                continue;
            }
            if (/[A-Za-z_\u00C0-\u017F]/.test(c)) {
                var wm = src.slice(i).match(/^[A-Za-z0-9_\u00C0-\u017F]+/);
                var w = wm[0];
                var norm = vscStripAccents(w);
                var nxt = vscNextNonSpace(src, i + w.length);
                var cls = "var";

                if (prevHeader) {
                    cls = "fn";
                    prevHeader = false;
                } else if (norm === "a" && w !== "À" && w !== "A") {
                    // Lowercase 'a' is normally a variable (Lire(a, b)), whereas 'À' is loop keyword Pour i de 1 À n
                    cls = "var";
                } else if (VSC_SETS.algoCtl[norm]) {
                    cls = "ctl";
                } else if (VSC_SETS.algoKw[norm]) {
                    cls = "kw";
                    if (norm === "algorithme" || norm === "fonction" || norm === "procedure") {
                        prevHeader = true;
                    }
                } else if (VSC_SETS.algoType[norm]) {
                    cls = "type";
                } else if (VSC_SETS.algoConst[norm]) {
                    cls = "const";
                } else if (VSC_SETS.algoFn[norm] || nxt === "(") {
                    cls = "fn";
                }
                out += vscSpan(cls, w);
                i += w.length;
                continue;
            }
            if ("()[]{}".indexOf(c) !== -1) {
                out += vscBracket(c, br);
                prevHeader = false;
                i++;
                continue;
            }
            out += vscSpan("punct", c);
            prevHeader = false;
            i++;
        }
        return out;
    }

    function highlightBashCommand(line) {
        var out = "";
        var i = 0;
        var n = line.length;
        var expectCmd = true;
        var br = { d: 0 };

        while (i < n) {
            var c = line.charAt(i);
            var c2 = line.slice(i, i + 2);
            if (/\s/.test(c)) {
                var ws = i + 1;
                while (ws < n && /\s/.test(line.charAt(ws))) ws++;
                out += vscEsc(line.slice(i, ws));
                i = ws;
                continue;
            }
            if (c === "#" && (i === 0 || /\s/.test(line.charAt(i - 1)))) {
                out += vscSpan("cmt", line.slice(i));
                break;
            }
            if (c === '"' || c === "'") {
                var se = vscReadString(line, i, c, false);
                out += vscSpan("str", line.slice(i, se));
                i = se;
                expectCmd = false;
                continue;
            }
            if (c === "$") {
                var vm = line.slice(i).match(/^\$(?:\{[^}]+\}|[A-Za-z_]\w*|[0-9?$!#@*-])/);
                if (vm) {
                    out += vscSpan("var", vm[0]);
                    i += vm[0].length;
                    expectCmd = false;
                    continue;
                }
            }
            if (c2 === "&&" || c2 === "||" || c === "|" || c === ";") {
                var sep = (c2 === "&&" || c2 === "||") ? c2 : c;
                out += vscSpan("ctl", sep);
                i += sep.length;
                expectCmd = true;
                continue;
            }
            var redir = line.slice(i).match(/^(?:\d*>>|\d*>&\d+|\d*>|<<<|<<|<)/);
            if (redir) {
                out += vscSpan("ctl", redir[0]);
                i += redir[0].length;
                expectCmd = false;
                continue;
            }
            if ("()[]{}".indexOf(c) !== -1) {
                out += vscBracket(c, br);
                i++;
                continue;
            }
            var tokM = line.slice(i).match(/^[^\s"'$|;&<>()[\]{}]+/);
            if (tokM) {
                var tok = tokM[0];
                var eqIdx = tok.indexOf("=");
                if (eqIdx > 0 && /^[A-Za-z_]\w*$/.test(tok.slice(0, eqIdx))) {
                    out += vscSpan("var", tok.slice(0, eqIdx)) + vscSpan("punct", "=") + vscSpan("str", tok.slice(eqIdx + 1));
                } else if (VSC_SETS.bashCtl[tok]) {
                    out += vscSpan("ctl", tok);
                    expectCmd = tok === "sudo" || tok === "time" || tok === "then" || tok === "do" || tok === "else";
                } else if (VSC_SETS.bashKw[tok]) {
                    out += vscSpan("kw", tok);
                    expectCmd = false;
                } else if (expectCmd) {
                    out += vscSpan("fn", tok);
                    expectCmd = false;
                } else if (tok.charAt(0) === "-") {
                    out += vscSpan("kw", tok);
                } else if (/^(?:\/|~\/|\.\.?\/)/.test(tok)) {
                    out += vscSpan("str", tok);
                } else if (/^\d+(?:\.\d+)*$/.test(tok)) {
                    out += vscSpan("num", tok);
                } else {
                    out += vscSpan("var", tok);
                }
                i += tok.length;
                continue;
            }
            out += vscEsc(c);
            i++;
        }
        return out;
    }

    function highlightBash(src) {
        var lines = src.split("\n");
        var hasPrompt = lines.some(function (l) {
            return /^\s*(?:[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+:[^\s$#]*\s*)?[$#]\s+\S/.test(l) &&
                   !/^\s*#\s+[A-ZÀ-Ÿa-z]/.test(l);
        });
        var isScript = /^#!/.test(src.trim()) || /\b(?:if\s+\[|for\s+\w+\s+in|while\s+\[|echo\s+)/.test(src);

        return lines.map(function (line) {
            // Shebang
            if (/^#!/.test(line)) return vscSpan("cmt", line);
            // Box / tree diagram lines (├── └── │ ┌──)
            if (/[\u2500-\u257F]/.test(line)) {
                return highlightTreeSafe(line);
            }
            // Prompt line: user@host:~$ cmd OR $ cmd
            var pm = line.match(/^(\s*(?:[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+:[^\s$#]*\s*)?\$)(\s+)(.*)$/);
            if (pm) {
                return vscSpan("type", pm[1]) + vscEsc(pm[2]) + highlightBashCommand(pm[3]);
            }
            var rm = line.match(/^(\s*root@[a-zA-Z0-9_.-]+:[^\s#]*#)(\s+)(.*)$/);
            if (rm) {
                return vscSpan("ctl", rm[1]) + vscEsc(rm[2]) + highlightBashCommand(rm[3]);
            }
            if (!hasPrompt && isScript) {
                return highlightBashCommand(line);
            }
            if (!hasPrompt && /^\s*(?:gcc|g\+\+|python3?|pip3?|ls|cd|pwd|mkdir|rm|cp|mv|cat|grep|find|chmod|chown|sudo|apt|ps|kill|tar|ssh|curl|wget|man|uname|echo|touch|head|tail|wc|sort|cut|df|du|free|top|id|whoami|hostname)\b/.test(line)) {
                return highlightBashCommand(line);
            }
            // Terminal output line: highlight KEY="VAL", permissions drwxr-xr-x, numbers
            var kv = line.match(/^([A-Z_][A-Z0-9_]*)(=)(.*)$/);
            if (kv) {
                var val = kv[3];
                return vscSpan("var", kv[1]) + vscSpan("punct", "=") + vscSpan("str", val);
            }
            var perm = line.match(/^([-dlcbps][rwxstST-]{9})(\s+)(.*)$/);
            if (perm) {
                return vscSpan("type", perm[1]) + vscEsc(perm[2]) + vscEsc(perm[3]);
            }
            // Generic output line with subtle number coloring
            var out = "";
            var idx = 0;
            var re = /(\b\d+(?:\.\d+)*\b)/g;
            var mm;
            while ((mm = re.exec(line)) !== null) {
                if (mm.index > idx) out += vscEsc(line.slice(idx, mm.index));
                out += vscSpan("num", mm[0]);
                idx = mm.index + mm[0].length;
            }
            if (idx < line.length) out += vscEsc(line.slice(idx));
            return out;
        }).join("\n");
    }

    function highlightTreeSafe(src) {
        // Safe token-by-token coloring for ASCII/Unicode tree, box & schema diagrams
        return src.split("\n").map(function (line) {
            if (/^\s*[-=]{3,}\s*$/.test(line)) return vscSpan("cmt", line);
            if (/^\s*[A-ZÀ-Ÿ][A-ZÀ-Ÿ0-9_ ]+$/.test(line) && line.trim().length <= 36) {
                return vscSpan("type", line);
            }
            if (/^\s*id_[a-zA-Z0-9_]+\s*$/.test(line)) {
                return vscSpan("const", line);
            }
            var out = "";
            var i = 0;
            var n = line.length;
            while (i < n) {
                var sub = line.slice(i);
                var bm = sub.match(/^[\u2500-\u257F\u2190-\u2199|+]+/);
                if (bm) { out += vscSpan("cmt", bm[0]); i += bm[0].length; continue; }
                var cm = sub.match(/^#\s.*$|^\/\/.*$/);
                if (cm) { out += vscSpan("cmt", cm[0]); break; }
                var fm = sub.match(/^[a-zA-Z0-9_.-]+\.(?:php|html?|css|js|sql|py|c|h|m|json|txt|sh|conf|log)\b/);
                if (fm) { out += vscSpan("var", fm[0]); i += fm[0].length; continue; }
                var dm = sub.match(/^\/[a-zA-Z0-9_.-]*|^[a-zA-Z0-9_.-]+\//);
                if (dm) { out += vscSpan("type", dm[0]); i += dm[0].length; continue; }
                var fl = sub.match(/^-[a-zA-Z0-9-]+/);
                if (fl && (i === 0 || /\s/.test(line.charAt(i - 1)))) {
                    out += vscSpan("kw", fl[0]); i += fl[0].length; continue;
                }
                out += vscEsc(line.charAt(i));
                i++;
            }
            return out;
        }).join("\n");
    }

    function highlightAsm(src) {
        return src.split("\n").map(function (line) {
            var out = "";
            var i = 0;
            var n = line.length;
            while (i < n) {
                var c = line.charAt(i);
                if (/\s/.test(c)) {
                    var ws = i + 1;
                    while (ws < n && /\s/.test(line.charAt(ws))) ws++;
                    out += vscEsc(line.slice(i, ws));
                    i = ws;
                    continue;
                }
                if (c === ";" || line.slice(i, i + 2) === "//") {
                    out += vscSpan("cmt", line.slice(i));
                    break;
                }
                var lbl = line.slice(i).match(/^[A-Za-z_]\w*:/);
                if (lbl) {
                    out += vscSpan("fn", lbl[0]);
                    i += lbl[0].length;
                    continue;
                }
                var imm = line.slice(i).match(/^(?:#?-?(?:0[xX][0-9a-fA-F]+|0[bB][01]+|\d+))/);
                if (imm && imm[0] !== "#" && imm[0] !== "-") {
                    out += vscSpan("num", imm[0]);
                    i += imm[0].length;
                    continue;
                }
                var wm = line.slice(i).match(/^[A-Za-z_]\w*/);
                if (wm) {
                    var up = wm[0].toUpperCase();
                    if (VSC_SETS.asmCtl[up]) out += vscSpan("ctl", wm[0]);
                    else if (VSC_SETS.asmKw[up]) out += vscSpan("kw", wm[0]);
                    else out += vscSpan("var", wm[0]);
                    i += wm[0].length;
                    continue;
                }
                out += vscSpan("punct", c);
                i++;
            }
            return out;
        }).join("\n");
    }

    function highlightJSON(src) {
        var out = "";
        var i = 0;
        var n = src.length;
        var br = { d: 0 };
        while (i < n) {
            var c = src.charAt(i);
            if (/\s/.test(c)) {
                var ws = i + 1;
                while (ws < n && /\s/.test(src.charAt(ws))) ws++;
                out += vscEsc(src.slice(i, ws));
                i = ws;
                continue;
            }
            if (c === '"') {
                var se = vscReadString(src, i, '"', false);
                var isKey = vscNextNonSpace(src, se) === ":";
                out += vscSpan(isKey ? "var" : "str", src.slice(i, se));
                i = se;
                continue;
            }
            var nm = src.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
            if (nm) {
                out += vscSpan("num", nm[0]);
                i += nm[0].length;
                continue;
            }
            var kw = src.slice(i).match(/^(?:true|false|null)\b/);
            if (kw) {
                out += vscSpan("kw", kw[0]);
                i += kw[0].length;
                continue;
            }
            if ("()[]{}".indexOf(c) !== -1) {
                out += vscBracket(c, br);
                i++;
                continue;
            }
            out += vscSpan("punct", c);
            i++;
        }
        return out;
    }

    function detectVscLang(src, headerText, courseId) {
        var s = src.trim();
        var h = (headerText || "").toLowerCase();

        // Box-drawing / file-tree / ER entity list
        if (/[\u2514\u251C\u2502\u250C]/.test(s)) return { lang: "schema", label: headerText || "Schéma" };
        if (/^[A-ZÀ-Ÿ_]+\n-{3,}\n/m.test(s) && !/\b(?:SELECT|CREATE)\b/i.test(s)) {
            return { lang: "schema", label: headerText || "Schéma" };
        }
        // Explicit embedded markers
        if (/<\?(?:php|=)/i.test(s)) return { lang: "php", label: headerText || "PHP" };
        if (h === "json" || (/^\{\s*"[^"]+"\s*:/.test(s) && !/;/.test(s))) {
            return { lang: "json", label: headerText || "JSON" };
        }
        if (/^<!doctype\s+html/i.test(s) || /^<(?:html|head|body|div|p|h[1-6]|ul|ol|li|table|form|input|button|section|header|nav|main|footer|a|img|span|label|select|style|script|link|meta)\b/i.test(s)) {
            return { lang: "html", label: headerText || "HTML" };
        }
        if (/^sql\b|\.sql$/i.test(h) || /^(?:(?:--[^\n]*|\/\*[\s\S]*?\*\/)\s*)*(?:SELECT|CREATE\s+(?:TABLE|DATABASE|INDEX|VIEW)|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|ALTER\s+TABLE|DROP\s+(?:TABLE|DATABASE|INDEX|VIEW)|USE\s+\w+|SHOW\s+(?:TABLES|DATABASES)|GRANT\s+|REVOKE\s+|START\s+TRANSACTION|BEGIN)\b/i.test(s)) {
            return { lang: "sql", label: headerText || "SQL" };
        }
        if (/^(?:gcc|g\+\+|python3?|pip3?|\$\s+|sudo\s+|apt\s+|chmod\s+|mkdir\s+|ls\s+)/.test(s) && s.split("\n").length <= 4 && courseId !== "os") {
            return { lang: "bash", label: headerText || "Terminal" };
        }
        if (/^https?:\/\/\S+$/.test(s)) {
            return { lang: "schema", label: headerText || "URL" };
        }

        // Course-specific default grammars
        switch (courseId) {
            case "web-sql":  return { lang: "sql", label: headerText || "SQL" };
            case "web-js":   return { lang: "javascript", label: headerText || "JavaScript" };
            case "web-php":
                if (/\.php\b/.test(h) || /\$[a-zA-Z_]|\becho\b|\bfunction\b/.test(s)) {
                    return { lang: "php-code", cssLang: "php", label: headerText || "PHP" };
                }
                return { lang: "schema", label: headerText || "Structure" };
            case "web-html":
                if (/\{[^}]*:[^}]*\}/.test(s) && !/^</.test(s)) return { lang: "css", label: headerText || "CSS" };
                return { lang: "html", label: headerText || "HTML" };
            case "python":   return { lang: "python", label: headerText || "Python" };
            case "lang-c":   return { lang: "c", label: headerText || "C" };
            case "elec":     return { lang: "c", label: headerText || "Arduino · C++" };
            case "tp-math":  return { lang: "octave", label: headerText || "GNU Octave" };
            case "os":       return { lang: "bash", label: headerText || "Bash · Linux" };
            case "algo":     return { lang: "algo", label: headerText || "Algorithmique" };
            case "fond-arch": return { lang: "asm", label: headerText || "Assembleur" };
            default:         return { lang: "javascript", label: headerText || "Code" };
        }
    }

    function highlightSource(raw, lang) {
        switch (lang) {
            case "sql":        return highlightSQL(raw);
            case "javascript": return highlightCLike(raw, "javascript");
            case "c":          return highlightCLike(raw, "c");
            case "python":     return highlightCLike(raw, "python");
            case "octave":     return highlightCLike(raw, "octave");
            case "php":        return highlightHTML(raw, true);
            case "php-code":   return highlightCLike(raw, "php-code");
            case "html":       return highlightHTML(raw, false);
            case "css":        return highlightCSS(raw);
            case "bash":       return highlightBash(raw);
            case "algo":       return highlightAlgo(raw);
            case "asm":        return highlightAsm(raw);
            case "json":       return highlightJSON(raw);
            case "schema":     return highlightTreeSafe(raw);
            default:           return vscEsc(raw);
        }
    }

    function wrapVscLines(html, lineCount) {
        if (lineCount < 2) return html;
        return html
            .split("\n")
            .map(function (lineHtml) {
                return '<span class="vsc-line">' + lineHtml + "</span>";
            })
            .join("\n");
    }

    function bindCopyFeedback(btn, getText) {
        if (!btn || btn.dataset.vscCopyBound === "1") return;
        btn.dataset.vscCopyBound = "1";
        btn.addEventListener("click", function () {
            btn.classList.add("is-copied");
            window.clearTimeout(btn._vscTimer);
            btn._vscTimer = window.setTimeout(function () {
                btn.classList.remove("is-copied");
            }, 1400);
            if (getText && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(getText()).then(function () {
                    btn.textContent = "Copié ✓";
                    window.clearTimeout(btn._vscLblTimer);
                    btn._vscLblTimer = window.setTimeout(function () {
                        btn.textContent = "Copier";
                    }, 1400);
                }).catch(function () { /* noop */ });
            }
        });
    }

    function enhancePreElement(pre, courseId) {
        if (!pre || pre.dataset.vscReady === "1") return;
        if (pre.closest("iframe")) return;

        var codeEl = pre.querySelector(":scope > code");
        var target = codeEl || pre;
        var raw = (target.textContent || "").replace(/^\n+/, "").replace(/\s+$/, "");
        if (!raw) return;

        pre.dataset.vscReady = "1";
        pre.dataset.vscRaw = raw;

        var wrapper = pre.closest(".code-window, .code-card, .codebox, .sn-vsc-block");
        var headerText = "";
        if (wrapper) {
            var hEl = wrapper.querySelector(".code-header, .sn-vsc-header");
            if (hEl) {
                var existingBtn = hEl.querySelector("button");
                // Extract clean header label (handles both "<span>SQL · JOIN</span>" and "Terminal <span>Exemple</span>")
                var labelParts = [];
                Array.prototype.slice.call(hEl.childNodes).forEach(function (nd) {
                    if (nd === existingBtn) return;
                    var t = (nd.textContent || "").trim();
                    if (t) labelParts.push(t);
                });
                headerText = labelParts.join(" · ");
                var firstEl = hEl.firstElementChild;
                var hasLeadingText = hEl.firstChild && hEl.firstChild.nodeType === 3 && hEl.firstChild.nodeValue.trim();
                if (headerText && (hasLeadingText || !firstEl || firstEl.tagName !== "SPAN")) {
                    var lbl = document.createElement("span");
                    lbl.textContent = headerText;
                    hEl.innerHTML = "";
                    hEl.appendChild(lbl);
                    if (existingBtn) hEl.appendChild(existingBtn);
                }
                if (existingBtn) {
                    bindCopyFeedback(existingBtn, null);
                } else {
                    var addBtn = document.createElement("button");
                    addBtn.type = "button";
                    addBtn.className = "sn-vsc-copy";
                    addBtn.textContent = "Copier";
                    addBtn.setAttribute("aria-label", "Copier le code");
                    bindCopyFeedback(addBtn, function () { return pre.dataset.vscRaw || pre.textContent; });
                    hEl.appendChild(addBtn);
                }
            }
        } else if (pre.parentNode) {
            // Upgrade bare <pre> blocks into full VS Code Dark+ editor windows with Copy button
            wrapper = document.createElement("div");
            wrapper.className = "sn-vsc-block";
            var hdr = document.createElement("div");
            hdr.className = "sn-vsc-header";
            var tabSpan = document.createElement("span");
            tabSpan.className = "sn-vsc-tab";
            var cpBtn = document.createElement("button");
            cpBtn.type = "button";
            cpBtn.className = "sn-vsc-copy";
            cpBtn.textContent = "Copier";
            cpBtn.setAttribute("aria-label", "Copier le code");
            bindCopyFeedback(cpBtn, function () { return pre.dataset.vscRaw || pre.textContent; });
            hdr.appendChild(tabSpan);
            hdr.appendChild(cpBtn);
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(hdr);
            wrapper.appendChild(pre);
        }

        var info = detectVscLang(raw, headerText, courseId);
        var cssLang = info.cssLang || info.lang;
        if (wrapper) {
            wrapper.setAttribute("data-vsc-lang", cssLang);
            var autoTab = wrapper.querySelector(".sn-vsc-tab");
            if (autoTab && !autoTab.textContent) {
                autoTab.textContent = info.label;
            }
        }

        var highlighted = highlightSource(raw, info.lang);
        var lineCount = raw.split("\n").length;
        if (lineCount >= 2 && info.lang !== "schema") {
            pre.classList.add("sn-vsc-numbered");
            target.innerHTML = wrapVscLines(highlighted, lineCount);
        } else {
            target.innerHTML = highlighted;
        }
    }

    function initCodeBlocks() {
        var courseId = document.documentElement.getAttribute("data-sn-course") || "";
        document.querySelectorAll("pre").forEach(function (pre) {
            enhancePreElement(pre, courseId);
        });

        // Automatically highlight dynamically inserted exercise, project & quiz <pre> blocks
        if ("MutationObserver" in window && document.body && document.body.classList.contains("sn-course-page")) {
            var mo = new MutationObserver(function (mutations) {
                mutations.forEach(function (mut) {
                    if (mut.type === "childList") {
                        mut.addedNodes.forEach(function (node) {
                            if (!node || node.nodeType !== 1) return;
                            if (node.tagName === "PRE") {
                                enhancePreElement(node, courseId);
                            } else if (node.querySelectorAll) {
                                node.querySelectorAll("pre").forEach(function (p) {
                                    enhancePreElement(p, courseId);
                                });
                            }
                        });
                    }
                });
            });
            mo.observe(document.body, { childList: true, subtree: true });
        }
    }

    function boot() {
        initTheme();
        initScrollChrome();
        initCourseTracking();
        decorateHubProgress();
        initCourseNavigation();
        initTabHashSync();
        initCodeBlocks();
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
