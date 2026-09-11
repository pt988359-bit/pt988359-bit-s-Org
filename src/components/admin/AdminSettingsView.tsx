import React, { useState } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Settings, MapPin, Clock, Phone, Mail, Share2, Shield, FileText } from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { settings, updateSettings } = useShowroom();
  const { showToast } = useToast();

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.brandTagline);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [secondaryPhone, setSecondaryPhone] = useState(settings.secondaryPhone || '');
  const [whatsapp, setWhatsapp] = useState(settings.whatsappPhone);
  const [secondaryWhatsapp, setSecondaryWhatsapp] = useState(settings.secondaryWhatsappPhone || '');

  const [fullAddress, setFullAddress] = useState(settings.address.fullAddress);
  const [googleMaps, setGoogleMaps] = useState(settings.address.googleMapsUrl);
  const [workingText, setWorkingText] = useState(settings.workingHours.text);

  const [fb, setFb] = useState(settings.socialLinks?.facebook || '');
  const [ig, setIg] = useState(settings.socialLinks?.instagram || '');
  const [yt, setYt] = useState(settings.socialLinks?.youtube || '');

  const [warrantyPol, setWarrantyPol] = useState(settings.businessPolicies?.warrantyPolicy || '');
  const [reservationPol, setReservationPol] = useState(settings.businessPolicies?.reservationPolicy || '');
  const [returnPol, setReturnPol] = useState(settings.businessPolicies?.returnPolicy || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name,
      brandTagline: tagline,
      email,
      phone,
      secondaryPhone,
      whatsappPhone: whatsapp,
      secondaryWhatsappPhone: secondaryWhatsapp,
      address: {
        ...settings.address,
        fullAddress,
        googleMapsUrl: googleMaps,
      },
      workingHours: {
        ...settings.workingHours,
        text: workingText,
      },
      socialLinks: {
        facebook: fb,
        instagram: ig,
        youtube: yt,
      },
      businessPolicies: {
        warrantyPolicy: warrantyPol,
        reservationPolicy: reservationPol,
        returnPolicy: returnPol,
        inspectionPolicy: settings.businessPolicies?.inspectionPolicy || '',
      },
    });

    showToast('تم حفظ الإعدادات', 'تم تحديث كافة بيانات وسياسات المعرض بنجاح', 'success');
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Main Info */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              البيانات الرئيسية للمعرض والتواصل
            </h2>
          </CardHeader>
          <CardBody className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="اسم المعرض" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="الشعار العربي" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            <Input label="البريد الإلكتروني المعتمد" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="هاتف المعرض الأساسي (Call & WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="هاتف المعرض الثاني (Call & WhatsApp)" value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} />
            <Input label="رقم واتساب الأساسي" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <Input label="رقم واتساب الثاني" value={secondaryWhatsapp} onChange={(e) => setSecondaryWhatsapp(e.target.value)} />
          </CardBody>
        </Card>

        {/* Location & Hours */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              العنوان ومواعيد العمل
            </h3>
          </CardHeader>
          <CardBody className="p-6 flex flex-col gap-4">
            <Input label="العنوان التفصيلي" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
            <Input label="رابط خريطة Google Maps" value={googleMaps} onChange={(e) => setGoogleMaps(e.target.value)} />
            <Input label="نص مواعيد العمل" value={workingText} onChange={(e) => setWorkingText(e.target.value)} />
          </CardBody>
        </Card>

        {/* Social Links */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-400" />
              روابط التواصل الاجتماعي
            </h3>
          </CardHeader>
          <CardBody className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="رابط فيسبوك Facebook" value={fb} onChange={(e) => setFb(e.target.value)} />
            <Input label="رابط إنستجرام Instagram" value={ig} onChange={(e) => setIg(e.target.value)} />
            <Input label="رابط يوتيوب YouTube" value={yt} onChange={(e) => setYt(e.target.value)} />
          </CardBody>
        </Card>

        {/* Business Policies */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              سياسات وشروط المعرض
            </h3>
          </CardHeader>
          <CardBody className="p-6 flex flex-col gap-4">
            <Textarea label="سياسة الضمان والصيانة" value={warrantyPol} onChange={(e) => setWarrantyPol(e.target.value)} rows={3} />
            <Textarea label="سياسة حجز العربون" value={reservationPol} onChange={(e) => setReservationPol(e.target.value)} rows={3} />
            <Textarea label="سياسة الاسترجاع والاستبدال" value={returnPol} onChange={(e) => setReturnPol(e.target.value)} rows={3} />
          </CardBody>
        </Card>

        <Button variant="electric" type="submit" className="w-full sm:w-fit font-bold">
          حفظ كافة الإعدادات والسياسات
        </Button>
      </form>
    </div>
  );
};
