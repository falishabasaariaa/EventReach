import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  Eye,
  X,
  ArrowRight,
} from 'lucide-react';
import { useEventReach } from '../context/EventReachContext';
import { EventItem, EventStatus } from '../types/eventreach';

const EMPTY_EVENT_FORM = {
  name: '',
  date: '',
  time: '09:00 - 15:00 WIB',
  location: '',
  description: '',
  status: 'Upcoming' as EventStatus,
  targetParticipants: 200,
  organizer: 'Panitia Acara',
};

export const EventsPage: React.FC = () => {
  const {
    events,
    activeEventId,
    setActiveEventId,
    audiences,
    segments,
    strategies,
    promoPlans,
    addEvent,
    updateEvent,
    deleteEvent,
    requestConfirm,
    setCurrentPage,
  } = useEventReach();

  const [statusFilter, setStatusFilter] = useState<'Semua' | EventStatus>('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [form, setForm] = useState(EMPTY_EVENT_FORM);

  const filteredEvents = events.filter((e) =>
    statusFilter === 'Semua' ? true : e.status === statusFilter
  );

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_EVENT_FORM);
    setModalOpen(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingId(evt.id);
    setForm({
      name: evt.name,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      description: evt.description,
      status: evt.status,
      targetParticipants: evt.targetParticipants,
      organizer: evt.organizer,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.location.trim()) return;
    if (editingId) {
      updateEvent(editingId, form);
    } else {
      addEvent(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (evt: EventItem) => {
    if (events.length <= 1) {
      requestConfirm({
        title: 'Tidak Dapat Menghapus Event Terakhir',
        message:
          'Minimal harus ada 1 event di dalam ruang kerja EventReach. Buat event lain terlebih dahulu sebelum menghapus event ini.',
        confirmLabel: 'Mengerti',
        variant: 'primary',
        onConfirm: () => {},
      });
      return;
    }

    requestConfirm({
      title: `Hapus Event "${evt.name}"?`,
      message:
        'Semua data audiens, segmentasi, strategi komunikasi, dan jadwal promosi yang terkait dengan event ini juga akan dihapus.',
      confirmLabel: 'Ya, Hapus Event',
      variant: 'danger',
      onConfirm: () => {
        deleteEvent(evt.id);
        if (detailEvent?.id === evt.id) setDetailEvent(null);
      },
    });
  };

  const statusTone = (status: EventStatus) => {
    if (status === 'Active') return 'text-[#1F7A53] bg-[#ECFDF5]';
    if (status === 'Upcoming') return 'text-[#B45309] bg-[#FFFBEB]';
    return 'text-[#6D4E58] bg-[#F5ECEF]';
  };

  return (
    <div className="space-y-6">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#341C24] tracking-tight">
            Manajemen Event
          </h1>
          <p className="mt-1 text-sm text-[#6D4E58]">
            Kelola daftar acara dan pilih event aktif untuk mengelola audiens serta promosinya.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Plus size={18} />
          Buat Event Baru
        </button>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#F1DCE1] rounded-xl">
          {(['Semua', 'Active', 'Upcoming', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-[#AE5D72] text-white'
                  : 'text-[#6D4E58] hover:text-[#341C24] hover:bg-[#FDF2F4]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#7A5C66] tabular-nums">
          Menampilkan {filteredEvents.length} dari {events.length} event
        </p>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-[#F1DCE1] rounded-2xl p-12 text-center">
          <Calendar size={36} className="mx-auto text-[#D99BA9] mb-3" />
          <h3 className="text-base font-semibold text-[#341C24]">
            Belum ada event pada kategori ini
          </h3>
          <p className="mt-1 text-sm text-[#6D4E58]">
            Buat event baru atau ubah filter status untuk melihat acara lainnya.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#AE5D72] text-white text-xs font-semibold hover:bg-[#8F4458]"
          >
            Buat Event Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => {
            const isSelected = evt.id === activeEventId;
            const evtAudienceCount = audiences.filter((a) => a.eventId === evt.id).length;
            const evtSegmentCount = segments.filter((s) => s.eventId === evt.id).length;
            const evtPromoCount = promoPlans.filter((p) => p.eventId === evt.id).length;

            return (
              <article
                key={evt.id}
                className={`bg-white rounded-2xl p-5 border flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'border-[#AE5D72] ring-1 ring-[#AE5D72]/25'
                    : 'border-[#F1DCE1]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${statusTone(
                        evt.status
                      )}`}
                    >
                      {evt.status}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#AE5D72]">
                        <CheckCircle2 size={14} />
                        Sedang Aktif
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-[#341C24] leading-snug">
                    {evt.name}
                  </h2>

                  <div className="mt-2.5 space-y-1.5 text-xs text-[#6D4E58]">
                    <p className="flex items-center gap-2 tabular-nums">
                      <Calendar size={14} className="text-[#AE5D72] shrink-0" />
                      <span>
                        {evt.date} · {evt.time}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#AE5D72] shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </p>
                  </div>

                  <p className="mt-3 text-xs text-[#6D4E58] line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Unboxed Clean Metrics */}
                  <div className="mt-4 pt-3.5 border-t border-[#F5E5E9] flex items-center justify-between text-xs text-[#6D4E58] tabular-nums">
                    <span>
                      <strong className="text-[#341C24]">{evtAudienceCount}</strong> audiens
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      <strong className="text-[#341C24]">{evtSegmentCount}</strong> segmen
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      <strong className="text-[#341C24]">{evtPromoCount}</strong> promosi
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F5E5E9] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveEventId(evt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#FCECEF] text-[#8F4458]'
                        : 'bg-[#AE5D72] text-white hover:bg-[#8F4458]'
                    }`}
                  >
                    {isSelected ? 'Terpilih' : 'Kelola Event Ini'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDetailEvent(evt)}
                      aria-label={`Lihat detail ${evt.name}`}
                      className="p-2 rounded-lg text-[#6D4E58] hover:bg-[#FDF2F4] hover:text-[#AE5D72] transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(evt)}
                      aria-label={`Edit ${evt.name}`}
                      className="p-2 rounded-lg text-[#6D4E58] hover:bg-[#FDF2F4] hover:text-[#AE5D72] transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(evt)}
                      aria-label={`Hapus ${evt.name}`}
                      className="p-2 rounded-lg text-[#6D4E58] hover:bg-[#FEF2F2] hover:text-[#B91C1C] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Event Detail Modal */}
      {detailEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#341C24]/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white border border-[#F0D5DC] rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${statusTone(
                    detailEvent.status
                  )}`}
                >
                  {detailEvent.status}
                </span>
                <h2 className="mt-2 text-xl font-bold text-[#341C24]">
                  {detailEvent.name}
                </h2>
                <p className="text-xs text-[#7A5C66] mt-0.5">
                  Penyelenggara: {detailEvent.organizer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                aria-label="Tutup detail"
                className="p-1.5 rounded-lg text-[#7A5C66] hover:bg-[#FDF2F4]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3 bg-[#FDF6F7] border border-[#F1DCE1] rounded-xl p-4 text-sm">
              <div className="flex items-center gap-2.5 text-[#341C24] tabular-nums">
                <Calendar size={16} className="text-[#AE5D72]" />
                <span>{detailEvent.date}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#341C24]">
                <Clock size={16} className="text-[#AE5D72]" />
                <span>{detailEvent.time}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#341C24]">
                <MapPin size={16} className="text-[#AE5D72]" />
                <span>{detailEvent.location}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#341C24] tabular-nums">
                <Users size={16} className="text-[#AE5D72]" />
                <span>Target Peserta: {detailEvent.targetParticipants} orang</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#6D4E58] leading-relaxed">
              {detailEvent.description}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center tabular-nums">
              <div className="p-3 rounded-xl bg-[#FCECEF]">
                <p className="text-lg font-bold text-[#341C24]">
                  {audiences.filter((a) => a.eventId === detailEvent.id).length}
                </p>
                <p className="text-[11px] text-[#6D4E58]">Audiens</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FCECEF]">
                <p className="text-lg font-bold text-[#341C24]">
                  {segments.filter((s) => s.eventId === detailEvent.id).length}
                </p>
                <p className="text-[11px] text-[#6D4E58]">Segmen</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FCECEF]">
                <p className="text-lg font-bold text-[#341C24]">
                  {strategies.filter((st) => st.eventId === detailEvent.id).length}
                </p>
                <p className="text-[11px] text-[#6D4E58]">Strategi</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                className="px-4 py-2 rounded-xl border border-[#ECCFD6] text-sm font-medium text-[#6D4E58] hover:bg-[#FDF2F4]"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveEventId(detailEvent.id);
                  setDetailEvent(null);
                  setCurrentPage('audiens');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold"
              >
                Buka Data Audiens
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#341C24]/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white border border-[#F0D5DC] rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#341C24]">
                {editingId ? 'Edit Informasi Event' : 'Buat Event Baru'}
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
                  Nama Event *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Seminar Nasional Komunikasi 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Tanggal Pelaksanaan *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Waktu
                  </label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="09:00 - 15:00 WIB"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Lokasi / Platform *
                </label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Contoh: Auditorium UNJ / Zoom Meeting"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Status Event
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as EventStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Target Peserta
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.targetParticipants}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        targetParticipants: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Deskripsi Event
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Jelaskan tujuan, topik utama, dan target acara..."
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
                  {editingId ? 'Simpan Perubahan' : 'Buat Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
