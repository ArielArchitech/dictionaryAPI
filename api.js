//! DATA FETCHING.

/**
 * Fetches word data from the Free Dictionary API.
 * @param {string} word — The word to look up.
 * @returns {Promise<Array>} — Resolves with the raw API array on success.
 * @throws {Error} — Throws a user-friendly error on failure.
 */
async function fetchWordData(word) {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord) throw new Error("Please enter a word to search.");

    const url = `${CONFIG.API_BASE_URL}/${encodeURIComponent(cleanWord)}`;

    const response = await fetch(url);

    if (response.status === 404) {
        throw new Error(`No results found for "${word}". Check spelling and try again.`);
    }

    if (!response.ok) {
        throw new Error(`Something went wrong (${response.status}). Please try again.`);
    }

    const data = await response.json();
    return data; // Raw API array
}