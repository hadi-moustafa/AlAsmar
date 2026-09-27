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
  announcement: string;
  delivery_enabled: string;
};

export const DEFAULT_SETTINGS: Settings = {
  whatsapp_number: "",
  currency: "USD",
  tagline: "قهوة مختصة وكريب طازج… على الطريقة اللبنانية",
  address: "",
  hours: "",
  instagram: "",
  announcement: "",
  delivery_enabled: "1",
};
