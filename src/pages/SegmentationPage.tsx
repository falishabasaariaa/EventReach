import React, { useEffect, useMemo, useState } from 'react';
import {
  GraduationCap,
  UserRoundCheck,
  Users,
  Globe,
  Check,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Edit3,
  Trash2,
  Eye,
  MessageSquare,
  X,
} from 'lucide-react';
import {
  matchSegmentMembers,
  useEventReach,
} from '../context/EventReachContext';
import {
  AudienceCategory,
  AudienceSegment,
  AudienceStatus,
} from '../types/eventreach';

const CATEGORY_CARDS: {
  id: AudienceCategory;
  label: string;
  desc: string;
  icon: React.FC<{ size?: number; className?: string }>;
}[] = [
  {
    id: 'Mahasiswa',
    label: 'Mahasiswa',
    desc: 'Peserta S1/D3 & aktivis kampus',
    icon: GraduationCap,
  },
  {
    id: 'Dosen',
    label: 'Dosen',
    desc: 'Akademisi & tenaga pengajar',
    icon: UserRoundCheck,
  },
  {
    id: 'Alumni',
    label: 'Alumni',
    desc: 'Lulusan & praktisi industri',
    icon: Users,
  },
  {
    id: 'Masyarakat Umum',
    label: 'Masyarakat Umum',
    desc: 'Profesional muda & komunitas',
    icon: Globe,
  },
];

const STATUS_OPTIONS: AudienceStatus[] = [
  'Terkonfirmasi',
  'Terdaftar',
  'Prospek',
  'Batal',
];

export const SegmentationPage: React.FC = () => {
  const {
    activeEvent,
    activeEventId,
    activeAudiences,
    activeSegments,
    addSegment,
    updateSegment,
    deleteSegment,
    requestConfirm,
    editingSegmentId,
    setEditingSegmentId,
    setCurrentPage,
    showToast,
  } = useEventReach();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Wizard state
  const [segmentName, setSegmentName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<AudienceCategory[]>([
    'Mahasiswa',
  ]);
  const [ageEnabled, setAgeEnabled] = useState(false);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(30);
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<AudienceStatus[]>([]);
  const [message, setMessage] = useState('');

  // Inspect saved segment modal
  const [inspectSegment, setInspectSegment] = useState<AudienceSegment | null>(null);

  const uniqueInstitutions = useMemo(() => {
    const set = new Set<string>();
    activeAudiences.forEach((a) => {
      if (a.institution.trim()) set.add(a.institution.trim());
    });
    return Array.from(set).sort();
  }, [activeAudiences]);

  const uniqueInterests = useMemo(() => {
    const set = new Set<string>();
    activeAudiences.forEach((a) => {
      if (a.interest.trim()) set.add(a.interest.trim());
    });
    return Array.from(set).sort();
  }, [activeAudiences]);

  // Load segment when editing
  useEffect(() => {
    if (editingSegmentId) {
      const target = activeSegments.find((s) => s.id === editingSegmentId);
      if (target) {
        setSegmentName(target.name);
        setSelectedCategories(target.categories);
        setAgeEnabled(target.ageRange.enabled);
        setAgeMin(target.ageRange.min);
        setAgeMax(target.ageRange.max);
        setSelectedInstitutions(target.institutions);
        setSelectedInterests(target.interests);
        setSelectedStatuses(target.statuses);
        setMessage(target.message);
        setStep(1);
      }
    }
  }, [editingSegmentId, activeSegments]);

  const currentCriteria = useMemo(
    () => ({
      categories: selectedCategories,
      ageRange: { min: ageMin, max: ageMax, enabled: ageEnabled },
      institutions: selectedInstitutions,
      interests: selectedInterests,
      statuses: selectedStatuses,
    }),
    [
      selectedCategories,
      ageMin,
      ageMax,
      ageEnabled,
      selectedInstitutions,
      selectedInterests,
      selectedStatuses,
    ]
  );

  const liveMatchedMembers = useMemo(
    () => matchSegmentMembers(currentCriteria, activeAudiences),
    [currentCriteria, activeAudiences]
  );

  const resetWizard = () => {
    setEditingSegmentId(null);
    setSegmentName('');
    setSelectedCategories(['Mahasiswa']);
    setAgeEnabled(false);
    setAgeMin(18);
    setAgeMax(30);
    setSelectedInstitutions([]);
    setSelectedInterests([]);
    setSelectedStatuses([]);
    setMessage('');
    setStep(1);
  };

  const toggleCategory = (cat: AudienceCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleStringItem = (
    item: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const toggleStatus = (st: AudienceStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((v) => v !== st) : [...prev, st]
    );
  };

  const applyMessageTemplate = (preset: 'friendly' | 'formal' | 'persuasive') => {
    const targetLabel =
      selectedCategories.length > 0
        ? selectedCategories.join(' & ')
        : 'Peserta';
    const eventTitle = activeEvent?.name || 'Event Kami';
    const eventDate = activeEvent?.date || 'mendatang';
    const eventLoc = activeEvent?.location || 'lokasi acara';

    if (preset === 'friendly') {
      setMessage(
        `Halo teman-teman ${targetLabel}! Yuk gabung di ${eventTitle} pada ${eventDate} bertempat di ${eventLoc}. Ada sesi materi aplikatif dan networking seru. Jangan sampai kehabisan kuota ya!`
      );
    } else if (preset === 'formal') {
      setMessage(
        `Yth. Bapak/Ibu dan Rekan ${targetLabel}, kami mengundang Anda untuk menghadiri ${eventTitle} yang akan dilaksanakan pada ${eventDate} di ${eventLoc}. Mohon konfirmasi kehadiran melalui tautan pendaftaran resmi panitia.`
      );
    } else {
      setMessage(
        `Kesempatan terbatas untuk ${targetLabel}! Dapatkan insight terbaru di ${eventTitle} (${eventDate}, ${eventLoc}). Daftar hari ini untuk mengamankan kursi dan e-sertifikat resmi.`
      );
    }
  };

  const handleSaveSegment = () => {
    const finalName =
      segmentName.trim() ||
      (selectedCategories.length > 0
        ? `Segmen ${selectedCategories.join(' & ')}`
        : 'Segmen Audiens Kustom');

    if (!message.trim()) {
      showToast('Tulis pesan undangan atau komunikasi sebelum menyimpan.', 'error');
      return;
    }

    if (editingSegmentId) {
      updateSegment(editingSegmentId, {
        name: finalName,
        ...currentCriteria,
        message: message.trim(),
      });
    } else {
      addSegment({
        eventId: activeEventId,
        name: finalName,
        ...currentCriteria,
        message: message.trim(),
      });
    }
    resetWizard();
  };

  const handleDeleteSegment = (seg: AudienceSegment) => {
    requestConfirm({
      title: `Hapus Segmen "${seg.name}"?`,
      message:
        'Segmen ini akan dihapus dari daftar target audiens. Data peserta di halaman Data Audiens tidak akan terhapus.',
      confirmLabel: 'Hapus Segmen',
      variant: 'danger',
      onConfirm: () => {
        deleteSegment(seg.id);
        if (editingSegmentId === seg.id) resetWizard();
      },
    });
  };

  return (
    <div className="space-y-7">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#341C24] tracking-tight">
            Segmentasi Audiens
          </h1>
          <p className="mt-1 text-sm text-[#6D4E58]">
            Kelompokkan peserta {activeEvent?.name} langkah demi langkah agar pesan komunikasi tepat sasaran.
          </p>
        </div>
        <button
          type="button"
          onClick={resetWizard}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EBCBD3] text-xs font-semibold text-[#6D4E58] hover:bg-[#FDF2F4] hover:text-[#341C24] transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          Reset Wizard
        </button>
      </div>

      {/* Wizard Container (Inspired directly by Sketch Alternatif B) */}
      <section className="bg-white border border-[#F1DCE1] rounded-2xl p-5 sm:p-7">
        {editingSegmentId && (
          <div className="mb-5 px-4 py-2.5 rounded-xl bg-[#FCECEF] border border-[#EBCBD3] flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-[#8F4458]">
              Sedang mengedit segmen tersimpan
            </span>
            <button
              type="button"
              onClick={resetWizard}
              className="font-semibold text-[#6D4E58] hover:text-[#341C24]"
            >
              Batalkan Edit
            </button>
          </div>
        )}

        {/* 3-Step Progress Indicator (1 Data — 2 Kelompok — 3 Pesan) */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1 as const, label: 'Data' },
              { num: 2 as const, label: 'Kelompok' },
              { num: 3 as const, label: 'Pesan' },
            ].map((item, idx) => {
              const isCompleted = step > item.num;
              const isCurrent = step === item.num;
              return (
                <React.Fragment key={item.num}>
                  <button
                    type="button"
                    onClick={() => setStep(item.num)}
                    className="flex flex-col items-center gap-1.5 group focus-visible:outline-none"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors tabular-nums ${
                        isCurrent || isCompleted
                          ? 'bg-[#AE5D72] text-white'
                          : 'bg-white border-2 border-[#DFAAB7] text-[#AE5D72] group-hover:bg-[#FDF2F4]'
                      }`}
                    >
                      {isCompleted ? <Check size={17} /> : item.num}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent ? 'text-[#341C24]' : 'text-[#8E6F79]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>

                  {idx < 2 && (
                    <div
                      className={`flex-1 h-[2px] mx-2 sm:mx-4 -mt-5 transition-colors ${
                        step > item.num ? 'bg-[#AE5D72]' : 'bg-[#F0D5DC]'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Live Match Summary Bar */}
        <div className="mb-6 px-4 py-3 rounded-xl bg-[#FDF6F7] border border-[#F1DCE1] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#6D4E58]">
            Estimasi audiens sesuai kriteria saat ini:
          </span>
          <span className="font-bold text-[#8F4458] tabular-nums">
            {liveMatchedMembers.length} dari {activeAudiences.length} peserta
          </span>
        </div>

        {/* STEP 1: DATA CRITERIA */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#341C24]">
                Langkah 1: Tentukan Kriteria Data Audiens
              </h2>
              <p className="text-xs text-[#6D4E58] mt-0.5">
                Saring karakteristik audiens berdasarkan usia, institusi, minat, dan status registrasi. Biarkan kosong jika ingin mencakup semua.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Range & Registration Status */}
              <div className="space-y-5">
                <div className="p-4 rounded-xl border border-[#F1DCE1] bg-[#FFFDFD]">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="age-toggle"
                      className="text-sm font-semibold text-[#341C24]"
                    >
                      Filter Rentang Usia
                    </label>
                    <input
                      id="age-toggle"
                      type="checkbox"
                      checked={ageEnabled}
                      onChange={(e) => setAgeEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#AE5D72]"
                    />
                  </div>
                  {ageEnabled && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#6D4E58] mb-1">
                          Usia Minimum
                        </label>
                        <input
                          type="number"
                          min={12}
                          max={90}
                          value={ageMin}
                          onChange={(e) => setAgeMin(Number(e.target.value) || 15)}
                          className="w-full px-3 py-2 rounded-lg border border-[#EBCBD3] text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#6D4E58] mb-1">
                          Usia Maksimum
                        </label>
                        <input
                          type="number"
                          min={12}
                          max={99}
                          value={ageMax}
                          onChange={(e) => setAgeMax(Number(e.target.value) || 60)}
                          className="w-full px-3 py-2 rounded-lg border border-[#EBCBD3] text-sm tabular-nums"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-[#F1DCE1] bg-[#FFFDFD]">
                  <p className="text-sm font-semibold text-[#341C24] mb-2.5">
                    Status Registrasi
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((st) => {
                      const active = selectedStatuses.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleStatus(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            active
                              ? 'bg-[#AE5D72] text-white border-[#AE5D72]'
                              : 'bg-white text-[#6D4E58] border-[#EBCBD3] hover:bg-[#FDF2F4]'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Interests & Institutions */}
              <div className="space-y-5">
                <div className="p-4 rounded-xl border border-[#F1DCE1] bg-[#FFFDFD]">
                  <p className="text-sm font-semibold text-[#341C24] mb-2.5">
                    Minat / Topik ({selectedInterests.length || 'Semua'})
                  </p>
                  {uniqueInterests.length === 0 ? (
                    <p className="text-xs text-[#7A5C66]">Belum ada data minat peserta.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {uniqueInterests.map((interest) => {
                        const active = selectedInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() =>
                              toggleStringItem(interest, setSelectedInterests)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              active
                                ? 'bg-[#AE5D72] text-white border-[#AE5D72]'
                                : 'bg-white text-[#6D4E58] border-[#EBCBD3] hover:bg-[#FDF2F4]'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-[#F1DCE1] bg-[#FFFDFD]">
                  <p className="text-sm font-semibold text-[#341C24] mb-2.5">
                    Asal Institusi ({selectedInstitutions.length || 'Semua'})
                  </p>
                  {uniqueInstitutions.length === 0 ? (
                    <p className="text-xs text-[#7A5C66]">
                      Belum ada data institusi peserta.
                    </p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {uniqueInstitutions.map((inst) => {
                        const checked = selectedInstitutions.includes(inst);
                        return (
                          <label
                            key={inst}
                            className="flex items-center gap-2.5 text-xs text-[#341C24] cursor-pointer py-1 px-2 rounded-lg hover:bg-[#FDF2F4]"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleStringItem(inst, setSelectedInstitutions)
                              }
                              className="w-4 h-4 accent-[#AE5D72]"
                            />
                            <span className="truncate">{inst}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold transition-colors"
              >
                Lanjutkan ke Kelompok
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: KELOMPOK AUDIENS (Sketch Card Grid) */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#341C24]">
                Langkah 2: Pilih Kategori Audiens Target
              </h2>
              <p className="text-xs text-[#6D4E58] mt-0.5">
                Pilih satu atau kombinasikan beberapa kelompok audiens yang ingin dituju.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORY_CARDS.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedCategories.includes(card.id);
                const catCount = activeAudiences.filter(
                  (a) => a.category === card.id
                ).length;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleCategory(card.id)}
                    className={`relative rounded-2xl p-5 border-2 text-center transition-all flex flex-col items-center justify-center gap-2.5 min-h-[156px] ${
                      isSelected
                        ? 'bg-[#AE5D72] border-[#AE5D72] text-white shadow-sm'
                        : 'bg-white border-[#DFAAB7] text-[#AE5D72] hover:bg-[#FFF6F8]'
                    }`}
                  >
                    {/* Top-right Selected Indicator */}
                    <span
                      className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#F5CED7] text-[#6E2E42]'
                          : 'border border-[#EBCBD3] text-transparent'
                      }`}
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </span>

                    <Icon
                      size={36}
                      className={isSelected ? 'text-white' : 'text-[#F2A7B8]'}
                    />
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          isSelected ? 'text-white' : 'text-[#8F4458]'
                        }`}
                      >
                        {card.label}
                      </p>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? 'text-white/85' : 'text-[#7A5C66]'
                        }`}
                      >
                        {card.desc}
                      </p>
                      <p
                        className={`text-[11px] font-semibold mt-1.5 tabular-nums ${
                          isSelected ? 'text-white' : 'text-[#AE5D72]'
                        }`}
                      >
                        {catCount} peserta tersedia
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ECCFD6] text-sm font-semibold text-[#6D4E58] hover:bg-[#FDF2F4]"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold transition-colors"
              >
                Lanjutkan ke Pesan
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PESAN KOMUNIKASI & PREVIEW */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#341C24]">
                Langkah 3: Susun Pesan Undangan &amp; Simpan Segmen
              </h2>
              <p className="text-xs text-[#6D4E58] mt-0.5">
                Beri nama segmen, tulis pesan komunikasi yang relevan, lalu tinjau pratinjau pesan sebelum menyimpan.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Nama Segmen Audiens *
                  </label>
                  <input
                    type="text"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    placeholder={`Contoh: Segmen ${
                      selectedCategories.join(' & ') || 'Target Utama'
                    }`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-semibold text-[#341C24]">
                      Pesan Undangan / Komunikasi *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#7A5C66]">Template:</span>
                      <button
                        type="button"
                        onClick={() => applyMessageTemplate('friendly')}
                        className="px-2 py-1 rounded-md bg-[#FCECEF] text-[11px] font-semibold text-[#8F4458] hover:bg-[#F7D7DF]"
                      >
                        Friendly
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMessageTemplate('formal')}
                        className="px-2 py-1 rounded-md bg-[#FCECEF] text-[11px] font-semibold text-[#8F4458] hover:bg-[#F7D7DF]"
                      >
                        Formal
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMessageTemplate('persuasive')}
                        className="px-2 py-1 rounded-md bg-[#FCECEF] text-[11px] font-semibold text-[#8F4458] hover:bg-[#F7D7DF]"
                      >
                        Persuasif
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis pesan untuk audiens di sini..."
                    className="w-full px-3.5 py-3 rounded-xl border border-[#DFAAB7] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
              </div>

              {/* Right Column: Live Summary & Preview */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-[#FCECEF] border border-[#EBCBD3]">
                  <p className="text-xs font-semibold text-[#8F4458]">
                    Ringkasan Segmen
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#341C24] tabular-nums">
                    {liveMatchedMembers.length} Audiens
                  </p>
                  <p className="mt-1 text-xs text-[#6D4E58]">
                    Kelompok:{' '}
                    <span className="font-semibold text-[#341C24]">
                      {selectedCategories.length > 0
                        ? selectedCategories.join(', ')
                        : 'Semua Kategori'}
                    </span>
                  </p>
                  {ageEnabled && (
                    <p className="text-xs text-[#6D4E58] tabular-nums mt-0.5">
                      Rentang usia: {ageMin}–{ageMax} tahun
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#FDF6F7] border border-[#F1DCE1]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#AE5D72] mb-2">
                    <MessageSquare size={14} />
                    <span>Pratinjau Pesan</span>
                  </div>
                  <div className="bg-white border border-[#F1DCE1] rounded-xl p-3.5 text-xs text-[#341C24] leading-relaxed whitespace-pre-wrap min-h-[104px]">
                    {message.trim() ||
                      'Pratinjau pesan komunikasi untuk segmen terpilih akan tampil di sini.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ECCFD6] text-sm font-semibold text-[#6D4E58] hover:bg-[#FDF2F4]"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSaveSegment}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold transition-colors"
              >
                <Check size={16} />
                {editingSegmentId
                  ? 'Perbarui Strategi Segmentasi'
                  : 'Simpan Strategi Segmentasi'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Saved Segments List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#341C24]">
              Hasil Segmentasi Tersimpan
            </h2>
            <p className="text-xs text-[#6D4E58]">
              Klik edit untuk menyesuaikan kriteria di wizard atau lihat daftar peserta yang masuk ke segmen.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#7A5C66] tabular-nums">
            {activeSegments.length} segmen
          </span>
        </div>

        {activeSegments.length === 0 ? (
          <div className="bg-white border border-[#F1DCE1] rounded-2xl p-10 text-center">
            <p className="text-sm font-semibold text-[#341C24]">
              Belum ada segmentasi tersimpan untuk event ini.
            </p>
            <p className="text-xs text-[#6D4E58] mt-1">
              Gunakan wizard 3 langkah di atas untuk membuat segmen audiens pertama.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSegments.map((seg) => {
              const matched = matchSegmentMembers(seg, activeAudiences);
              return (
                <article
                  key={seg.id}
                  className="bg-white border border-[#F1DCE1] rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#341C24]">
                          {seg.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#7A5C66]">
                          {seg.categories.length > 0
                            ? seg.categories.join(', ')
                            : 'Semua Kategori'}{' '}
                          ·{' '}
                          <span className="font-semibold text-[#AE5D72] tabular-nums">
                            {matched.length} peserta cocok
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setInspectSegment(seg)}
                          aria-label={`Lihat peserta ${seg.name}`}
                          className="p-1.5 rounded-lg text-[#6D4E58] hover:bg-[#FDF2F4] hover:text-[#AE5D72]"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSegmentId(seg.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          aria-label={`Edit ${seg.name}`}
                          className="p-1.5 rounded-lg text-[#6D4E58] hover:bg-[#FDF2F4] hover:text-[#AE5D72]"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSegment(seg)}
                          aria-label={`Hapus ${seg.name}`}
                          className="p-1.5 rounded-lg text-[#6D4E58] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[#6D4E58] bg-[#FDF6F7] border border-[#F5E5E9] rounded-xl p-3 leading-relaxed line-clamp-3">
                      {seg.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F5E5E9]">
                    <button
                      type="button"
                      onClick={() => setInspectSegment(seg)}
                      className="text-xs font-semibold text-[#6D4E58] hover:text-[#341C24]"
                    >
                      Lihat Daftar Peserta ({matched.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage('strategi')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#AE5D72] hover:text-[#8F4458]"
                    >
                      Lanjut ke Strategi
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Inspect Matched Members Modal */}
      {inspectSegment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#341C24]/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white border border-[#F0D5DC] rounded-2xl shadow-xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#341C24]">
                  {inspectSegment.name}
                </h3>
                <p className="text-xs text-[#6D4E58] mt-0.5">
                  Daftar peserta yang memenuhi kriteria segmen ini
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectSegment(null)}
                aria-label="Tutup daftar"
                className="p-1.5 rounded-lg text-[#7A5C66] hover:bg-[#FDF2F4]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#F5E5E9] pr-1">
              {(() => {
                const members = matchSegmentMembers(inspectSegment, activeAudiences);
                if (members.length === 0) {
                  return (
                    <p className="py-8 text-center text-sm text-[#7A5C66]">
                      Belum ada peserta di database event ini yang cocok dengan kriteria segmen.
                    </p>
                  );
                }
                return members.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#341C24] truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-[#7A5C66] truncate">
                        {m.category} · {m.institution || m.email}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#AE5D72] shrink-0">
                      {m.status}
                    </span>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-4 pt-3 border-t border-[#F5E5E9] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectSegment(null)}
                className="px-4 py-2 rounded-xl bg-[#AE5D72] text-white text-xs font-semibold hover:bg-[#8F4458]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
