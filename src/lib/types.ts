export type ItemOption = { name: string; price: number };

export type Category = {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
};

export type MenuItem = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  options: ItemOption[];
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type Offer = {
  id: number;
  title: string;
  description: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Currency = "USD" | "LBP";

export type Settings = {
  whatsapp_number: string;
  currency: Currency;
  tagline: string;
  address: string;
  hours: string;
  instagram: string;
  facebook: string;
  phone: string;
  maps_url: string;
  announcement: string;
  delivery_enabled: string;
};

export const DEFAULT_SETTINGS: Settings = {
  whatsapp_number: "96171819311",
  currency: "USD",
  tagline: "قهوة مختصة وكريب طازج… على الطريقة اللبنانية",
  address: "",
  hours: "",
  instagram: "https://www.instagram.com/barista_alasmar",
  facebook: "https://www.facebook.com/share/1BDUXPa3VV/",
  phone: "71 819 311",
  maps_url: "https://maps.app.goo.gl/NZzVyibw7Cs3BuqcA",
  announcement: "",
  delivery_enabled: "1",
};
