import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  X,
  CheckCircle2,
  FileEdit,
  Send,
} from 'lucide-react';
import { useEventReach } from '../context/EventReachContext';
import {
  MediaPlatform,
  PromoPlan,
  PromoStatus,
} from '../types/eventreach';

const PLATFORMS: MediaPlatform[] = [
  'Instagram',
  'TikTok',
  'WhatsApp',
  'Email',
  'Poster',
  'Website',
];

const STATUSES: PromoStatus[] = ['Draft', 'Scheduled', 'Published'];

const DEFAULT_CONTENT_TYPES: Record<MediaPlatform, string> = {
  Instagram: 'Reels / Carousel Feed',
  TikTok: 'Video Pendek Vertikal',
  WhatsApp: 'Broadcast Pesan Grup',
  Email: 'Newsletter / Undangan Digital',
  Poster: 'Poster Cetak A3 + QR',
  Website: 'Banner Landing Page',
};

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const PromoMediaPage: React.FC = () => {
  const {
    activeEvent,
    activeEventId,
    activePromoPlans,
    activeStrategies,
    addPromoPlan,
    updatePromoPlan,
    deletePromoPlan,
    requestConfirm,
  } = useEventReach();

  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [platformFilter, setPlatformFilter] = useState<'Semua' | MediaPlatform>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | PromoStatus>('Semua');

  // Calendar navigation state (default to Nov/Dec 2026 where seed promos sit)
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(10); // 0-indexed: 10 = November

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PromoPlan | null>(null);

  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<MediaPlatform>('Instagram');
  const [publishDate, setPublishDate] = useState('2026-11-28');
  const [publishTime, setPublishTime] = useState('18:00');
  const [contentType, setContentType] = useState(DEFAULT_CONTENT_TYPES.Instagram);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState<PromoStatus>('Scheduled');
  const [strategyId, setStrategyId] = useState('');

  const filteredPlans = useMemo(() => {
    return activePromoPlans
      .filter((p) => {
        if (platformFilter !== 'Semua' && p.platform !== platformFilter) return false;
        if (statusFilter !== 'Semua' && p.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  }, [activePromoPlans, platformFilter, statusFilter]);

  const openCreateModal = (prefillDate?: string) => {
    setEditingPlan(null);
    setTitle('');
    setPlatform('Instagram');
    setPublishDate(prefillDate || '2026-12-01');
    setPublishTime('18:00');
    setContentType(DEFAULT_CONTENT_TYPES.Instagram);
    setCaption('');
    setStatus('Scheduled');
    setStrategyId(activeStrategies[0]?.id || '');
    setModalOpen(true);
  };

  const openEditModal = (plan: PromoPlan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setPlatform(plan.platform);
    setPublishDate(plan.publishDate);
    setPublishTime(plan.publishTime);
    setContentType(plan.contentType);
    setCaption(plan.caption);
    setStatus(plan.status);
    setStrategyId(plan.strategyId || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !publishDate) return;

    const payload = {
      eventId: activeEventId,
      title: title.trim(),
      platform,
      publishDate,
      publishTime,
      contentType: contentType.trim() || DEFAULT_CONTENT_TYPES[platform],
      caption: caption.trim(),
      status,
      strategyId: strategyId || undefined,
    };

    if (editingPlan) {
      updatePromoPlan(editingPlan.id, payload);
    } else {
      addPromoPlan(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = (plan: PromoPlan) => {
    requestConfirm({
      title: `Hapus Rencana "${plan.title}"?`,
      message: `Jadwal promosi ${plan.platform} pada tanggal ${plan.publishDate} akan dihapus dari daftar rencana.`,
      confirmLabel: 'Hapus Rencana',
      variant: 'danger',
      onConfirm: () => deletePromoPlan(plan.id),
    });
  };

  const cycleStatus = (plan: PromoPlan) => {
    const nextMap: Record<PromoStatus, PromoStatus> = {
      Draft: 'Scheduled',
      Scheduled: 'Published',
      Published: 'Draft',
    };
    updatePromoPlan(plan.id, { status: nextMap[plan.status] });
  };

  const statusBadge = (st: PromoStatus) => {
    if (st === 'Published') {
      return {
        cls: 'bg-[#ECFDF5] text-[#1F7A53]',
        icon: <CheckCircle2 size={12} />,
      };
    }
    if (st === 'Scheduled') {
      return {
        cls: 'bg-[#FFFBEB] text-[#B45309]',
        icon: <Clock size={12} />,
      };
    }
    return {
      cls: 'bg-[#FCECEF] text-[#8F4458]',
      icon: <FileEdit size={12} />,
    };
  };

  // Calendar grid computation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: { day: number | null; dateStr: string }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(calMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      cells.push({ day: d, dateStr: `${calYear}-${mm}-${dd}` });
    }
    return cells;
  }, [calYear, calMonth]);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#341C24] tracking-tight">
            Media Promosi
          </h1>
          <p className="mt-1 text-sm text-[#6D4E58]">
            Rencanakan jadwal publikasi dan konten promosi untuk {activeEvent?.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Plus size={18} />
          Tambah Rencana Promosi
        </button>
      </div>

      {/* Planning Disclaimer */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FDF2F4] border border-[#F0D5DC] text-xs text-[#6D4E58]">
        <Info size={16} className="text-[#AE5D72] shrink-0 mt-0.5" />
        <p>
          Halaman ini berfungsi sebagai perencana jadwal &amp; arsip konten promosi panitia (tidak mempublikasikan konten secara otomatis ke media sosial eksternal).
        </p>
      </div>

      {/* Toolbar: View Mode + Filters */}
      <div className="bg-white border border-[#F1DCE1] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['Semua', ...PLATFORMS] as const).map((pl) => (
            <button
              key={pl}
              type="button"
              onClick={() => setPlatformFilter(pl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                platformFilter === pl
                  ? 'bg-[#AE5D72] text-white'
                  : 'bg-[#FDF6F7] text-[#6D4E58] hover:bg-[#FCECEF]'
              }`}
            >
              {pl}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <select
            aria-label="Filter status promosi"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'Semua' | PromoStatus)
            }
            className="px-3 py-1.5 rounded-xl bg-[#FDF6F7] border border-[#EBCBD3] text-xs font-semibold text-[#341C24] focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
          >
            <option value="Semua">Semua Status</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <div className="inline-flex items-center p-1 bg-[#FDF6F7] border border-[#EBCBD3] rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#341C24] shadow-sm'
                  : 'text-[#6D4E58] hover:text-[#341C24]'
              }`}
            >
              <List size={14} />
              Jadwal
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#341C24] shadow-sm'
                  : 'text-[#6D4E58] hover:text-[#341C24]'
              }`}
            >
              <CalendarIcon size={14} />
              Kalender
            </button>
          </div>
        </div>
      </div>

      {/* TIMELINE / LIST VIEW */}
      {viewMode === 'timeline' && (
        <>
          {filteredPlans.length === 0 ? (
            <div className="bg-white border border-[#F1DCE1] rounded-2xl p-12 text-center">
              <Send size={38} className="mx-auto text-[#D99BA9] mb-3" />
              <h3 className="text-base font-semibold text-[#341C24]">
                Belum ada rencana promosi
              </h3>
              <p className="mt-1 text-sm text-[#6D4E58]">
                Tambahkan jadwal konten Instagram, TikTok, WhatsApp, Email, Poster, atau Website.
              </p>
              <button
                type="button"
                onClick={() => openCreateModal()}
                className="mt-4 px-4 py-2 rounded-xl bg-[#AE5D72] text-white text-xs font-semibold hover:bg-[#8F4458]"
              >
                Buat Rencana Promosi
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlans.map((plan) => {
                const badge = statusBadge(plan.status);
                const linkedStrategy = activeStrategies.find(
                  (s) => s.id === plan.strategyId
                );

                return (
                  <article
                    key={plan.id}
                    className="bg-white border border-[#F1DCE1] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${badge.cls}`}
                        >
                          {badge.icon}
                          {plan.status}
                        </span>
                        <span className="font-bold text-[#AE5D72]">
                          {plan.platform}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#6D4E58]">{plan.contentType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#341C24] font-semibold tabular-nums">
                          {plan.publishDate} ({plan.publishTime} WIB)
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-[#341C24]">
                        {plan.title}
                      </h2>

                      {plan.caption && (
                        <p className="text-xs text-[#6D4E58] leading-relaxed line-clamp-2">
                          {plan.caption}
                        </p>
                      )}

                      {linkedStrategy && (
                        <p className="text-[11px] text-[#8F4458]">
                          Terkait strategi: <strong>{linkedStrategy.title}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F5E5E9]">
                      <button
                        type="button"
                        onClick={() => cycleStatus(plan)}
                        className="px-3 py-1.5 rounded-lg bg-[#FDF2F4] hover:bg-[#FCECEF] border border-[#EBCBD3] text-xs font-semibold text-[#8F4458] whitespace-nowrap"
                      >
                        Ubah Status
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(plan)}
                        aria-label={`Edit ${plan.title}`}
                        className="p-2 rounded-lg text-[#6D4E58] hover:bg-[#FDF2F4] hover:text-[#AE5D72]"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(plan)}
                        aria-label={`Hapus ${plan.title}`}
                        className="p-2 rounded-lg text-[#6D4E58] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <section className="bg-white border border-[#F1DCE1] rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-[#341C24] tabular-nums">
              {MONTH_NAMES_ID[calMonth]} {calYear}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Bulan sebelumnya"
                className="p-2 rounded-xl border border-[#EBCBD3] text-[#6D4E58] hover:bg-[#FDF2F4]"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Bulan berikutnya"
                className="p-2 rounded-xl border border-[#EBCBD3] text-[#6D4E58] hover:bg-[#FDF2F4]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-[#7A5C66] pb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              if (!cell.day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[76px] sm:min-h-[96px] rounded-xl bg-[#FDF9FA]"
                  />
                );
              }
              const dayPlans = filteredPlans.filter(
                (p) => p.publishDate === cell.dateStr
              );
              return (
                <div
                  key={cell.dateStr}
                  className="min-h-[76px] sm:min-h-[96px] rounded-xl border border-[#F3DFE4] p-1.5 flex flex-col justify-between bg-white hover:border-[#DCAAB7] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#341C24] tabular-nums">
                      {cell.day}
                    </span>
                    <button
                      type="button"
                      onClick={() => openCreateModal(cell.dateStr)}
                      aria-label={`Tambah promosi tanggal ${cell.dateStr}`}
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[#AE5D72] hover:bg-[#FCECEF]"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="mt-1 space-y-1">
                    {dayPlans.map((dp) => (
                      <button
                        key={dp.id}
                        type="button"
                        onClick={() => openEditModal(dp)}
                        className={`w-full text-left px-1.5 py-1 rounded-md text-[10px] font-semibold truncate transition-colors ${
                          dp.status === 'Published'
                            ? 'bg-[#ECFDF5] text-[#1F7A53]'
                            : dp.status === 'Scheduled'
                            ? 'bg-[#FCECEF] text-[#8F4458]'
                            : 'bg-[#F5ECEF] text-[#6D4E58]'
                        }`}
                        title={`${dp.platform}: ${dp.title}`}
                      >
                        {dp.platform} · {dp.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Add / Edit Promo Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#341C24]/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white border border-[#F0D5DC] rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#341C24]">
                {editingPlan ? 'Edit Rencana Promosi' : 'Tambah Rencana Promosi'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup form"
                className="p-1.5 rounded-lg text-[#7A5C66] hover:bg-[#FDF2F4]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Judul Konten / Promosi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Reels Pengumuman Pembicara"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Platform / Media
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => {
                      const nextPlatform = e.target.value as MediaPlatform;
                      setPlatform(nextPlatform);
                      setContentType(DEFAULT_CONTENT_TYPES[nextPlatform]);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    {PLATFORMS.map((pl) => (
                      <option key={pl} value={pl}>
                        {pl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PromoStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Tanggal Publikasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Jam Tayang (WIB)
                  </label>
                  <input
                    type="time"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Jenis Konten
                </label>
                <input
                  type="text"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  placeholder="Contoh: Carousel Edukatif, Broadcast Pesan, Poster A3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              {activeStrategies.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Tautkan ke Strategi Komunikasi (Opsional)
                  </label>
                  <select
                    value={strategyId}
                    onChange={(e) => setStrategyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    <option value="">Tidak ditautkan</option>
                    {activeStrategies.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.title} ({st.segmentName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Caption / Deskripsi Konten
                </label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tulis draft caption atau catatan desain untuk tim kreatif..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#ECCFD6] text-sm font-medium text-[#6D4E58] hover:bg-[#FDF2F4]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold"
                >
                  {editingPlan ? 'Simpan Perubahan' : 'Simpan Rencana'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
