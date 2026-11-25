import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Calendar,
  Users,
  PieChart,
  MessageSquare,
  Send,
  BarChart3,
  User,
  Bell,
  ChevronDown,
  LayoutGrid,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useEventReach } from '../../context/EventReachContext';
import { NavPage } from '../../types/eventreach';
import { BrandMark, UserAvatarDisplay } from '../common/BrandMark';

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'audiens', label: 'Data Audiens', icon: Users },
  { id: 'segmentasi', label: 'Segmentasi Audiens', icon: PieChart },
  { id: 'strategi', label: 'Strategi Komunikasi', icon: MessageSquare },
  { id: 'promosi', label: 'Media Promosi', icon: Send },
  { id: 'evaluasi', label: 'Evaluasi & Laporan', icon: BarChart3 },
  { id: 'profil', label: 'Profil', icon: User },
];

const PAGE_TITLES: Record<NavPage, string> = {
  beranda: 'Beranda',
  event: 'Manajemen Event',
  audiens: 'Data Audiens',
  segmentasi: 'Segmentasi Audiens',
  strategi: 'Strategi Komunikasi',
  promosi: 'Media Promosi',
  evaluasi: 'Evaluasi & Laporan',
  profil: 'Profil & Pengaturan',
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentPage,
    setCurrentPage,
    events,
    activeEvent,
    activeEventId,
    setActiveEventId,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    profile,
  } = useEventReach();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (page: NavPage) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setNotifOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FDF6F7] text-[#341C24] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-[#F1DCE1] z-30">
        <div className="h-16 px-5 flex items-center border-b border-[#F5E5E9]">
          <button
            type="button"
            onClick={() => handleNavigate('beranda')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE5D72] rounded-lg"
          >
            <BrandMark size="md" />
          </button>
        </div>

        {/* Active Event Switcher */}
        <div className="px-4 pt-4 pb-3 border-b border-[#F5E5E9]">
          <label
            htmlFor="desktop-event-select"
            className="block text-[11px] font-semibold text-[#7A5C66] mb-1.5"
          >
            Event Aktif
          </label>
          <div className="relative">
            <select
              id="desktop-event-select"
              value={activeEventId}
              onChange={(e) => setActiveEventId(e.target.value)}
              className="w-full appearance-none bg-[#FDF2F4] border border-[#EBCBD3] text-[#341C24] text-xs font-semibold rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#AE5D72] truncate"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AE5D72] pointer-events-none"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#AE5D72] text-white shadow-sm'
                    : 'text-[#6D4E58] hover:bg-[#FCECEF] hover:text-[#341C24]'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-white shrink-0' : 'text-[#B56576] shrink-0'}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Profile Summary */}
        <div className="p-3 border-t border-[#F5E5E9]">
          <button
            type="button"
            onClick={() => handleNavigate('profil')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#FDF2F4] transition-colors text-left"
          >
            <UserAvatarDisplay profile={profile} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#341C24] truncate">
                {profile.name}
              </p>
              <p className="text-[11px] text-[#7A5C66] truncate">{profile.role}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-14 lg:h-16 bg-white/95 backdrop-blur-sm border-b border-[#F1DCE1] px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => handleNavigate('beranda')}
                className="flex items-center"
              >
                <BrandMark size="sm" />
              </button>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm min-w-0">
              <span className="text-[#7A5C66] whitespace-nowrap">EventReach</span>
              <span className="text-[#D4A7B3]" aria-hidden="true">/</span>
              <span className="font-semibold text-[#341C24] truncate">
                {PAGE_TITLES[currentPage]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Mobile quick event selector */}
            <div className="lg:hidden relative max-w-[155px]">
              <select
                aria-label="Pilih Event Aktif"
                value={activeEventId}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="w-full appearance-none bg-[#FDF2F4] border border-[#EBCBD3] text-[#341C24] text-xs font-medium rounded-lg pl-2.5 pr-6 py-1.5 truncate focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#AE5D72] pointer-events-none"
              />
            </div>

            {/* Desktop active event text indicator */}
            {activeEvent && (
              <button
                type="button"
                onClick={() => handleNavigate('event')}
                className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FDF2F4] border border-[#F0D5DC] text-xs font-medium text-[#6D4E58] hover:border-[#AE5D72] transition-colors whitespace-nowrap shrink-0"
              >
                <Calendar size={14} className="text-[#AE5D72]" />
                <span className="max-w-[200px] truncate text-[#341C24] font-semibold">
                  {activeEvent.name}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeEvent.status}</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifikasi"
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#AE5D72] hover:bg-[#FCECEF] transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#AE5D72] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#F0D5DC] rounded-2xl shadow-xl overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-[#F5E5E9] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#341C24]">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#AE5D72] hover:text-[#8F4458]"
                      >
                        <Check size={13} />
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F7E8EC]">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-[#7A5C66]">
                        Belum ada notifikasi baru.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(notif.id);
                            handleNavigate(notif.targetPage);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-[#FDF6F7] transition-colors flex items-start gap-3 ${
                            notif.read ? 'opacity-75' : 'bg-[#FFF9FA]'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-[#341C24] truncate">
                                {notif.title}
                              </p>
                              <span className="text-[11px] text-[#8E6F79] shrink-0">
                                {notif.timestamp}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[#6D4E58] leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-[#B56576] mt-0.5 shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile button on desktop header */}
            <button
              type="button"
              onClick={() => handleNavigate('profil')}
              aria-label="Buka Profil"
              className="hidden sm:flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE5D72]"
            >
              <UserAvatarDisplay profile={profile} size="sm" />
            </button>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Inspired by Sketch Dusty Rose Bar) */}
      <nav
        aria-label="Navigasi bawah mobile"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 px-3 pb-2 pt-1 pointer-events-none"
      >
        <div className="pointer-events-auto mx-auto max-w-md bg-[#AE5D72] text-white rounded-2xl shadow-lg px-2 py-1.5 flex items-center justify-around">
          {[
            { id: 'beranda' as const, label: 'Beranda', icon: Home },
            { id: 'event' as const, label: 'Event', icon: Calendar },
            { id: 'segmentasi' as const, label: 'Segmen', icon: PieChart },
            { id: 'profil' as const, label: 'Profil', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`min-h-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`min-h-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-medium transition-colors ${
              ['audiens', 'strategi', 'promosi', 'evaluasi'].includes(currentPage)
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Menu Sheet */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[#341C24]/45 flex items-end"
          role="dialog"
          aria-modal="true"
          aria-label="Semua Menu EventReach"
        >
          <div className="w-full bg-white rounded-t-3xl p-5 pb-7 shadow-2xl border-t border-[#F0D5DC]">
            <div className="flex items-center justify-between mb-4">
              <BrandMark size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu"
                className="p-2 rounded-xl text-[#6D4E58] hover:bg-[#FDF2F4]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`min-h-[48px] flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#AE5D72] text-white border-[#AE5D72]'
                        : 'bg-[#FDF6F7] text-[#341C24] border-[#F0D5DC] hover:bg-[#FCECEF]'
                    }`}
                  >
                    <Icon
                      size={17}
                      className={isActive ? 'text-white shrink-0' : 'text-[#AE5D72] shrink-0'}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
