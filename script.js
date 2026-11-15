// ================================
// RECHERCHE & FILTRAGE DES MATIÈRES
// ================================

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const searchShortcut = document.getElementById("searchShortcut");
const resetFiltersBtn = document.getElementById("resetFilters");
const filterChips = document.querySelectorAll(".filter-chip");
const subjects = document.querySelectorAll(".subject-card");
const subjectsGrid = document.getElementById("subjectsGrid");
const emptyState = document.getElementById("emptyState");
const resultsInfo = document.getElementById("resultsInfo");

let activeCategory = "all";

function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function updateSubjects() {
    const query = searchInput ? normalizeText(searchInput.value.trim()) : "";
    const hasQuery = query.length > 0;
    const isFiltered = hasQuery || activeCategory !== "all";

    if (clearSearchBtn) {
        clearSearchBtn.hidden = !hasQuery;
    }
    if (searchShortcut) {
        searchShortcut.hidden = hasQuery;
    }

    let visibleCount = 0;

    subjects.forEach(function (card) {
        const cardCategory = card.dataset.category || "";
        const cardText = normalizeText(card.textContent);
        const cardKeywords = normalizeText(card.dataset.search || "");

        const matchesCategory =
            activeCategory === "all" || cardCategory === activeCategory;
        const matchesQuery =
            !hasQuery ||
            cardText.includes(query) ||
            cardKeywords.includes(query);

        const isVisible = matchesCategory && matchesQuery;
        card.hidden = !isVisible;

        if (isVisible) {
            visibleCount++;
        }
    });

    if (resultsInfo) {
        if (!isFiltered) {
            resultsInfo.textContent = visibleCount + " matières disponibles";
        } else if (visibleCount === 0) {
            resultsInfo.textContent = "Aucune matière trouvée";
        } else {
            resultsInfo.textContent =
                visibleCount +
                (visibleCount > 1 ? " matières trouvées" : " matière trouvée");
        }
    }

    if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
    }
    if (subjectsGrid) {
        subjectsGrid.hidden = visibleCount === 0;
    }
}

function resetAllFilters() {
    if (searchInput) {
        searchInput.value = "";
    }
    activeCategory = "all";
    filterChips.forEach(function (chip) {
        const isAll = chip.dataset.filter === "all";
        chip.classList.toggle("active", isAll);
        chip.setAttribute("aria-pressed", String(isAll));
    });
    updateSubjects();
}

if (searchInput) {
    searchInput.addEventListener("input", updateSubjects);
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", function () {
        if (searchInput) {
            searchInput.value = "";
            searchInput.focus();
        }
        updateSubjects();
    });
}

if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", function () {
        resetAllFilters();
        if (searchInput) {
            searchInput.focus();
        }
    });
}

filterChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
        activeCategory = chip.dataset.filter || "all";
        filterChips.forEach(function (c) {
            const isSelected = c === chip;
            c.classList.toggle("active", isSelected);
            c.setAttribute("aria-pressed", String(isSelected));
        });
        updateSubjects();
    });
});


// ================================
// MENU DE NAVIGATION MOBILE
// ================================

const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");
const navLinks = document.querySelectorAll(".nav-link");

function setMenuOpen(isOpen) {
    if (!menuToggle || !navigation) return;
    navigation.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Fermer le menu" : "Ouvrir le menu"
    );
}

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", function () {
        const isOpen = !navigation.classList.contains("open");
        setMenuOpen(isOpen);
    });

    navigation.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            setMenuOpen(false);
        });
    });

    document.addEventListener("click", function (event) {
        if (
            navigation.classList.contains("open") &&
            !navigation.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            setMenuOpen(false);
        }
    });
}

// Raccourcis clavier : "/" pour rechercher, "Escape" pour fermer/effacer
document.addEventListener("keydown", function (event) {
    const tag = document.activeElement ? document.activeElement.tagName : "";
    const isTyping = tag === "INPUT" || tag === "TEXTAREA";

    if (event.key === "/" && !isTyping && searchInput) {
        event.preventDefault();
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (event.key === "Escape") {
        if (navigation && navigation.classList.contains("open")) {
            setMenuOpen(false);
            if (menuToggle) menuToggle.focus();
        } else if (document.activeElement === searchInput && searchInput.value) {
            searchInput.value = "";
            updateSubjects();
        }
    }
});


// ================================
// EN-TÊTE AU DÉFILEMENT & LIEN ACTIF
// ================================

function handleScrollHeader() {
    if (!siteHeader) return;
    siteHeader.classList.toggle("scrolled", window.scrollY > 12);
}

window.addEventListener("scroll", handleScrollHeader, { passive: true });
handleScrollHeader();

const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const id = "#" + entry.target.id;
                navLinks.forEach(function (link) {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === id
                    );
                });
            });
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
        observer.observe(section);
    });
}


// ================================
// ANNÉE AUTOMATIQUE
// ================================

const currentYear = document.getElementById("currentYear");
if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}
