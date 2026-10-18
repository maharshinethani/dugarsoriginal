import { siteConfig } from './site-config';
import type { Locale } from './i18n';

export type WhatsAppContext =
  | {
      type: 'product_enquiry';
      productId: string;
      productName: string;
      sku?: string;
      price?: string;
      currency?: string;
      imageUrl?: string;
      productUrl?: string;
      locale: Locale;
    }
  | {
      type: 'buy_now';
      productId: string;
      productName: string;
      sku?: string;
      quantity: number;
      size?: string;
      colour?: string;
      price?: string;
      currency?: string;
      subtotal?: string;
      imageUrl?: string;
      productUrl?: string;
      locale: Locale;
    }
  | {
      type: 'cart_enquiry';
      items: Array<{
        productId: string;
        name: string;
        sku?: string;
        quantity: number;
        unitPrice?: string;
        subtotal?: string;
        currency?: string;
        imageUrl?: string;
        productUrl?: string;
      }>;
      totalItems: number;
      orderSubtotal?: string;
      currency?: string;
      locale: Locale;
    }
  | { type: 'appointment'; name: string; date?: string; time?: string; appointmentType?: string; country?: string; locale: Locale }
  | { type: 'general'; name?: string; message?: string; locale: Locale };

/**
 * Convert a relative URL to an absolute HTTPS URL using the current origin.
 * If the URL is already absolute, return it as-is.
 */
export function normalizeUrl(url: string | undefined, origin?: string): string | undefined {
  if (!url) return undefined;
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
    if (!base) return url;
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

/**
 * Get the primary (first) image URL from a product's image array, falling back
 * to thumbnail_url. Returns undefined if no image is available.
 */
export function getPrimaryImageUrl(
  productImages: { url: string; position: number }[] | undefined,
  thumbnailUrl: string | null | undefined,
  origin?: string
): string | undefined {
  const sorted = productImages?.slice().sort((a, b) => a.position - b.position);
  const raw = sorted?.[0]?.url || thumbnailUrl || undefined;
  return normalizeUrl(raw, origin);
}

export function generateWhatsAppMessage(ctx: WhatsAppContext): string {
  const { locale } = ctx;

  if (ctx.type === 'product_enquiry') {
    if (locale === 'ar') {
      return (
        `مرحباً دوغارس للمجوهرات،\n\n` +
        `أرغب بالاستفسار عن:\n` +
        `${ctx.productName}\n` +
        `${ctx.sku ? `رقم المنتج: ${ctx.sku}\n` : ''}` +
        `${ctx.productId ? `معرّف المنتج: ${ctx.productId}\n` : ''}` +
        `${ctx.price ? `السعر: ${ctx.price}${ctx.currency ? ` (${ctx.currency})` : ''}\n` : ''}` +
        `${ctx.imageUrl ? `صورة المنتج: ${ctx.imageUrl}\n` : ''}` +
        `${ctx.productUrl ? `صفحة المنتج: ${ctx.productUrl}\n` : ''}` +
        `\nيرجى مساعدتي في التوافر والشراء.\n\n` +
        `ملاحظة: السعر النهائي والشحن والضرائب قد تتطلب تأكيداً.\n\nشكراً لكم.`
      );
    }
    return (
      `Hello DUGARS Jewellery,\n\n` +
      `I would like to enquire about:\n` +
      `${ctx.productName}\n` +
      `${ctx.sku ? `SKU: ${ctx.sku}\n` : ''}` +
      `${ctx.productId ? `Product ID: ${ctx.productId}\n` : ''}` +
      `${ctx.price ? `Price: ${ctx.price}${ctx.currency ? ` (${ctx.currency})` : ''}\n` : ''}` +
      `${ctx.imageUrl ? `Product Image: ${ctx.imageUrl}\n` : ''}` +
      `${ctx.productUrl ? `Product Page: ${ctx.productUrl}\n` : ''}` +
      `\nPlease assist me with availability and purchase.\n\n` +
      `Note: Final price, shipping, and taxes may require confirmation.\n\nThank you.`
    );
  }

  if (ctx.type === 'buy_now') {
    if (locale === 'ar') {
      return (
        `مرحباً دوغارس للمجوهرات،\n\n` +
        `أرغب بشراء هذا المنتج:\n\n` +
        `اسم المنتج: ${ctx.productName}\n` +
        `${ctx.productId ? `معرّف المنتج: ${ctx.productId}\n` : ''}` +
        `${ctx.sku ? `رقم المنتج: ${ctx.sku}\n` : ''}` +
        `الكمية: ${ctx.quantity}\n` +
        `${ctx.size ? `المقاس: ${ctx.size}\n` : ''}` +
        `${ctx.colour ? `اللون: ${ctx.colour}\n` : ''}` +
        `${ctx.price ? `سعر الوحدة: ${ctx.price}${ctx.currency ? ` (${ctx.currency})` : ''}\n` : ''}` +
        `${ctx.subtotal ? `المجموع الفرعي: ${ctx.subtotal}${ctx.currency ? ` (${ctx.currency})` : ''}\n` : ''}` +
        `${ctx.imageUrl ? `صورة المنتج: ${ctx.imageUrl}\n` : ''}` +
        `${ctx.productUrl ? `صفحة المنتج: ${ctx.productUrl}\n` : ''}` +
        `\nيرجى تأكيد توافر المنتج ومساعدتي في إتمام الطلب.\n\n` +
        `ملاحظة: السعر النهائي والشحن والضرائب قد تتطلب تأكيداً.\n\nشكراً لكم.`
      );
    }
    return (
      `Hello DUGARS Jewellery,\n\n` +
      `I would like to purchase this jewellery item.\n\n` +
      `Product Name: ${ctx.productName}\n` +
      `${ctx.productId ? `Product ID: ${ctx.productId}\n` : ''}` +
      `${ctx.sku ? `SKU: ${ctx.sku}\n` : ''}` +
      `Quantity: ${ctx.quantity}\n` +
      `${ctx.size ? `Size: ${ctx.size}\n` : ''}` +
      `${ctx.colour ? `Colour: ${ctx.colour}\n` : ''}` +
      `${ctx.price ? `Unit Price: ${ctx.price}${ctx.currency ? ` (${ctx.currency})` : ''}\n` : ''}` +
      `${ctx.subtotal ? `Subtotal: ${ctx.subtotal}${ctx.currency ? ` (${ctx.currency})` : ''}\n` : ''}` +
      `${ctx.imageUrl ? `Product Image: ${ctx.imageUrl}\n` : ''}` +
      `${ctx.productUrl ? `Product Page: ${ctx.productUrl}\n` : ''}` +
      `\nPlease confirm product availability and help me complete my order.\n\n` +
      `Note: Final price, shipping, and taxes may require confirmation.\n\nThank you.`
    );
  }

  if (ctx.type === 'cart_enquiry') {
    if (locale === 'ar') {
      let msg = `مرحباً دوغارس للمجوهرات،\n\nأرغب بوضع طلب:\n`;
      ctx.items.forEach((item, i) => {
        msg += `\n--- العنصر ${i + 1} ---\n`;
        msg += `المنتج: ${item.name}\n`;
        if (item.productId) msg += `معرّف المنتج: ${item.productId}\n`;
        if (item.sku) msg += `رقم المنتج: ${item.sku}\n`;
        msg += `الكمية: ${item.quantity}\n`;
        if (item.unitPrice) msg += `سعر الوحدة: ${item.unitPrice}${item.currency ? ` (${item.currency})` : ''}\n`;
        if (item.subtotal) msg += `المجموع الفرعي: ${item.subtotal}${item.currency ? ` (${item.currency})` : ''}\n`;
        if (item.imageUrl) msg += `صورة المنتج: ${item.imageUrl}\n`;
        if (item.productUrl) msg += `صفحة المنتج: ${item.productUrl}\n`;
      });
      msg += `\nإجمالي العناصر: ${ctx.totalItems}\n`;
      if (ctx.orderSubtotal) msg += `إجمالي الفرعي للطلب: ${ctx.orderSubtotal}${ctx.currency ? ` (${ctx.currency})` : ''}\n`;
      msg += `\nيرجى تأكيد التوافر وخيارات التوصيل والخطوات التالية لإتمام الطلب.\n\nشكراً لاختياركم دوغارس للمجوهرات.`;
      return msg;
    }
    let msg = `Hello DUGARS Jewellery,\n\nI would like to place an order.\n`;
    ctx.items.forEach((item, i) => {
      msg += `\n--- ITEM ${i + 1} ---\n`;
      msg += `Product: ${item.name}\n`;
      if (item.productId) msg += `Product ID: ${item.productId}\n`;
      if (item.sku) msg += `SKU: ${item.sku}\n`;
      msg += `Quantity: ${item.quantity}\n`;
      if (item.unitPrice) msg += `Unit Price: ${item.unitPrice}${item.currency ? ` (${item.currency})` : ''}\n`;
      if (item.subtotal) msg += `Subtotal: ${item.subtotal}${item.currency ? ` (${item.currency})` : ''}\n`;
      if (item.imageUrl) msg += `Product Image: ${item.imageUrl}\n`;
      if (item.productUrl) msg += `Product Page: ${item.productUrl}\n`;
    });
    msg += `\nTotal Items: ${ctx.totalItems}\n`;
    if (ctx.orderSubtotal) msg += `Order Subtotal: ${ctx.orderSubtotal}${ctx.currency ? ` (${ctx.currency})` : ''}\n`;
    msg += `\nPlease confirm availability, delivery options, and the next steps for completing my order.\n\nThank you for choosing DUGARS Jewellery.`;
    return msg;
  }

  if (ctx.type === 'appointment') {
    if (locale === 'ar') {
      return `مرحباً دوغارس للمجوهرات،\n\nأرغب في حجز موعد:\nالاسم: ${ctx.name}${ctx.appointmentType ? `\nنوع الموعد: ${ctx.appointmentType}` : ''}${ctx.country ? `\nالدولة: ${ctx.country}` : ''}${ctx.date ? `\nالتاريخ: ${ctx.date}` : ''}${ctx.time ? `\nالوقت: ${ctx.time}` : ''}\n\nشكراً لكم.`;
    }
    return `Hello DUGARS Jewellery,\n\nI would like to book an appointment:\nName: ${ctx.name}${ctx.appointmentType ? `\nAppointment Type: ${ctx.appointmentType}` : ''}${ctx.country ? `\nCountry: ${ctx.country}` : ''}${ctx.date ? `\nDate: ${ctx.date}` : ''}${ctx.time ? `\nTime: ${ctx.time}` : ''}\n\nThank you.`;
  }

  // general
  if (locale === 'ar') {
    return `مرحباً دوغارس للمجوهرات،\n\n${ctx.message || 'أرغب في الاستفسار عن منتجاتكم.'}\n\nشكراً لكم.`;
  }
  return `Hello DUGARS Jewellery,\n\n${ctx.message || 'I would like to enquire about your products.'}\n\nThank you.`;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const cleanNumber = number.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Resolve the WhatsApp business number.
 * Priority: explicit parameter → NEXT_PUBLIC_WHATSAPP_NUMBER env var → database settings → siteConfig default.
 */
export function resolveWhatsAppNumber(override?: string): string {
  if (override && override.trim()) return override;
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER) {
    return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  }
  return siteConfig.whatsappDefault;
}

export function getWhatsAppUrl(ctx: WhatsAppContext, number?: string): string {
  const whatsappNumber = resolveWhatsAppNumber(number);
  const message = generateWhatsAppMessage(ctx);
  return buildWhatsAppUrl(whatsappNumber, message);
}
