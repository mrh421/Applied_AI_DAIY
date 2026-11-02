/** The languages of the texts the app writes itself: the language the person writes in. */
export type Language = "en" | "de";

const GERMAN = new Set(
  "der die das und ist nicht ich mein meine mit für von zu den dem ein eine einen einer wie wo habe hat kaputt wird auch aber oder bei auf im zum zur es sich wir sind mir mich nur noch wenn dann kann".split(
    " ",
  ),
);
const ENGLISH = new Set(
  "the and is my it of to with for not this that have has are on a i be but can does doesn't how what where broken also or at".split(
    " ",
  ),
);

/**
 * The language a person writes in, guessed from common words (German or English). The fixed safety
 * texts and the escalation texts follow it. When the words give no lead, the answer is English.
 */
export function detectLanguage(texts: string[]): Language {
  let de = 0;
  let en = 0;
  for (const word of texts
    .join(" ")
    .toLowerCase()
    .split(/[^a-zäöüß']+/)) {
    if (GERMAN.has(word) || /[äöüß]/.test(word)) de++;
    if (ENGLISH.has(word)) en++;
  }
  return de > en ? "de" : "en";
}
