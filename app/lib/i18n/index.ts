import strings from "./tr.json";

export type TranslationKey = keyof typeof strings;

export function t(key: TranslationKey): string {
    return strings[key];
}


