
//! SEARCH PAGE LOGIC
// Connects API (api.js) ↔ Render (render.js) ↔ LocalStorage history.

(function () {
    "use strict";

    //<> DARK/LIGHT MODE
    const applyDarkMode = () => {
        if (localStorage.getItem("darkMode") === "true") {
            document.body.classList.add("darkMode");
            const icon = document.querySelector(".darkModeIcon");
            if (icon) icon.textContent = "☀️";
        }
    };

    const toggleDarkMode = () => {
        const isDark = document.body.classList.toggle("darkMode");
        localStorage.setItem("darkMode", isDark);
        const icon = document.querySelector(".darkModeIcon");
        if (icon) icon.textContent = isDark ? "☀️" : "🌙";
    };

    //<> STORAGE HELPERS
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveToHistory(word) {
        const history = getHistory();
        // Remove duplicate (case-insensitive)
        const cleaned = history.filter(
            (item) => item.word.toLowerCase() !== word.toLowerCase()
        );
        // Prepend newest entry
        cleaned.unshift({ word, date: new Date().toISOString() });
        // Keep a max of 50 entries
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(cleaned.slice(0, 50)));
    }

    //<> SEARCH HANDLER
    async function handleSearch(word) {
        const resultsSection = document.getElementById("resultsSection");
        if (!resultsSection) return;

        const query = (word || "").trim();
        if (!query) return;

        // Update input field to reflect the searched term
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = query;

        // Show loading state
        renderLoading(resultsSection);

        try {
            const data = await fetchWordData(query); // api.js
            renderWordResults(resultsSection, data);  // render.js
            saveToHistory(query);
        } catch (err) {
            renderError(resultsSection, err.message); // render.js
        }
    }

    //<> SYNONYM CHIP LISTENER 
    document.addEventListener("synonymSearch", (e) => {
        if (e.detail && e.detail.word) {
            handleSearch(e.detail.word);
        }
    });

    //<> INIT
    function init() {
        applyDarkMode();

        /* Dark mode toggle */
        const darkBtn = document.getElementById("darkModeToggle");
        if (darkBtn) darkBtn.addEventListener("click", toggleDarkMode);

        /* Search form submit */
        const searchForm = document.getElementById("searchForm");
        if (searchForm) {
            searchForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const input = document.getElementById("searchInput");
                if (input) handleSearch(input.value);
            });
        }

        /* Search button click */
        const searchBtn = document.getElementById("searchBtn");
        if (searchBtn) {
            searchBtn.addEventListener("click", () => {
                const input = document.getElementById("searchInput");
                if (input) handleSearch(input.value);
            });
        }

        /* History button */
        const historyBtn = document.getElementById("historyBtn");
        if (historyBtn) {
            historyBtn.addEventListener("click", () => {
                window.location.href = "history.html";
            });
        }
    }

    //<> AUTO SEARCH
    function checkAutoSearch() {
        const word = sessionStorage.getItem("autoSearch");
        if (word) {
            sessionStorage.removeItem("autoSearch");
            handleSearch(word);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        init();
        checkAutoSearch();
    });
})();