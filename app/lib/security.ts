export const profanityList: string[] = [
  // Keep short and neutral sample; can be extended from a managed list
  "salak",
  "aptal",
  "geri zekalı"
];

export const piiPatterns: RegExp[] = [
  /\b\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/i, // phone
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i // email
];

export function containsProhibitedContent(text: string): string | null {
  const lowered = text.toLowerCase();
  for (const word of profanityList) {
    if (lowered.includes(word)) return `Metin uygunsuz kelime içeriyor: ${word}`;
  }
  for (const re of piiPatterns) {
    if (re.test(text)) return "Metin kişisel veri içeriyor gibi görünüyor.";
  }
  return null;
}


