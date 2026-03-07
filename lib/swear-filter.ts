/**
 * Turkish Swear / Profanity Filter
 * Word-boundary matching, Turkish case-insensitive
 * Handles repeated characters (e.g. "siiiktir" → "siktir")
 * Handles character substitutions (e.g. "@mk" → "amk")
 */

// ─── Core profanity list ────────────────────────────────────────
// Organized by severity. Short generic words (mal, salak) removed to avoid false positives.
const PROFANITY_LIST = [
    // Sexual / genital slurs
    "amk", "aq", "amq", "amına", "amina", "amını", "amini", "amınakoyim", "aminakoyim",
    "amcık", "amcik", "amcığ",
    "yarrak", "yarak", "yarrağ", "yarram",
    "sikim", "sikik", "sikis", "sikiş", "sikici",
    "siktir", "siktirgit", "sikeyim", "sikerim", "sikişmek",
    "göt", "got", "götün", "gotun", "götoğlanı", "gotoglani", "götlek",
    "taşak", "tasak", "taşşak", "tassak",
    "döl", "meni",
    "31",

    // Insults targeting family
    "orospu", "oruspu", "orospuçocuğu", "orospucocugu", "oç", "oc",
    "ananı", "anani", "ananızı", "ananizi", "anasını", "anasini",
    "bacını", "bacini", "bacısını",
    "piç", "pic", "piçlik", "piçkurusu",

    // Homosexual slurs
    "ibne", "ibné", "ibneler",
    "götveren", "gotveren",
    "puşt", "pust", "puştluk",
    "top", // too short on its own — covered via compound

    // Prostitution / morality slurs
    "fahişe", "fahise",
    "kaltak",
    "kevaşe", "kevase", "kerane",
    "pezevenk",
    "gavat",

    // Excrement / bodily
    "bok", "boktan", "boklu",

    // General strong insults (kept only strong ones to avoid false positives)
    "şerefsiz", "serefsiz",
    "haysiyetsiz",
    "gerizekalı", "gerizekali",
    "dangalak",
    "andaval",
    "aptal", // strong enough, rare in normal context
    "angut",
    "yavşak", "yavsak",
    "hıyar", "hiyar", // slang insult
    "kodumun", "kodumunun",
    "hassiktir", "hasiktir",
    "sg", // siktir git abbreviation
    "amına koyim", "amk",
    "ananıskim", "ananiskm",
    "mkodumun",
]

/**
 * Normalize Turkish characters for comparison
 */
function turkishLower(text: string): string {
    return text
        .replace(/İ/g, "i")
        .replace(/I/g, "ı")
        .replace(/Ş/g, "ş")
        .replace(/Ç/g, "ç")
        .replace(/Ö/g, "ö")
        .replace(/Ü/g, "ü")
        .replace(/Ğ/g, "ğ")
        .toLowerCase()
}

/**
 * Collapse repeated characters: "siiiktir" → "siktir", "ooorspu" → "orspu"
 */
function collapseRepeats(text: string): string {
    return text.replace(/(.)\1+/g, "$1")
}

/**
 * Normalize common character substitutions used to bypass filters
 */
function normalizeSubstitutions(text: string): string {
    return text
        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/@/g, "a")
        .replace(/\$/g, "s")
        .replace(/!/g, "i")
        .replace(/\*/g, "")   // remove asterisks used as censoring
        .replace(/\./g, "")   // remove dots between letters (s.i.k.t.i.r)
        .replace(/-/g, "")    // remove dashes
        .replace(/_/g, "")    // remove underscores
}

// Turkish word-boundary character class
const TR_WORD = "a-zA-ZçğıöşüÇĞİÖŞÜ0-9"

/**
 * Check if text contains profanity
 */
export function containsSwear(text: string): boolean {
    const normalized = turkishLower(text)
    const collapsed = collapseRepeats(normalizeSubstitutions(normalized))

    return PROFANITY_LIST.some((word) => {
        const lowerWord = turkishLower(word)
        const collapsedWord = collapseRepeats(lowerWord)

        // Skip very short words (<=2 chars) — only match them as whole word or abbreviation
        const isShort = collapsedWord.length <= 2

        // Build regex pattern with word boundaries
        const boundaryStart = isShort ? `(?:^|\\s)` : `(?:^|[^${TR_WORD}])`
        const boundaryEnd = isShort ? `(?:\\s|$)` : `(?:[^${TR_WORD}]|$)`

        const pattern = new RegExp(`${boundaryStart}${escapeRegex(lowerWord)}${boundaryEnd}`, "i")
        const collapsedPattern = new RegExp(`${boundaryStart}${escapeRegex(collapsedWord)}${boundaryEnd}`, "i")

        // Check exact match (entire text is the word)
        if (normalized.trim() === lowerWord || collapsed.trim() === collapsedWord) return true

        // Pad with space for boundary matching at start/end
        const paddedNorm = ` ${normalized} `
        const paddedColl = ` ${collapsed} `

        if (pattern.test(paddedNorm)) return true
        if (collapsedPattern.test(paddedColl)) return true

        return false
    })
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Validate multiple text fields at once. Throws if any contain profanity.
 */
export function validateTexts(...texts: (string | undefined | null)[]): void {
    for (const text of texts) {
        if (text && containsSwear(text)) {
            throw new Error("İçeriğiniz uygunsuz ifade içermektedir. Lütfen düzenleyip tekrar deneyin.")
        }
    }
}
