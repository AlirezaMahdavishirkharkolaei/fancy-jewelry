/**
 * Shop details and the Instagram posts shown in "The Collection".
 * Edit this file only: the whole site reads from it.
 */
export const SHOP = {
  name: "Fancy Diamonds & Jewelry",
  street: "Ziya Rızkı Cd",
  city: "Girne 9900",
  country: { en: "Northern Cyprus", tr: "Kuzey Kıbrıs", el: "Βόρεια Κύπρος", ru: "Северный Кипр", de: "Nordzypern", fa: "قبرس شمالی" },
  phone: "+90 539 109 55 05",
  whatsapp: "905391095505", // international format, digits only
  email: "fancydiajewelry@gmail.com",
  instagram: "fancydiamondj",
  mapQuery: "Fancy Diamonds & Jewelry, Ziya Rızkı Caddesi, Girne",
  hours: [
    { days: "hours_mon_fri", time: "09:00 – 20:00" },
    { days: "hours_sat", time: "10:00 – 20:00" },
    { days: "hours_sun", time: "11:00 – 18:00" },
  ],
};

/**
 * Pieces from the shop's own Instagram. Each entry is one post; the photo is shown with
 * Instagram's official embed and links back to the post. No prices are shown.
 *   url:      the post link, e.g. "https://www.instagram.com/p/XXXXXXXXXXX/"
 *   category: rings | necklaces | earrings | bracelets | watches | sets (optional, used by the filter)
 */
export const POSTS = [
  // { url: "https://www.instagram.com/p/XXXXXXXXXXX/", category: "rings" },
];

export const CATEGORIES = ["rings", "necklaces", "earrings", "bracelets", "watches", "sets"];
