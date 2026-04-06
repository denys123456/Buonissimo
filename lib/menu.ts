export type MenuCategoryKey = "classic" | "speciale" | "extra" | "drinks";

export type MenuItem = {
  id: string;
  name: string;
  weight?: string;
  price: number;
  section: MenuCategoryKey;
  group: string;
};

export const menuCategories: { key: MenuCategoryKey; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "speciale", label: "Speciale" },
  { key: "extra", label: "Extra" },
  { key: "drinks", label: "Drinks" }
];

export const menuItems: MenuItem[] = [
  { id: "marinara", name: "Marinara", weight: "350g", price: 26, section: "classic", group: "Classic Pizza" },
  { id: "margherita", name: "Margherita", weight: "400g", price: 30, section: "classic", group: "Classic Pizza" },
  { id: "prosciutto-e-funghi", name: "Prosciutto e Funghi", weight: "450g", price: 32, section: "classic", group: "Classic Pizza" },
  { id: "salami", name: "Salami", weight: "400g", price: 34, section: "classic", group: "Classic Pizza" },
  { id: "diavola", name: "Diavola", weight: "400g", price: 34, section: "classic", group: "Classic Pizza" },
  { id: "quattro-stagioni", name: "Quattro Stagioni", weight: "450g", price: 36, section: "classic", group: "Classic Pizza" },
  { id: "capricciosa", name: "Capricciosa", weight: "450g", price: 37, section: "classic", group: "Classic Pizza" },
  { id: "quattro-formaggi", name: "Quattro Formaggi", weight: "450g", price: 38, section: "classic", group: "Classic Pizza" },
  { id: "pizza-rustica", name: "Pizza Rustica", weight: "450g", price: 36, section: "classic", group: "Classic Pizza" },
  { id: "tonno", name: "Tonno", weight: "450g", price: 34, section: "classic", group: "Classic Pizza" },
  { id: "vegetariana", name: "Vegetariana", weight: "450g", price: 34, section: "classic", group: "Classic Pizza" },
  { id: "pollo-e-gorgonzola", name: "Pollo e Gorgonzola", weight: "450g", price: 36, section: "speciale", group: "Special Pizza" },
  { id: "salsiccia-e-friarielli", name: "Salsiccia e Friarielli", weight: "450g", price: 36, section: "speciale", group: "Special Pizza" },
  { id: "quattro-formaggi-special", name: "Quattro Formaggi Special", weight: "450g", price: 38, section: "speciale", group: "Special Pizza" },
  { id: "montanara", name: "Montanara", weight: "450g", price: 36, section: "speciale", group: "Special Pizza" },
  { id: "extra-carne", name: "Extra carne", weight: "50g", price: 4, section: "extra", group: "Extra" },
  { id: "extra-branza", name: "Extra brânză", weight: "50g", price: 4, section: "extra", group: "Extra" },
  { id: "sosuri", name: "Sosuri (ketchup / maioneză / usturoi)", weight: "50g", price: 3, section: "extra", group: "Extra" },
  { id: "espresso", name: "Espresso", price: 7, section: "drinks", group: "Coffee" },
  { id: "espresso-macchiato", name: "Espresso Macchiato", price: 8, section: "drinks", group: "Coffee" },
  { id: "cappuccino", name: "Cappuccino", price: 9, section: "drinks", group: "Coffee" },
  { id: "latte", name: "Latte", price: 10, section: "drinks", group: "Coffee" },
  { id: "flat-white", name: "Flat White", price: 11, section: "drinks", group: "Coffee" },
  { id: "pepsi", name: "Pepsi", weight: "250ml", price: 8, section: "drinks", group: "Soft Drinks" },
  { id: "pepsi-twist", name: "Pepsi Twist", weight: "250ml", price: 8, section: "drinks", group: "Soft Drinks" },
  { id: "mirinda", name: "Mirinda", weight: "250ml", price: 8, section: "drinks", group: "Soft Drinks" },
  { id: "7up", name: "7UP", weight: "250ml", price: 8, section: "drinks", group: "Soft Drinks" },
  { id: "evervess-tonic", name: "Evervess Tonic", weight: "250ml", price: 8, section: "drinks", group: "Soft Drinks" },
  { id: "limoncello-spritz", name: "Limoncello Spritz", weight: "250ml", price: 22, section: "drinks", group: "Cocktails" },
  { id: "gin-tonic", name: "Gin Tonic", weight: "250ml", price: 20, section: "drinks", group: "Cocktails" },
  { id: "aperol-spritz", name: "Aperol Spritz", weight: "250ml", price: 22, section: "drinks", group: "Cocktails" },
  { id: "hugo", name: "Hugo", weight: "250ml", price: 24, section: "drinks", group: "Cocktails" },
  { id: "ursus-cooler", name: "Ursus Cooler", weight: "330ml", price: 10, section: "drinks", group: "Beer" },
  { id: "ursus", name: "Ursus", weight: "330ml", price: 10, section: "drinks", group: "Beer" },
  { id: "peroni", name: "Peroni", weight: "330ml", price: 12, section: "drinks", group: "Beer" }
];

export const featuredPizzaIds = ["margherita", "diavola", "quattro-formaggi", "montanara"];
export const menuMap = new Map(menuItems.map((item) => [item.id, item]));
export const extraOptions = menuItems.filter((item) => item.section === "extra");

export function itemSupportsExtras(item: MenuItem) {
  return item.section === "classic" || item.section === "speciale";
}

export function getExtraLabel(id: string, fallbackName: string) {
  if (id === "extra-branza") {
    return "Extra br\u00e2nz\u0103";
  }

  if (id === "sosuri") {
    return "Sos";
  }

  return fallbackName;
}
