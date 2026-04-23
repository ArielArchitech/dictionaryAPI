
//! WORD HISTORY PAGE LOGIC

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

    function clearHistory() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }

    //<> RENDER HISTORY LIST
    function renderHistory() {
        const listEl = document.getElementById("historyList");
        if (!listEl) return;

        const history = getHistory();

        if (history.length === 0) {
            listEl.innerHTML = `
        <p class="emptyHistory" role="status">
        No words searched yet. Go look something up!
        </p>`;
            return;
        }

        listEl.innerHTML = history
            .map((item, idx) => {
                const date = new Date(item.date);
                const formatted = date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
                return `<div
            class="historyItem"
            role="button"
            tabindex="0"
            data-word="${escapeHTML(item.word)}"
            aria-label="Search ${escapeHTML(item.word)} again"
            style="animation-delay: ${idx * 0.04}s">
            <span class="historyWord">${escapeHTML(item.word)}</span>
            <span class="historyDate" aria-label="Searched on ${formatted}">${formatted}</span>
            </div>`;
            })

            .join("");

        /* Click or Enter on history item → go to search.html with that word */
        listEl.querySelectorAll(".historyItem").forEach((item) => {
            const go = () => {
                const word = item.dataset.word;
                if (word) {
                    // Pass the word via sessionStorage so search.html can auto-search it
                    sessionStorage.setItem("autoSearch", word);
                    window.location.href = "search.html";
                }
            };
            item.addEventListener("click", go);
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    go();
                }
            });
        });
    }

    //<> UTILITIES
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    //<> INIT
    function init() {
        applyDarkMode();

        const darkBtn = document.getElementById("darkModeToggle");
        if (darkBtn) darkBtn.addEventListener("click", toggleDarkMode);

        renderHistory();

        /* Clear all history */
        const clearBtn = document.getElementById("clearHistoryBtn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (confirm("Clear your entire word history? This cannot be undone.")) {
                    clearHistory();
                    renderHistory();
                }
            });
        }

        /* Back to search */
        const backBtn = document.getElementById("backToSearchBtn");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                window.location.href = "search.html";
            });
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();