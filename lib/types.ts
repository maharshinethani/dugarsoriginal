export interface ProductImage {
  id: string;
  url: string;
  alt_en: string | null;
  alt_ar: string | null;
  position: number;
}

export interface Product {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  sku: string | null;
  description_en: string | null;
  description_ar: string | null;
  short_description_en: string | null;
  short_description_ar: string | null;
  price: number;
  sale_price: number | null;
  compare_price: number | null;
  currency: string;
  category: string | null;
  collection_id: string | null;
  material: string | null;
  metal: string | null;
  stone: string | null;
  carat: string | null;
  weight: string | null;
  sizes: string[];
  colours: string[];
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'made_to_order';
  quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_signature: boolean;
  is_bridal: boolean;
  is_limited: boolean;
  status: 'draft' | 'published';
  thumbnail_url: string | null;
  video_url: string | null;
  seo_title_en: string | null;
  seo_title_ar: string | null;
  seo_description_en: string | null;
  seo_description_ar: string | null;
  keywords: string[];
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
  collection?: Collection | null;
  country_prices?: ProductCountryPrice[];
}

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  hero_image_url: string | null;
  story_en: string | null;
  story_ar: string | null;
  seo_title_en: string | null;
  seo_title_ar: string | null;
  seo_description_en: string | null;
  seo_description_ar: string | null;
  display_order: number;
  is_published: boolean;
}

export interface WebsiteSettings {
  id: number;
  brand_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  whatsapp_number: string;
  phone: string;
  email: string;
  address_en: string | null;
  address_ar: string | null;
  instagram: string | null;
  facebook: string | null;
  pinterest: string | null;
  youtube: string | null;
  google_maps_url: string | null;
  currency: string;
  default_language: string;
  announcement_bar_enabled: boolean;
  show_prices: boolean;
  tagline_en: string | null;
  tagline_ar: string | null;
}

export interface AnnouncementMessage {
  id: string;
  text_en: string;
  text_ar: string;
  display_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  customer_name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  product_name: string | null;
  source: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  created_at: string;
}

export interface Appointment {
  id: string;
  customer_name: string;
  phone: string | null;
  email: string | null;
  country: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  appointment_type: string | null;
  collection_interest: string | null;
  message: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  sku: string | null;
  price: number;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  quantity: number;
  size?: string;
  colour?: string;
}

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  thumbnailUrl: string | null;
  addedAt: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  symbol_position: 'before' | 'after';
  is_base: boolean;
  is_enabled: boolean;
  sort_order: number;
}

export interface Country {
  code: string;
  name: string;
  flag_emoji: string;
  default_currency_code: string;
  is_enabled: boolean;
  sort_order: number;
}

export interface ExchangeRate {
  id: string;
  currency_code: string;
  rate: number;
  updated_at: string;
  source: 'manual' | 'automatic';
}

export interface ProductCountryPrice {
  id: string;
  product_id: string;
  currency_code: string;
  price: number;
  sale_price: number | null;
}

export interface ShippingCountrySetting {
  id: string;
  country_code: string;
  is_shippable: boolean;
  shipping_fee: number | null;
  delivery_estimate_en: string | null;
  delivery_estimate_ar: string | null;
  tax_note_en: string | null;
  tax_note_ar: string | null;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  testimonial_text: string;
  rating: number;
  product_ref: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ContactEmail {
  id: string;
  email: string;
  label: string | null;
  is_enabled: boolean;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContactPhone {
  id: string;
  phone: string;
  label: string | null;
  is_enabled: boolean;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppNumber {
  id: string;
  number: string;
  label: string | null;
  country_code: string | null;
  is_enabled: boolean;
  is_primary: boolean;
  purpose_product_enquiry: boolean;
  purpose_buy_now: boolean;
  purpose_general: boolean;
  purpose_order: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductMedia {
  id: string;
  product_id: string;
  media_type: 'image' | 'video';
  url: string;
  storage_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  alt_en: string | null;
  alt_ar: string | null;
  position: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
