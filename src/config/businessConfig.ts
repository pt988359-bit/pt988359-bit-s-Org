/**
 * SINGLE SOURCE OF TRUTH FOR PRO TECK SHOWROOM BUSINESS CONFIGURATION
 * All pages, components, and metadata MUST consume this configuration.
 */

export interface BusinessConfig {
  name: string;
  brandTagline: string;
  email: string;
  phone: string;
  secondaryPhone: string;
  formattedPhone: string;
  formattedSecondaryPhone: string;
  whatsappPhone: string;
  secondaryWhatsappPhone: string;
  formattedWhatsapp: string;
  formattedSecondaryWhatsapp: string;
  address: {
    governorate: string;
    area: string;
    street: string;
    landmarks: string;
    fullAddress: string;
    googleMapsUrl: string; // Primary verified short link: https://maps.app.goo.gl/xRkPdRYn8cR4uqoMA
    googleMapsEmbedUrl: string;
    googleMapsFullUrl?: string;
    directionsUrl?: string;
    staticMapUrl?: string;
    placeId?: string;
    latitude?: number;
    longitude?: number;
  };
  workingHours: {
    start: string;
    end: string;
    text: string;
    daysText: string;
  };
  instapay: {
    accountHandle: string;
    recipientName: string;
    qrCodeUrl: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  logoUrl: string;
  faviconUrl: string;
  businessPolicies: {
    warrantyPolicy: string;
    reservationPolicy: string;
    returnPolicy: string;
    inspectionPolicy: string;
  };
  deliveryCities: string[];
  currencySymbol: string;
}

export const BUSINESS_CONFIG: BusinessConfig = {
  name: 'PRO TECK',
  brandTagline: 'معرض الأجهزة المنزلية الفاخرة - جديد ومستعمل بأعلى معايير الجودة',
  email: 'pt988359@gmail.com',
  phone: '01027281765',
  secondaryPhone: '01146693284',
  formattedPhone: '010 2728 1765',
  formattedSecondaryPhone: '011 4669 3284',
  whatsappPhone: '01027281765',
  secondaryWhatsappPhone: '01146693284',
  formattedWhatsapp: '+20 10 2728 1765',
  formattedSecondaryWhatsapp: '+20 11 4669 3284',
  address: {
    governorate: 'القاهرة',
    area: 'المعادي',
    street: 'شارع 68',
    landmarks: 'بالقرب من شارع النصر والمستشفى العسكري',
    fullAddress: 'القاهرة - المعادي - شارع 68 - معرض PRO TECK للأجهزة المنزلية',
    googleMapsUrl: 'https://maps.app.goo.gl/xRkPdRYn8cR4uqoMA',
    googleMapsEmbedUrl: 'https://maps.google.com/maps?q=https://maps.app.goo.gl/xRkPdRYn8cR4uqoMA&t=&z=16&ie=UTF8&iwloc=&output=embed',
    latitude: 29.9602,
    longitude: 31.2725,
    directionsUrl: 'https://maps.app.goo.gl/xRkPdRYn8cR4uqoMA',
  },
  workingHours: {
    start: '14:00',
    end: '01:00',
    text: 'يومياً من 2:00 ظهراً حتى 1:00 صباحاً',
    daysText: 'مفتوح طوال أيام الأسبوع',
  },
  instapay: {
    accountHandle: 'proteck.maadi@instapay',
    recipientName: 'معرض PRO TECK المعادي',
    qrCodeUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  },
  socialLinks: {
    facebook: 'https://www.facebook.com/share/17yrfmNzyr/',
    instagram: 'https://instagram.com/proteck.maadi',
    youtube: 'https://youtube.com/@proteck.maadi',
    tiktok: 'https://tiktok.com/@proteck.maadi',
  },
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  businessPolicies: {
    warrantyPolicy: 'جميع الأجهزة المباعة من المعرض تشمل ضمان من 6 أشهر إلى 24 شهر حسب الفئة، مع صيانة فورية واستبدال متوفر.',
    reservationPolicy: 'يمكن حجز أي جهاز مجاناً أونلاين لموعد معاينة مدته 24 ساعة، ويتم تعليق بيعه للغير باسمك لحين المعاينة والطلب النهائي بالمعرض.',
    returnPolicy: 'حق إرجاع الجهاز خلال 14 يوماً في حالة وجود أي عيب فني غير مذكور في التقرير الشامل.',
    inspectionPolicy: 'تخضع جميع الأجهزة المستعملة لفحص فني شامل من 18 نقطة قبل العرض بالمعرض مع تسليم شهادة جودة.',
  },
  deliveryCities: ['القاهرة الكبرى', 'المعادي', 'التجمع الخامس', 'مدينة نصر', 'الجيزة', '6 أكتوبر'],
  currencySymbol: 'ج.م',
};
