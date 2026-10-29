import React, { useState, useRef, useEffect } from 'react';
import { useShowroom, RoutePath } from '../../context/ShowroomContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  Sparkles,
  Search,
  ShoppingBag,
  Menu,
  X,
  Phone,
  Clock,
  MapPin,
  PlusCircle,
  MessageCircle,
  Layers,
  Info,
  HelpCircle,
  UserCheck,
  User,
  LogOut,
  FileText,
  ChevronDown,
  Facebook,
} from 'lucide-react';
import { formatPhoneForDisplay, normalizeEgyptianPhone } from '../../utils/phoneUtils';

export const Header: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    settings,
    searchQuery,
    setSearchQuery,
  } = useShowroom();

  const {
    customer,
    isCustomerAuthenticated,
    openLoginModal,
    logoutCustomer,
  } = useCustomerAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { label: string; route: RoutePath; icon: React.ReactNode }[] = [
    { label: 'الرئيسية', route: 'home', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'الأجهزة والمعرض', route: 'products', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'الأقسام', route: 'categories', icon: <Layers className="w-4 h-4" /> },
    { label: 'بيع جهازك', route: 'sell', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'عن المعرض', route: 'about', icon: <Info className="w-4 h-4" /> },
    { label: 'الأسئلة الشائعة', route: 'faq', icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'اتصل بنا', route: 'contact', icon: <MapPin className="w-4 h-4" /> },
  ];

  const handleNav = (route: RoutePath) => {
    navigateTo(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      {/* Top Token Bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-slate-300 to-blue-500 w-full"></div>

      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 hidden sm:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {settings.address.fullAddress}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {settings.workingHours.text}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            {/* Primary Phone */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${settings.phone}`}
                className="hover:text-blue-400 font-bold flex items-center gap-1 transition-colors"
                title="اتصال بالخط الرئيسي"
              >
                <Phone className="w-3 h-3 text-blue-400" />
                <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.phone)}</span>
              </a>
              <a
                href={`https://wa.me/${normalizeEgyptianPhone(settings.whatsappPhone || settings.phone)}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-medium"
                title="مراسلة الخط الرئيسي واتساب"
              >
                <MessageCircle className="w-3 h-3" />
              </a>
            </div>

            {/* Secondary Phone */}
            {settings.secondaryPhone && (
              <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
                <a
                  href={`tel:${settings.secondaryPhone}`}
                  className="hover:text-blue-400 font-bold flex items-center gap-1 transition-colors"
                  title="اتصال بالخط الثاني"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.secondaryPhone)}</span>
                </a>
                <a
                  href={`https://wa.me/${normalizeEgyptianPhone(settings.secondaryWhatsappPhone || settings.secondaryPhone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-medium"
                  title="مراسلة الخط الثاني واتساب"
                >
                  <MessageCircle className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Official Facebook Icon */}
            {settings.socialLinks?.facebook && (
              <a
                href={settings.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 hover:text-blue-400 transition-colors border-r border-slate-700 pr-4 flex items-center gap-1"
                title="صفحة المعرض الرسمية على فيسبوك"
              >
                <Facebook className="w-3.5 h-3.5 fill-current text-blue-500" />
                <span className="hidden lg:inline text-[11px]">فيسبوك المعرض</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 sm:gap-3 group text-right cursor-pointer select-none shrink-0"
        >
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-400 whitespace-nowrap">
              PRO <span className="text-slate-900 dark:text-white">TECK</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 -mt-0.5 whitespace-nowrap">
              Home Appliances Luxury
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={`text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                    : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white pb-1'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-60">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن ثلاجة، شاشة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (currentRoute !== 'products') navigateTo('products');
              }}
              className="w-full text-xs pl-3 pr-9 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Customer Identity Control */}
          {isCustomerAuthenticated && customer ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition-all hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer shadow-sm border border-slate-700/50"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">
                  <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                </div>
                <span className="max-w-[75px] sm:max-w-[120px] truncate">
                  {customer.name || customer.phone}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Strict 2-Option Dropdown */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-right">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleNav('my-activity');
                    }}
                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-right"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>نشاطاتي</span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logoutCustomer();
                    }}
                    className="w-full px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer text-right"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
              title="تسجيل الدخول لتتبع الطلبات"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-3 shadow-2xl">
          <div className="relative w-full mb-2">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث داخل أجهزة المعرض..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-3 pr-9 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            />
          </div>

          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={`p-3 rounded-xl text-sm font-bold flex items-center gap-3 text-right ${
                currentRoute === item.route
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
