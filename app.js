
//! LANDING PAGE

(function () {
    "use strict";

    //<> DARK/LIGHT MODE
    const applyDarkMode = () => {
        const saved = localStorage.getItem("darkMode");
        if (saved === "true") {
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

    //<> INIT
    const init = () => {
        applyDarkMode();

        const startBtn = document.getElementById("startBtn");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                window.location.href = "search.html";
            });
        }

        const darkBtn = document.getElementById("darkModeToggle");
        if (darkBtn) {
            darkBtn.addEventListener("click", toggleDarkMode);
        }
    };

    document.addEventListener("DOMContentLoaded", init);
})();