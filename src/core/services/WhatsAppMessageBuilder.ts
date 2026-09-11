import { normalizeEgyptianPhone } from '../../utils/phoneUtils';

export interface CustomerDataPayload {
  name: string;
  phone: string;
  email?: string;
}

export interface ProductDataPayload {
  title: string;
  code: string;
  price: number;
}

export interface SellDeviceDataPayload {
  deviceType: string;
  brand: string;
  condition: string;
  description: string;
  expectedPrice?: number;
}

export interface TradeInDeviceDataPayload {
  currentDeviceType: string;
  currentBrand: string;
  currentCondition: string;
  notes?: string;
  targetProductTitle: string;
  targetProductCode: string;
  targetProductPrice: number;
}

export class WhatsAppMessageBuilder {
  private static formatDateTime(date = new Date()): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // 1. Reservation Message
  public static buildReservationMessage(
    customer: CustomerDataPayload,
    product: ProductDataPayload,
    refCode?: string
  ): string {
    const timeStr = this.formatDateTime();
    return `طلب حجز جهاز

الاسم:
${customer.name}

رقم الهاتف:
${customer.phone}

البريد:
${customer.email || 'غير محدد'}

الجهاز:
${product.title}

الكود:
${refCode || product.code}

السعر:
${product.price.toLocaleString()} جنيه

وقت الطلب:
${timeStr}`;
  }

  // 2. Purchase Message
  public static buildPurchaseMessage(
    customer: CustomerDataPayload,
    product: ProductDataPayload,
    refCode?: string
  ): string {
    const timeStr = this.formatDateTime();
    return `طلب شراء جهاز (نوع الطلب: شراء)

الاسم:
${customer.name}

رقم الهاتف:
${customer.phone}

البريد:
${customer.email || 'غير محدد'}

الجهاز:
${product.title}

الكود:
${refCode || product.code}

السعر:
${product.price.toLocaleString()} جنيه

وقت الطلب:
${timeStr}`;
  }

  // 3. Negotiation Message
  public static buildNegotiationMessage(
    customer: CustomerDataPayload,
    product: ProductDataPayload,
    offeredPrice: number,
    negotiationNotes?: string,
    refCode?: string
  ): string {
    const timeStr = this.formatDateTime();
    return `طلب تفاوض على السعر

الاسم:
${customer.name}

رقم الهاتف:
${customer.phone}

البريد:
${customer.email || 'غير محدد'}

الجهاز:
${product.title}

الكود:
${refCode || product.code}

السعر المعلن:
${product.price.toLocaleString()} جنيه

السعر المقترح من العميل:
${offeredPrice.toLocaleString()} جنيه

رسالة التفاوض:
${negotiationNotes || 'أرغب في التفاوض للحصول على أفضل سعر متاح للمعاينة والشراء.'}

وقت الطلب:
${timeStr}`;
  }

  // 4. Sell Device Message
  public static buildSellDeviceMessage(
    customer: CustomerDataPayload,
    device: SellDeviceDataPayload
  ): string {
    const timeStr = this.formatDateTime();
    return `طلب بيع جهاز للمعرض

الاسم:
${customer.name}

رقم الهاتف:
${customer.phone}

البريد:
${customer.email || 'غير محدد'}

بيانات الجهاز المعروض للبيع:
• نوع الجهاز: ${device.deviceType}
• الماركة: ${device.brand}
• الحالة: ${device.condition}
• الوصف التفصيلي: ${device.description}
${device.expectedPrice ? `• السعر المطلوب: ${device.expectedPrice.toLocaleString()} جنيه` : ''}

وقت الطلب:
${timeStr}`;
  }

  // 5. Trade-in Message
  public static buildTradeInMessage(
    customer: CustomerDataPayload,
    trade: TradeInDeviceDataPayload
  ): string {
    const timeStr = this.formatDateTime();
    return `طلب استبدال جهاز

الاسم:
${customer.name}

رقم الهاتف:
${customer.phone}

البريد:
${customer.email || 'غير محدد'}

الجهاز المطلوب حسابه من المعرض:
${trade.targetProductTitle} (الكود: ${trade.targetProductCode}) - السعر: ${trade.targetProductPrice.toLocaleString()} جنيه

بيانات جهازك الحالي للاستبدال:
• نوع الجهاز: ${trade.currentDeviceType}
• الماركة: ${trade.currentBrand}
• الحالة: ${trade.currentCondition}
${trade.notes ? `• ملاحظات: ${trade.notes}` : ''}

وقت الطلب:
${timeStr}`;
  }

  // 6. General Inquiry Message
  public static buildInquiryMessage(
    customer: CustomerDataPayload,
    product: ProductDataPayload,
    questionText: string,
    refCode?: string
  ): string {
    const timeStr = this.formatDateTime();
    return `استفسار عن جهاز

الاسم:
${customer.name}

رقم الهاتف:
${customer.phone}

البريد:
${customer.email || 'غير محدد'}

الجهاز:
${product.title}

الكود:
${refCode || product.code}

نص الاستفسار:
${questionText}

وقت الطلب:
${timeStr}`;
  }

  // Helper to open WhatsApp window with prefilled message
  public static openWhatsApp(phone: string, messageText: string): void {
    const normalizedPhone = normalizeEgyptianPhone(phone);
    const encodedText = encodeURIComponent(messageText);
    const url = `https://wa.me/${normalizedPhone}?text=${encodedText}`;
    window.open(url, '_blank');
  }
}
