import React, { useMemo } from 'react';
import {
  Users,
  Calendar,
  PieChart,
  Megaphone,
  BarChart3,
  Send,
  Mail,
  ChevronRight,
  Clock,
  MapPin,
  Smile,
} from 'lucide-react';
import {
  calculateMemberCompleteness,
  useEventReach,
} from '../context/EventReachContext';
import { DonutChart } from '../components/common/Charts';
import { AudienceCategory } from '../types/eventreach';

const CATEGORY_COLORS: Record<AudienceCategory, string> = {
  Mahasiswa: '#AE5D72',
  Dosen: '#F2B5C4',
  Alumni: '#D9869A',
  'Masyarakat Umum': '#7A3E50',
};

function formatIndoDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const DashboardPage: React.FC = () => {
  const {
    profile,
    activeEvent,
    activeAudiences,
    activeSegments,
    activeStrategies,
    activePromoPlans,
    activeActivities,
    setCurrentPage,
  } = useEventReach();

  const firstName = profile.name.split(' ')[0] || 'Panitia';

  const stats = useMemo(() => {
    const total = activeAudiences.length;
    const avgCompleteness =
      total === 0
        ? 0
        : Math.round(
            activeAudiences.reduce(
              (acc, m) => acc + calculateMemberCompleteness(m),
              0
            ) / total
          );

    const categories: AudienceCategory[] = [
      'Mahasiswa',
      'Dosen',
      'Alumni',
      'Masyarakat Umum',
    ];
    const breakdown = categories.map((cat) => {
      const count = activeAudiences.filter((a) => a.category === cat).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        category: cat,
        count,
        pct,
        color: CATEGORY_COLORS[cat],
      };
    });

    const confirmedCount = activeAudiences.filter(
      (a) => a.status === 'Terkonfirmasi' || a.status === 'Terdaftar'
    ).length;

    return { total, avgCompleteness, breakdown, confirmedCount };
  }, [activeAudiences]);

  const donutSlices = stats.breakdown.map((b) => ({
    label: b.category,
    value: b.count,
    color: b.color,
  }));

  const completenessSlices = [
    { label: 'Lengkap', value: stats.avgCompleteness, color: '#8F4458' },
    {
      label: 'Belum Lengkap',
      value: Math.max(0, 100 - stats.avgCompleteness),
      color: '#FFFFFF',
    },
  ];

  const quickMenus = [
    {
      id: 'audiens' as const,
      title: 'Data Audiens',
      subtitle: `${stats.total} peserta tercatat`,
      icon: Users,
    },
    {
      id: 'segmentasi' as const,
      title: 'Segmentasi Audiens',
      subtitle: `${activeSegments.length} segmen tersimpan`,
      icon: PieChart,
    },
    {
      id: 'strategi' as const,
      title: 'Pesan Komunikasi',
      subtitle: `${activeStrategies.length} strategi aktif`,
      icon: Mail,
    },
    {
      id: 'promosi' as const,
      title: 'Media Promosi',
      subtitle: `${activePromoPlans.length} jadwal konten`,
      icon: Send,
    },
    {
      id: 'evaluasi' as const,
      title: 'Evaluasi & Laporan',
      subtitle: 'Grafik & konversi',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Greeting & Alternatif C Inspired Hero Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 bg-white border border-[#F1DCE1] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#341C24] tracking-tight text-balance">
              Hi, {firstName}!
            </h1>
            <p className="mt-1 text-sm sm:text-base text-[#6D4E58]">
              Berikut ringkasan audiens dan strategi komunikasi event kamu.
            </p>
          </div>

          {/* Sketch-inspired Soft Blush Hero Stat Panel */}
          <div className="mt-5 bg-[#FAD7DF] rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-3.5 sm:border-r sm:border-[#E5AEBC] sm:pr-4">
              <div className="w-12 h-12 rounded-2xl bg-white/75 flex items-center justify-center text-[#8F4458] shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#4A202D] tabular-nums leading-none">
                  {stats.total.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#6E3647]">
                  Calon Peserta Terdata
                </p>
                <p className="text-[11px] text-[#7D4758] tabular-nums">
                  {stats.confirmedCount} terdaftar · target {activeEvent?.targetParticipants || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 sm:pl-2">
              <DonutChart
                slices={completenessSlices}
                size={68}
                strokeWidth={11}
                centerLabel={`${stats.avgCompleteness}%`}
              />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#4A202D] tabular-nums leading-none">
                  {stats.avgCompleteness}%
                </p>
                <p className="mt-1 text-xs font-semibold text-[#6E3647]">
                  Data Lengkap
                </p>
                <p className="text-[11px] text-[#7D4758]">
                  Kelengkapan profil peserta
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternatif C Inspired Welcome Banner + Active Event Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#AE5D72] text-white rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-base sm:text-lg font-semibold leading-snug text-balance">
                Kelola Strategi Event dengan Lebih Mudah!
              </p>
              <p className="mt-1 text-xs text-white/85">
                Segmentasi peserta, susun pesan, dan pantau jadwal promosi dalam satu tempat.
              </p>
              <button
                type="button"
                onClick={() => setCurrentPage('segmentasi')}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#8F4458] text-xs font-semibold hover:bg-[#FFF3F5] transition-colors whitespace-nowrap"
              >
                Mulai Segmentasi
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F5CED7] text-[#8F4458] flex items-center justify-center shrink-0">
              <Smile size={36} strokeWidth={1.75} />
            </div>
          </div>

          {activeEvent && (
            <button
              type="button"
              onClick={() => setCurrentPage('event')}
              className="flex-1 bg-[#FCECEF] hover:bg-[#F9DDE4] border border-[#F0D5DC] rounded-2xl p-4 sm:p-5 text-left transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white border border-[#F0D5DC] flex items-center justify-center text-[#AE5D72] shrink-0">
                  <Calendar size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#AE5D72]">
                    Event Aktif · {activeEvent.status}
                  </p>
                  <h2 className="text-base font-bold text-[#341C24] truncate mt-0.5">
                    {activeEvent.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#6D4E58] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock size={12} />
                      {formatIndoDate(activeEvent.date)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin size={12} />
                      {activeEvent.location}
                    </span>
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#AE5D72] shrink-0" />
            </button>
          )}
        </div>
      </section>

      {/* Main Analytics & Quick Access Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Profil Audiens Card (Alternatif A) */}
        <div className="lg:col-span-5 bg-white border border-[#F1DCE1] rounded-2xl p-6">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-bold text-[#341C24]">Profil Audiens</h2>
              <p className="text-xs text-[#7A5C66]">
                Distribusi kategori calon peserta event aktif
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage('audiens')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#AE5D72] hover:text-[#8F4458] whitespace-nowrap"
            >
              Lihat Data
              <ChevronRight size={15} />
            </button>
          </div>

          {stats.total === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-[#6D4E58]">
                Belum ada data audiens untuk event ini.
              </p>
              <button
                type="button"
                onClick={() => setCurrentPage('audiens')}
                className="mt-3 px-4 py-2 rounded-xl bg-[#AE5D72] text-white text-xs font-semibold hover:bg-[#8F4458]"
              >
                Tambah Data Audiens
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <DonutChart
                slices={donutSlices}
                size={156}
                strokeWidth={28}
                centerLabel={String(stats.total)}
                centerSublabel="Peserta"
              />
              <div className="flex-1 w-full space-y-3">
                {stats.breakdown.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#341C24] font-medium truncate">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums shrink-0">
                      <span className="text-xs text-[#7A5C66]">{item.count} org</span>
                      <span className="text-xs font-bold text-[#341C24] w-9 text-right">
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Menu Cepat (Quick Access) + Recent Activity */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-[#F1DCE1] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#341C24]">Menu Cepat</h2>
              <span className="text-xs text-[#7A5C66]">Alur kerja utama</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickMenus.map((menu) => {
                const Icon = menu.icon;
                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => setCurrentPage(menu.id)}
                    className="group flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FDF6F7] hover:bg-[#FCECEF] border border-[#F1DCE1] hover:border-[#DCAAB7] text-left transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#F1DCE1] flex items-center justify-center text-[#AE5D72] shrink-0 group-hover:bg-[#AE5D72] group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#341C24] truncate">
                          {menu.title}
                        </p>
                        <p className="text-[11px] text-[#7A5C66] truncate mt-0.5 tabular-nums">
                          {menu.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-[#B56576] shrink-0 group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCurrentPage('strategi')}
                className="group flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FCECEF] hover:bg-[#F7D7DF] border border-[#EBCBD3] text-left transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#AE5D72] flex items-center justify-center text-white shrink-0">
                    <Megaphone size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#341C24] truncate">
                      Buat Strategi
                    </p>
                    <p className="text-[11px] text-[#6D4E58] truncate mt-0.5">
                      Susun pesan baru
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#8F4458] shrink-0" />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-[#F1DCE1] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#341C24]">Aktivitas Terbaru</h2>
              <span className="text-xs text-[#7A5C66] tabular-nums">
                {activeActivities.length} catatan
              </span>
            </div>

            {activeActivities.length === 0 ? (
              <p className="text-sm text-[#7A5C66] py-4">
                Belum ada aktivitas tercatat untuk event ini.
              </p>
            ) : (
              <div className="divide-y divide-[#F5E5E9]">
                {activeActivities.slice(0, 4).map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setCurrentPage(act.targetPage)}
                    className="w-full py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-left hover:bg-[#FDF6F7] rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#341C24] truncate">
                        {act.title}
                      </p>
                      <p className="text-xs text-[#6D4E58] truncate mt-0.5">
                        {act.detail}
                      </p>
                    </div>
                    <span className="text-xs text-[#8E6F79] whitespace-nowrap shrink-0">
                      {act.timestamp}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
