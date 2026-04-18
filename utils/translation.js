/**
 * Safely parses a JSON translation string and returns the value for the active language.
 * Falls back to English, then Hindi, then Gujarati, then any available key, then empty string.
 * @param {string|object} field - The translation field (JSON string or object)
 * @param {string} lang - The active language code (en, hi, gu)
 * @returns {string} - The translated string
 */
export const getTranslated = (field, lang = 'en') => {
    if (!field) return "";
    
    let parsed = field;
    if (typeof field === "string") {
        try {
            parsed = JSON.parse(field);
        } catch (e) {
            // Not a JSON string, return as is if it's a string
            return field;
        }
    }
    
    if (typeof parsed === "object" && parsed !== null) {
        // Safe mapping: try requested lang, then en, then hi, then gu, then first key
        const value = parsed[lang] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
        
        // Ensure we always return a string and not an object/null
        if (value === null || value === undefined) return "";
        if (typeof value === 'object') return ""; // Safety against nested objects
        return String(value);
    }
    
    // Fallback for primitive types
    return (typeof parsed === 'string' || typeof parsed === 'number') ? String(parsed) : "";
};
