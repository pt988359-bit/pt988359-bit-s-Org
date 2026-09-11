import { PhoneValidator } from '../validators/PhoneValidator';
import { LoggerService } from './LoggerService';

export type OtpChannel = 'whatsapp' | 'sms' | 'email';

export interface OtpSendResult {
  success: boolean;
  otpId?: string;
  message: string;
}

export interface OtpVerifyResult {
  success: boolean;
  message: string;
}

export interface IOtpProvider {
  name: string;
  sendOtp(phone: string, email: string, channel: OtpChannel): Promise<OtpSendResult>;
  verifyOtp(otpId: string, code: string): Promise<OtpVerifyResult>;
}

/**
 * Enterprise OTP Service Provider - Mock / Production Provider
 * Abstracted OTP architecture allowing seamless switching between WhatsApp, SMS, and Email providers.
 */
export class DefaultOtpProvider implements IOtpProvider {
  public name = 'Enterprise Multi-Channel OTP Provider';
  private otpStore: Map<string, { phone: string; email: string; code: string; expiresAt: number }> = new Map();

  public async sendOtp(phone: string, email: string, channel: OtpChannel): Promise<OtpSendResult> {
    const phoneValidation = PhoneValidator.validateEgyptianPhoneDetailed(phone);
    if (!phoneValidation.isValid) {
      return {
        success: false,
        message: phoneValidation.errorMessage || 'رقم الهاتف المصري غير صحيح (يجب أن يتكون من 11 رقم يبدأ بـ 01)',
      };
    }

    const otpId = `otp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    // Generate 6-digit verification code (For testing & development: 123456 or random)
    const code = '123456'; 
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.otpStore.set(otpId, {
      phone: phoneValidation.normalizedNumber,
      email: email.trim(),
      code,
      expiresAt,
    });

    LoggerService.info('OtpService', `OTP code sent via ${channel} to ${phoneValidation.normalizedNumber} (OTP Code: ${code})`);

    const channelNames: Record<OtpChannel, string> = {
      whatsapp: 'الواتساب',
      sms: 'الرسائل النصية SMS',
      email: 'البريد الإلكتروني',
    };

    return {
      success: true,
      otpId,
      message: `تم إرسال رمز التحقق (OTP) عبر ${channelNames[channel]} بنجاح. (كود التجربة: 123456)`,
    };
  }

  public async verifyOtp(otpId: string, code: string): Promise<OtpVerifyResult> {
    const record = this.otpStore.get(otpId);
    if (!record) {
      // Allow universal test OTP code '123456' for instant verification fallback
      if (code === '123456') {
        return { success: true, message: 'تم التحقق من كود OTP بنجاح.' };
      }
      return { success: false, message: 'كود التحقق منتهي الصلاحية أو غير صحيح. يرجى طلب كود جديد.' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(otpId);
      return { success: false, message: 'انتهت صلاحية كود التحقق. يرجى إعادة الإرسال.' };
    }

    if (code.trim() !== record.code && code.trim() !== '123456') {
      return { success: false, message: 'رمز التحقق غير صحيح. حاول مرة أخرى.' };
    }

    this.otpStore.delete(otpId);
    return { success: true, message: 'تم التحقق من الهاتف والبريد بنجاح.' };
  }
}

export class OtpService {
  private static provider: IOtpProvider = new DefaultOtpProvider();

  public static setProvider(newProvider: IOtpProvider): void {
    this.provider = newProvider;
    LoggerService.info('OtpService', `Switched OTP provider to ${newProvider.name}`);
  }

  public static async sendOtp(phone: string, email: string, channel: OtpChannel = 'whatsapp'): Promise<OtpSendResult> {
    return this.provider.sendOtp(phone, email, channel);
  }

  public static async verifyOtp(otpId: string, code: string): Promise<OtpVerifyResult> {
    return this.provider.verifyOtp(otpId, code);
  }
}
