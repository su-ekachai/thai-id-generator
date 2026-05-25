/**
 * Bilingual EN/TH string table and DOM-translation helpers.
 *
 * Keys follow the dotted convention `group.subgroup.value` (for example
 * `digits.label.type`, `update.reload`). Every UI string used at runtime
 * passes through `t()`; hard-coded English in markup is reserved only for the
 * default attribute value visible to readers who fetch the page before the
 * bundle finishes loading.
 *
 * @packageDocumentation
 */

/** Supported UI languages. */
export type Lang = "en" | "th";

/** `localStorage` key under which the chosen language persists. */
const STORAGE_KEY = "thai-id-lang";

type StringTable = Record<string, string>;

const STRINGS: Record<Lang, StringTable> = {
  en: {
    "app.title": "Thai National ID Generator",
    "app.subtitle":
      "Educational demonstration of the 13-digit checksum algorithm.",
    "lang.label": "Language",
    "theme.toggle.light": "Switch to light mode",
    "theme.toggle.dark": "Switch to dark mode",
    "id.placeholder": "Press Generate to produce an ID.",
    "id.copy": "Copy",
    "id.copied": "Copied",
    "id.generate": "Generate",
    "algo.heading": "How the algorithm works",
    "algo.intro":
      "The 13th digit is computed from the first 12 digits. Each digit is multiplied by a weight (13 descending to 2), the products are summed, and the sum is taken modulo 11. The check digit is (11 − remainder) modulo 10.",
    "algo.col.position": "Position",
    "algo.col.digit": "Digit",
    "algo.col.weight": "Weight",
    "algo.col.product": "Product",
    "algo.sum": "Sum",
    "algo.remainder": "Sum mod 11",
    "algo.checkDigit": "Check digit",
    "algo.formula": "(11 − remainder) mod 10",
    "disclaimer.heading": "Educational use only",
    "disclaimer.body":
      "The numbers produced by this tool satisfy the Thai national ID checksum for the sole purpose of demonstrating the algorithm. The numbers are not real identities. They must not be used to impersonate any person, to complete real forms, to commit fraud, or for any purpose that affects the integrity of another person’s identity.",
    "footer.source": "Source on GitHub",
    "update.available": "A new version is available.",
    "update.reload": "Reload",
    "update.dismiss": "Dismiss",
    "digits.heading": "What each digit represents",
    "digits.intro":
      "The 13 digits split into five logical groups. The first 12 are assigned by the Department of Provincial Administration at the time of registration. The 13th is the check digit.",
    "digits.col.position": "Position",
    "digits.col.label": "Label",
    "digits.col.meaning": "Meaning",
    "digits.label.type": "Type",
    "digits.label.location": "Location",
    "digits.label.volume": "Volume",
    "digits.label.sequence": "Sequence",
    "digits.label.check": "Check",
    "digits.meaning.type":
      "Person category (1–8). Identifies how and when the holder entered the registry.",
    "digits.meaning.location":
      "Province code (positions 2–3) plus district / khet code (positions 4–5).",
    "digits.meaning.volume":
      "Household registration volume number (T.R. 14) within the district.",
    "digits.meaning.sequence":
      "Sequence number of the person within that household registration volume.",
    "digits.meaning.check": "Check digit. Computed from the first 12 digits.",
    "digits.type.heading": "Person-type codes (position 1)",
    "digits.type.1":
      "Thai citizen born on or after 1 Jan 1984 and registered within the 15-day statutory window.",
    "digits.type.2":
      "Thai citizen born on or after 1 Jan 1984, registered after the 15-day window.",
    "digits.type.3":
      "Thai citizen already on the household registry before 1 Jan 1984.",
    "digits.type.4":
      "Thai citizen born before 1 Jan 1984, added to the registry retroactively.",
    "digits.type.5":
      "Thai citizen by exception (naturalisation by marriage, ministerial decree, etc.).",
    "digits.type.6":
      "Foreigner residing in Thailand long-term, or illegally pending status.",
    "digits.type.7": "Child of a person in category 6, born in Thailand.",
    "digits.type.8": "Foreigner naturalised as Thai after 1 Jan 1984.",
  },
  th: {
    "app.title": "โปรแกรมสร้างเลขบัตรประชาชนไทย",
    "app.subtitle":
      "ตัวอย่างการสุ่มเลขบัตรประชาชนไทย 13 หลัก เพื่อการศึกษาเท่านั้น",
    "lang.label": "ภาษา",
    "theme.toggle.light": "เปลี่ยนเป็นโหมดสว่าง",
    "theme.toggle.dark": "เปลี่ยนเป็นโหมดมืด",
    "id.placeholder": "กดปุ่มเพื่อสุ่มหมายเลข 13 หลัก",
    "id.copy": "คัดลอก",
    "id.copied": "คัดลอกแล้ว",
    "id.generate": "สุ่ม",
    "algo.heading": "อัลกอริทึมทำงานอย่างไร",
    "algo.intro":
      "หลักที่ 13 คำนวณจากเลข 12 หลักแรก โดยนำแต่ละหลักมาคูณกับค่าน้ำหนักจาก 13 ไล่ลงมาถึง 2 แล้วนำผลรวมทั้งหมดไปหารด้วย 11 จากนั้นนำค่าเศษมาคำนวณเป็นเลขตรวจสอบด้วยสูตร (11 − เศษ) mod 10",
    "algo.col.position": "ตำแหน่ง",
    "algo.col.digit": "หลัก",
    "algo.col.weight": "น้ำหนัก",
    "algo.col.product": "ผลคูณ",
    "algo.sum": "ผลรวม",
    "algo.remainder": "ผลรวม mod 11",
    "algo.checkDigit": "หลักตรวจสอบ",
    "algo.formula": "(11 − เศษ) mod 10",
    "disclaimer.heading": "เพื่อการศึกษาเท่านั้น",
    "disclaimer.body":
      "หมายเลขที่สร้างจากเครื่องมือนี้ผ่านการตรวจเช็คซัมของเลขบัตรประชาชนไทยเพื่อจุดประสงค์ในการศึกษาอัลกอริทึมเท่านั้น หมายเลขเหล่านี้ไม่ใช่เลขจริงของบุคคลใด ห้ามนำไปใช้แอบอ้างเป็นผู้อื่น กรอกแบบฟอร์ม ฉ้อโกง หรือกระทำการใดที่กระทบต่อตัวตนของผู้อื่น",
    "footer.source": "ซอร์สโค้ดบน GitHub",
    "update.available": "มีเวอร์ชันใหม่พร้อมใช้งาน",
    "update.reload": "โหลดใหม่",
    "update.dismiss": "ปิด",
    "digits.heading": "ความหมายของแต่ละหลัก",
    "digits.intro":
      "หมายเลข 13 หลักแบ่งเป็น 5 กลุ่ม หลักที่ 1–12 ออกโดยกรมการปกครองตอนลงทะเบียน ส่วนหลักที่ 13 เป็นหลักตรวจสอบ",
    "digits.col.position": "ตำแหน่ง",
    "digits.col.label": "ชื่อ",
    "digits.col.meaning": "ความหมาย",
    "digits.label.type": "ประเภท",
    "digits.label.location": "พื้นที่",
    "digits.label.volume": "เล่มที่",
    "digits.label.sequence": "ลำดับ",
    "digits.label.check": "ตรวจสอบ",
    "digits.meaning.type":
      "ประเภทบุคคล (1–8) บอกถึงวิธีและช่วงเวลาที่ได้รับการลงทะเบียน",
    "digits.meaning.location":
      "รหัสจังหวัด (หลัก 2–3) และรหัสอำเภอ/เขต (หลัก 4–5)",
    "digits.meaning.volume": "เลขเล่มของทะเบียนบ้าน (ทร.14) ในเขตอำเภอนั้น",
    "digits.meaning.sequence": "ลำดับของบุคคลภายในเล่มทะเบียนบ้าน",
    "digits.meaning.check": "หลักตรวจสอบ คำนวณจากหลักที่ 1–12",
    "digits.type.heading": "รหัสประเภทบุคคล (หลักที่ 1)",
    "digits.type.1":
      "คนไทยที่เกิดตั้งแต่ 1 มกราคม 2527 และแจ้งเกิดภายใน 15 วัน",
    "digits.type.2": "คนไทยที่เกิดตั้งแต่ 1 มกราคม 2527 แต่แจ้งเกิดเกิน 15 วัน",
    "digits.type.3": "คนไทยที่มีชื่อในทะเบียนบ้านก่อน 1 มกราคม 2527",
    "digits.type.4": "คนไทยที่เกิดก่อน 1 มกราคม 2527 และเพิ่มชื่อภายหลัง",
    "digits.type.5":
      "คนไทยที่ได้สัญชาติเป็นกรณีพิเศษ เช่น แปลงสัญชาติโดยการสมรส",
    "digits.type.6": "คนต่างด้าวที่อาศัยในไทยถาวรหรือชั่วคราว/ผิดกฎหมาย",
    "digits.type.7": "บุตรของบุคคลในกลุ่มที่ 6 ซึ่งเกิดในประเทศไทย",
    "digits.type.8": "คนต่างด้าวที่แปลงสัญชาติเป็นไทยหลัง 1 มกราคม 2527",
  },
};

/**
 * Resolves the initial language using the priority order:
 *
 *  1. Value stored under `localStorage[STORAGE_KEY]` when it is `'en'` or `'th'`.
 *  2. `navigator.language` when it starts with `th`.
 *  3. Default `en`.
 */
function detectInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "th") return stored;
  if (navigator.language?.toLowerCase().startsWith("th")) return "th";
  return "en";
}

let currentLang: Lang = "en";

/**
 * Returns the currently-selected language code.
 *
 * @returns Either `'en'` or `'th'`.
 */
export function getLang(): Lang {
  return currentLang;
}

/**
 * Looks up a translation by dotted key in the active language table.
 *
 * When the key is missing in the table, the key itself is returned. Tests rely
 * on this fallback to assert that unknown keys are visibly broken rather than
 * silently empty.
 *
 * @param key - Dotted i18n key, for example `id.copy`.
 * @returns The translated string, or the key itself when not found.
 */
export function t(key: string): string {
  return STRINGS[currentLang][key] ?? key;
}

/**
 * Switches the active language and re-renders all `data-i18n*` attributes in
 * the document. Also persists the choice to `localStorage` and updates
 * `document.documentElement.lang` so assistive tech announces it correctly.
 *
 * @param lang - Either `'en'` or `'th'`.
 */
export function setLang(lang: Lang): void {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  applyTranslations();
}

/**
 * Initialises the language module on page load. Reads the persisted choice
 * (or detects from the browser locale), updates `<html lang>`, and applies
 * all translations to the existing DOM.
 *
 * @returns The resolved language code, useful for setting `aria-pressed` on
 *   language toggle buttons.
 */
export function initLang(): Lang {
  currentLang = detectInitialLang();
  document.documentElement.lang = currentLang;
  applyTranslations();
  return currentLang;
}

/**
 * Walks the DOM subtree at `root` and applies translations to elements that
 * carry one of the supported `data-i18n*` attributes:
 *
 * | Attribute        | Target         |
 * | ---------------- | -------------- |
 * | `data-i18n`      | `textContent`  |
 * | `data-i18n-aria` | `aria-label`   |
 * | `data-i18n-title`| `title`        |
 *
 * Elements with an empty attribute value are skipped so authors can stage
 * markup without producing visible placeholders.
 *
 * @param root - The subtree to walk. Defaults to the whole `document`.
 */
export function applyTranslations(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
    const key = el.dataset.i18nAria;
    if (key) el.setAttribute("aria-label", t(key));
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (key) el.setAttribute("title", t(key));
  });
}
