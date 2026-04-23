//! DOM RENDERING - No fetch calls.

//<> AUDIO PLAYER STATE
let currentAudio = null;

/**
 * Renders a loading spinner into the results section.
 * @param {HTMLElement} container
 */
function renderLoading(container) {
    container.innerHTML = `
    <div class="loadingSpinner" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <span>Looking up your word…</span>
    </div>
  `;
}

/**
 * Renders an error message into the results section.
 * @param {HTMLElement} container
 * @param {string} message
 */
function renderError(container, message) {
    container.innerHTML = `
    <div class="errorMessage" role="alert">
      <p>${escapeHTML(message)}</p>
    </div>
  `;
}

/**
 * Renders the full word card(s) from API data into the results section.
 * @param {HTMLElement} container
 * @param {Array}       data — Raw array from dictionaryapi.dev
 */
function renderWordResults(container, data) {
    if (!data || data.length === 0) {
        renderError(container, "No results found.");
        return;
    }

    container.innerHTML = "";

    //! USING THE FIRST API ENTRY OBJECT. 
    const entry = data[0];
    const word = entry.word || "";
    const phonetic = getPhonetic(entry);
    const audioUrl = getAudioUrl(entry);

    const card = document.createElement("article");
    card.className = "wordCard";
    card.setAttribute("aria-label", `Dictionary entry for ${word}`);

    //<> WORD READER
    const headerHTML = buildWordHeader(word, phonetic, audioUrl);

    //<> MEANINGS
    const meaningsHTML = (entry.meanings || [])
        .slice(0, 3)
        .map(buildMeaningBlock)
        .join("");

    card.innerHTML = headerHTML + meaningsHTML;
    container.appendChild(card);

    //<> WIRE UP AUDIO BUTTON AFTER INSERTION
    if (audioUrl) {
        const audioBtn = card.querySelector(`#audioBtn-${sanitizeId(word)}`);
        if (audioBtn) {
            audioBtn.addEventListener("click", () => playAudio(audioUrl, audioBtn));
        }
    }

    //<> WIRE UP SYNONYM CHIPS
    card.querySelectorAll(".synonymChip").forEach((chip) => {
        chip.addEventListener("click", () => {
            const synonymWord = chip.dataset.word;
            if (synonymWord) {
                const event = new CustomEvent("synonymSearch", { detail: { word: synonymWord } });
                document.dispatchEvent(event);
            }
        });
    });
}

//! PRIVATE HELPERS

function getPhonetic(entry) {
    if (entry.phonetic) return entry.phonetic;
    const found = (entry.phonetics || []).find((p) => p.text);
    return found ? found.text : "";
}

function getAudioUrl(entry) {
    const phonetics = entry.phonetics || [];
    //* Prefer a phonetic with both text and audio
    const preferred = phonetics.find((p) => p.audio && p.audio.endsWith(".mp3"));
    if (preferred) return preferred.audio;
    //* Fallback: any audio
    const fallback = phonetics.find((p) => p.audio);
    return fallback ? fallback.audio : null;
}

function buildWordHeader(word, phonetic, audioUrl) {
    const audioBtnId = `audioBtn-${sanitizeId(word)}`;
    const audioControl = audioUrl
        ? `<button
            class="audioBtn"
            id="${audioBtnId}"
            aria-label="Play pronunciation of ${escapeHTML(word)}"
            title="Hear pronunciation"
        >
        ${playIcon()}
        </button>`
        : `<span class="noAudio" aria-label="No audio available">🔇</span>`;

    return `
    <div class="wordHeader">
        <div>
        <h2 class="wordTitle">${escapeHTML(word)}</h2>
        ${phonetic ? `<p class="wordPhonetic" aria-label="Phonetic spelling">${escapeHTML(phonetic)}</p>` : ""}
    </div>
    ${audioControl}
    </div>`;
}

function buildMeaningBlock(meaning) {
    const pos = meaning.partOfSpeech || "";
    const defs = (meaning.definitions || []).slice(0, 3);
    const synonyms = (meaning.synonyms || []).slice(0, 6);

    const defsHTML = defs
        .map((def) => {
            const example = def.example
                ? `<span class="definitionExample" aria-label="Example">"${escapeHTML(def.example)}"</span>`
                : "";
            return `<li class="definitionItem">${escapeHTML(def.definition)}${example}</li>`;
        })
        .join("");

    const synsHTML = synonyms.length > 0 ? `<div class="synonymsBlock" aria-label="Synonyms">
            <span class="synonymsLabel">Synonyms</span>
        ${synonyms.map((s) => `<span class="synonymChip" data-word="${escapeHTML(s)}" role="button" tabindex="0" aria-label="Search synonym ${escapeHTML(s)}">${escapeHTML(s)}</span>`).join("")}
        </div>`
        : "";

    return `
    <div class="meaningBlock">
    ${pos ? `<span class="posTag" aria-label="Part of speech">${escapeHTML(pos)}</span>` : ""}
    <ul class="definitionsList" aria-label="${escapeHTML(pos)} definitions">
        ${defsHTML}
    </ul>
    ${synsHTML}
    </div>
    `;
}

//! AUDIO PLAYBACK

function playAudio(url, btn) {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        document.querySelectorAll(".audioBtn.playing").forEach((b) => {
            b.classList.remove("playing");
            b.setAttribute("aria-label", b.getAttribute("aria-label").replace("Stop", "Play"));
            b.innerHTML = playIcon();
        });
    }

    const audio = new Audio(url);
    currentAudio = audio;

    btn.classList.add("playing");
    btn.innerHTML = stopIcon();

    audio.play().catch(() => {
        btn.classList.remove("playing");
        btn.innerHTML = playIcon();
    });

    audio.addEventListener("ended", () => {
        btn.classList.remove("playing");
        btn.innerHTML = playIcon();
        currentAudio = null;
    });

    //* Clicking again while playing → stop
    btn.onclick = () => {
        audio.pause();
        audio.currentTime = 0;
        btn.classList.remove("playing");
        btn.innerHTML = playIcon();
        currentAudio = null;
        // Re-attach original handler
        btn.onclick = () => playAudio(url, btn);
    };
}

//! SVG ICON

function playIcon() {
    return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
</svg>`;
}

function stopIcon() {
    return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
</svg>`;
}

//! UTILITIES

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function sanitizeId(str) {
    return String(str).replace(/[^a-zA-Z0-9-_]/g, "_");
}