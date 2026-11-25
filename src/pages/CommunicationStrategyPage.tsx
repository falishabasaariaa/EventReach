import React, { useMemo, useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  MessageSquare,
  Target,
  Send,
  X,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';
import { useEventReach } from '../context/EventReachContext';
import {
  CommunicationGoal,
  CommunicationStrategy,
  CommunicationTone,
  MediaPlatform,
} from '../types/eventreach';

const GOALS: CommunicationGoal[] = [
  'Awareness',
  'Engagement',
  'Registration',
  'Attendance',
];

const TONES: CommunicationTone[] = [
  'Formal',
  'Informal',
  'Friendly',
  'Persuasif',
];

const CHANNELS: MediaPlatform[] = [
  'Instagram',
  'TikTok',
  'WhatsApp',
  'Email',
  'Poster',
  'Website',
];

export const CommunicationStrategyPage: React.FC = () => {
  const {
    activeEvent,
    activeEventId,
    activeSegments,
    activeStrategies,
    addStrategy,
    updateStrategy,
    deleteStrategy,
    requestConfirm,
    showToast,
  } = useEventReach();

  const [goalFilter, setGoalFilter] = useState<'Semua' | CommunicationGoal>('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommunicationStrategy | null>(null);

  const [title, setTitle] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [customSegmentName, setCustomSegmentName] = useState('');
  const [goal, setGoal] = useState<CommunicationGoal>('Registration');
  const [tone, setTone] = useState<CommunicationTone>('Friendly');
  const [channels, setChannels] = useState<MediaPlatform[]>(['Instagram', 'WhatsApp']);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Siap Digunakan'>('Siap Digunakan');

  const filteredStrategies = useMemo(() => {
    return activeStrategies.filter((s) =>
      goalFilter === 'Semua' ? true : s.goal === goalFilter
    );
  }, [activeStrategies, goalFilter]);

  const openCreate = () => {
    setEditingItem(null);
    setTitle('');
    const firstSeg = activeSegments[0];
    setSegmentId(firstSeg ? firstSeg.id : 'custom');
    setCustomSegmentName(firstSeg ? firstSeg.name : 'Semua Audiens Event');
    setGoal('Registration');
    setTone('Friendly');
    setChannels(['Instagram', 'WhatsApp']);
    setMessage(firstSeg ? firstSeg.message : '');
    setStatus('Draft');
    setModalOpen(true);
  };

  const openEdit = (item: CommunicationStrategy) => {
    setEditingItem(item);
    setTitle(item.title);
    setSegmentId(item.segmentId || 'custom');
    setCustomSegmentName(item.segmentName);
    setGoal(item.goal);
    setTone(item.tone);
    setChannels(item.channels);
    setMessage(item.message);
    setStatus(item.status);
    setModalOpen(true);
  };

  const toggleChannel = (ch: MediaPlatform) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSegmentSelect = (newSegId: string) => {
    setSegmentId(newSegId);
    const found = activeSegments.find((s) => s.id === newSegId);
    if (found) {
      setCustomSegmentName(found.name);
      if (!message.trim()) {
        setMessage(found.message);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent, saveAsDraft?: boolean) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Lengkapi judul strategi dan isi pesan komunikasi.', 'error');
      return;
    }
    if (channels.length === 0) {
      showToast('Pilih minimal 1 media komunikasi.', 'error');
      return;
    }

    const finalStatus = saveAsDraft ? 'Draft' : status;
    const resolvedSegName =
      segmentId !== 'custom'
        ? activeSegments.find((s) => s.id === segmentId)?.name || customSegmentName
        : customSegmentName.trim() || 'Target Audiens Umum';

    if (editingItem) {
      updateStrategy(editingItem.id, {
        title: title.trim(),
        segmentId,
        segmentName: resolvedSegName,
        goal,
        tone,
        channels,
        message: message.trim(),
        status: finalStatus,
      });
    } else {
      addStrategy({
        eventId: activeEventId,
        title: title.trim(),
        segmentId,
        segmentName: resolvedSegName,
        goal,
        tone,
        channels,
        message: message.trim(),
        status: finalStatus,
      });
    }
    setModalOpen(false);
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Pesan komunikasi disalin ke clipboard', 'info');
    } catch {
      showToast('Teks pesan siap disalin manual', 'info');
    }
  };

  const handleDelete = (item: CommunicationStrategy) => {
    requestConfirm({
      title: `Hapus Strategi "${item.title}"?`,
      message:
        'Strategi komunikasi dan rancangan pesannya akan dihapus secara permanen.',
      confirmLabel: 'Hapus Strategi',
      variant: 'danger',
      onConfirm: () => deleteStrategy(item.id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#341C24] tracking-tight">
            Strategi Komunikasi
          </h1>
          <p className="mt-1 text-sm text-[#6D4E58]">
            Hubungkan segmen audiens {activeEvent?.name} dengan tujuan, gaya bahasa, dan kanal pesan yang tepat.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Plus size={18} />
          Buat Strategi Baru
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-[#F1DCE1] rounded-xl">
          {(['Semua', ...GOALS] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoalFilter(g)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                goalFilter === g
                  ? 'bg-[#AE5D72] text-white'
                  : 'text-[#6D4E58] hover:text-[#341C24] hover:bg-[#FDF2F4]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#7A5C66] tabular-nums">
          {filteredStrategies.length} strategi komunikasi
        </p>
      </div>

      {/* Strategy Cards */}
      {filteredStrategies.length === 0 ? (
        <div className="bg-white border border-[#F1DCE1] rounded-2xl p-12 text-center">
          <MessageSquare size={38} className="mx-auto text-[#D99BA9] mb-3" />
          <h3 className="text-base font-semibold text-[#341C24]">
            Belum ada strategi komunikasi
          </h3>
          <p className="mt-1 text-sm text-[#6D4E58]">
            Rancang strategi pesan untuk menghubungkan target segmen dengan media promosi event.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-[#AE5D72] text-white text-xs font-semibold hover:bg-[#8F4458]"
          >
            Buat Strategi Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredStrategies.map((st) => (
            <article
              key={st.id}
              className="bg-white border border-[#F1DCE1] rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                          st.status === 'Siap Digunakan'
                            ? 'bg-[#ECFDF5] text-[#1F7A53]'
                            : 'bg-[#FFFBEB] text-[#B45309]'
                        }`}
                      >
                        {st.status === 'Siap Digunakan' ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <FileEdit size={12} />
                        )}
                        {st.status}
                      </span>
                      <span className="text-[#7A5C66]">
                        Tujuan: <strong className="text-[#341C24]">{st.goal}</strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#7A5C66]">
                        Tone: <strong className="text-[#341C24]">{st.tone}</strong>
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-[#341C24]">
                      {st.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(st.message)}
                      aria-label={`Salin pesan ${st.title}`}
                      className="p-2 rounded-lg text-[#6D4E58] hover:bg-[#FDF2F4] hover:text-[#AE5D72]"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(st)}
                      aria-label={`Edit ${st.title}`}
                      className="p-2 rounded-lg text-[#6D4E58] hover:bg-[#FDF2F4] hover:text-[#AE5D72]"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(st)}
                      aria-label={`Hapus ${st.title}`}
                      className="p-2 rounded-lg text-[#6D4E58] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Mapping Target -> Media */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6D4E58] bg-[#FDF6F7] border border-[#F5E5E9] rounded-xl px-3.5 py-2.5">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#341C24]">
                    <Target size={14} className="text-[#AE5D72]" />
                    {st.segmentName}
                  </span>
                  <span aria-hidden="true">→</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Send size={13} className="text-[#AE5D72]" />
                    {st.channels.join(', ')}
                  </span>
                </div>

                <p className="mt-3 text-sm text-[#341C24] leading-relaxed whitespace-pre-wrap">
                  {st.message}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F5E5E9] flex items-center justify-between text-xs text-[#7A5C66]">
                <span>Diperbarui {new Date(st.updatedAt).toLocaleDateString('id-ID')}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateStrategy(st.id, {
                      status: st.status === 'Draft' ? 'Siap Digunakan' : 'Draft',
                    })
                  }
                  className="font-semibold text-[#AE5D72] hover:text-[#8F4458]"
                >
                  Ubah ke {st.status === 'Draft' ? 'Siap Digunakan' : 'Draft'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit Strategy Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#341C24]/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white border border-[#F0D5DC] rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#341C24]">
                {editingItem ? 'Edit Strategi Komunikasi' : 'Buat Strategi Komunikasi'}
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

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Judul Strategi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Kampanye Early Bird Mahasiswa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Target Segmen Audiens
                  </label>
                  <select
                    value={segmentId}
                    onChange={(e) => handleSegmentSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    {activeSegments.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        {seg.name}
                      </option>
                    ))}
                    <option value="custom">Tentukan Target Kustom...</option>
                  </select>
                </div>

                {segmentId === 'custom' ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#341C24] mb-1">
                      Nama Target Kustom
                    </label>
                    <input
                      type="text"
                      value={customSegmentName}
                      onChange={(e) => setCustomSegmentName(e.target.value)}
                      placeholder="Contoh: Komunitas Desainer Muda"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#341C24] mb-1">
                      Status Strategi
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as 'Draft' | 'Siap Digunakan')
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Siap Digunakan">Siap Digunakan</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Tujuan Komunikasi
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as CommunicationGoal)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    {GOALS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Tone / Gaya Bahasa
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as CommunicationTone)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1.5">
                  Media Komunikasi yang Digunakan *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((ch) => {
                    const active = channels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          active
                            ? 'bg-[#AE5D72] text-white border-[#AE5D72]'
                            : 'bg-white text-[#6D4E58] border-[#EBCBD3] hover:bg-[#FDF2F4]'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Pesan Komunikasi *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Susun pesan komunikasi utama yang sesuai dengan segmen dan tone pilihan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#ECCFD6] text-sm font-medium text-[#6D4E58] hover:bg-[#FDF2F4]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="px-4 py-2 rounded-xl bg-[#FCECEF] text-[#8F4458] text-sm font-semibold hover:bg-[#F7D7DF]"
                >
                  Simpan Draft
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold"
                >
                  Simpan Strategi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
