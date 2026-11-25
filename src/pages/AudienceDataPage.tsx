import React, { useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  Edit3,
  Trash2,
  Users,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  calculateMemberCompleteness,
  useEventReach,
} from '../context/EventReachContext';
import {
  AudienceCategory,
  AudienceMember,
  AudienceStatus,
} from '../types/eventreach';

const CATEGORIES: AudienceCategory[] = [
  'Mahasiswa',
  'Dosen',
  'Alumni',
  'Masyarakat Umum',
];

const STATUSES: AudienceStatus[] = [
  'Terkonfirmasi',
  'Terdaftar',
  'Prospek',
  'Batal',
];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  category: 'Mahasiswa' as AudienceCategory,
  institution: '',
  age: '20',
  interest: 'Public Relations',
  status: 'Terdaftar' as AudienceStatus,
};

export const AudienceDataPage: React.FC = () => {
  const {
    activeEvent,
    activeEventId,
    activeAudiences,
    addAudience,
    importAudiences,
    updateAudience,
    deleteAudience,
    requestConfirm,
    showToast,
    settings,
  } = useEventReach();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | AudienceCategory>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | AudienceStatus>('Semua');

  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AudienceMember | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAudiences = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeAudiences.filter((m) => {
      if (categoryFilter !== 'Semua' && m.category !== categoryFilter) return false;
      if (statusFilter !== 'Semua' && m.status !== statusFilter) return false;
      if (q) {
        const match =
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.institution.toLowerCase().includes(q) ||
          m.interest.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [activeAudiences, search, categoryFilter, statusFilter]);

  const avgCompleteness = useMemo(() => {
    if (activeAudiences.length === 0) return 0;
    const sum = activeAudiences.reduce(
      (acc, m) => acc + calculateMemberCompleteness(m),
      0
    );
    return Math.round(sum / activeAudiences.length);
  }, [activeAudiences]);

  const openAddForm = () => {
    setEditingMember(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (m: AudienceMember) => {
    setEditingMember(m);
    setForm({
      name: m.name,
      email: m.email,
      phone: m.phone,
      category: m.category,
      institution: m.institution,
      age: m.age !== null ? String(m.age) : '',
      interest: m.interest,
      status: m.status,
    });
    setFormOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    const parsedAge = form.age.trim() ? Number(form.age) : null;

    if (editingMember) {
      updateAudience(editingMember.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        category: form.category,
        institution: form.institution.trim(),
        age: parsedAge && !Number.isNaN(parsedAge) ? parsedAge : null,
        interest: form.interest.trim(),
        status: form.status,
      });
    } else {
      addAudience({
        eventId: activeEventId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        category: form.category,
        institution: form.institution.trim(),
        age: parsedAge && !Number.isNaN(parsedAge) ? parsedAge : null,
        interest: form.interest.trim(),
        status: form.status,
      });
    }
    setFormOpen(false);
  };

  const handleDeleteMember = (m: AudienceMember) => {
    requestConfirm({
      title: `Hapus "${m.name}"?`,
      message: `Data peserta ${m.name} (${m.email}) akan dihapus dari daftar audiens ${activeEvent?.name || 'event ini'}.`,
      confirmLabel: 'Hapus Peserta',
      variant: 'danger',
      onConfirm: () => deleteAudience(m.id),
    });
  };

  const handleDownloadSampleCsv = () => {
    const sample = [
      'nama,email,telepon,kategori,institusi,usia,minat,status',
      'Nayla Azzahra,nayla.azzahra@mhs.unj.ac.id,081290123344,Mahasiswa,Universitas Negeri Jakarta,20,Public Relations,Terdaftar',
      'Dr. Bambang Setiawan,bambang@unj.ac.id,081145678901,Dosen,Universitas Negeri Jakarta,45,Riset Komunikasi,Terkonfirmasi',
      'Raka Pratama,raka.pratama@gmail.com,085611223344,Masyarakat Umum,Komunitas Kreatif,25,Digital Marketing,Prospek',
    ].join('\n');
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contoh_data_audiens_eventreach.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const header = 'nama,email,telepon,kategori,institusi,usia,minat,status';
    const rows = filteredAudiences.map((m) =>
      [
        `"${m.name.replace(/"/g, '""')}"`,
        `"${m.email}"`,
        `"${m.phone}"`,
        `"${m.category}"`,
        `"${m.institution.replace(/"/g, '""')}"`,
        m.age ?? '',
        `"${m.interest.replace(/"/g, '""')}"`,
        `"${m.status}"`,
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audiens_${activeEvent?.name.toLowerCase().replace(/\s+/g, '_') || 'event'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File CSV audiens berhasil diekspor', 'info');
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCsvText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const parseAndImportCsv = () => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      showToast('Tempel isi CSV atau unggah file CSV terlebih dahulu', 'error');
      return;
    }

    const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;
    const parsedRows: Omit<AudienceMember, 'id' | 'createdAt'>[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 2 || !cols[0] || !cols[1]) continue;

      const rawCat = cols[3] || 'Mahasiswa';
      const validCat: AudienceCategory = CATEGORIES.includes(rawCat as AudienceCategory)
        ? (rawCat as AudienceCategory)
        : 'Masyarakat Umum';

      const rawStatus = cols[7] || 'Terdaftar';
      const validStatus: AudienceStatus = STATUSES.includes(rawStatus as AudienceStatus)
        ? (rawStatus as AudienceStatus)
        : 'Terdaftar';

      const parsedAge = cols[5] ? Number(cols[5]) : null;

      parsedRows.push({
        eventId: activeEventId,
        name: cols[0],
        email: cols[1],
        phone: cols[2] || '',
        category: validCat,
        institution: cols[4] || '',
        age: parsedAge && !Number.isNaN(parsedAge) ? parsedAge : null,
        interest: cols[6] || 'Komunikasi Umum',
        status: validStatus,
      });
    }

    if (parsedRows.length === 0) {
      showToast('Format CSV tidak valid. Pastikan minimal ada kolom nama dan email.', 'error');
      return;
    }

    importAudiences(parsedRows);
    setCsvText('');
    setCsvModalOpen(false);
  };

  const statusMeta = (status: AudienceStatus) => {
    switch (status) {
      case 'Terkonfirmasi':
        return {
          text: 'text-[#1F7A53] bg-[#ECFDF5]',
          icon: <CheckCircle2 size={13} />,
        };
      case 'Terdaftar':
        return {
          text: 'text-[#8F4458] bg-[#FCECEF]',
          icon: <Clock size={13} />,
        };
      case 'Prospek':
        return {
          text: 'text-[#B45309] bg-[#FFFBEB]',
          icon: <AlertCircle size={13} />,
        };
      default:
        return {
          text: 'text-[#B91C1C] bg-[#FEF2F2]',
          icon: <X size={13} />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#341C24] tracking-tight">
            Data Audiens
          </h1>
          <p className="mt-1 text-sm text-[#6D4E58]">
            {activeEvent?.name} ·{' '}
            <span className="font-semibold text-[#341C24] tabular-nums">
              {activeAudiences.length} total audiens
            </span>{' '}
            ·{' '}
            <span className="tabular-nums">{avgCompleteness}% kelengkapan data</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EBCBD3] text-xs font-semibold text-[#341C24] hover:bg-[#FDF2F4] transition-colors whitespace-nowrap"
          >
            <Upload size={15} className="text-[#AE5D72]" />
            Import CSV
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredAudiences.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EBCBD3] text-xs font-semibold text-[#341C24] hover:bg-[#FDF2F4] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Download size={15} className="text-[#AE5D72]" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Tambah Audiens
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-[#F1DCE1] rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A7B86]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, institusi, atau minat peserta..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FDF6F7] border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select
              aria-label="Filter status audiens"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'Semua' | AudienceStatus)
              }
              className="px-3.5 py-2.5 rounded-xl bg-[#FDF6F7] border border-[#EBCBD3] text-xs font-semibold text-[#341C24] focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
            >
              <option value="Semua">Semua Status</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['Semua', ...CATEGORIES] as const).map((cat) => {
              const count =
                cat === 'Semua'
                  ? activeAudiences.length
                  : activeAudiences.filter((a) => a.category === cat).length;
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap tabular-nums ${
                    active
                      ? 'bg-[#AE5D72] text-white'
                      : 'bg-[#FDF6F7] text-[#6D4E58] hover:bg-[#FCECEF] hover:text-[#341C24]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#7A5C66] tabular-nums">
            Menampilkan {filteredAudiences.length} peserta
          </p>
        </div>
      </div>

      {/* Empty State or Data Table */}
      {filteredAudiences.length === 0 ? (
        <div className="bg-white border border-[#F1DCE1] rounded-2xl p-12 text-center">
          <Users size={38} className="mx-auto text-[#D99BA9] mb-3" />
          <h3 className="text-base font-semibold text-[#341C24]">
            {activeAudiences.length === 0
              ? 'Belum ada data audiens pada event ini'
              : 'Tidak ada audiens yang cocok dengan pencarian'}
          </h3>
          <p className="mt-1 text-sm text-[#6D4E58]">
            {activeAudiences.length === 0
              ? 'Tambahkan calon peserta pertama secara manual atau impor file CSV.'
              : 'Coba ubah kata kunci pencarian atau reset filter kategori dan status.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {activeAudiences.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('Semua');
                  setStatusFilter('Semua');
                }}
                className="px-4 py-2 rounded-xl border border-[#ECCFD6] text-xs font-semibold text-[#6D4E58] hover:bg-[#FDF2F4]"
              >
                Reset Filter
              </button>
            )}
            <button
              type="button"
              onClick={openAddForm}
              className="px-4 py-2 rounded-xl bg-[#AE5D72] text-white text-xs font-semibold hover:bg-[#8F4458]"
            >
              Tambah Audiens
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-[#F1DCE1] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDF6F7] border-b border-[#F1DCE1] text-[11px] font-semibold text-[#6D4E58]">
                    <th className="py-3 px-4">Nama &amp; Kontak</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Institusi</th>
                    <th className="py-3 px-4">Minat</th>
                    <th className="py-3 px-4 text-right">Usia</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5E5E9] text-sm">
                  {filteredAudiences.map((m) => {
                    const meta = statusMeta(m.status);
                    const rowPad = settings.compactTable ? 'py-2' : 'py-3.5';
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-[#FFF9FA] transition-colors"
                      >
                        <td className={`${rowPad} px-4`}>
                          <p className="font-semibold text-[#341C24]">{m.name}</p>
                          <p className="text-xs text-[#7A5C66] mt-0.5">
                            {m.email}
                            {m.phone ? ` · ${m.phone}` : ''}
                          </p>
                        </td>
                        <td className={`${rowPad} px-4 text-xs font-medium text-[#341C24]`}>
                          {m.category}
                        </td>
                        <td className={`${rowPad} px-4 text-xs text-[#6D4E58]`}>
                          {m.institution || <span className="text-[#B898A3]">Belum diisi</span>}
                        </td>
                        <td className={`${rowPad} px-4 text-xs text-[#6D4E58]`}>
                          {m.interest || '-'}
                        </td>
                        <td className={`${rowPad} px-4 text-xs text-[#341C24] text-right tabular-nums`}>
                          {m.age !== null ? m.age : '-'}
                        </td>
                        <td className={`${rowPad} px-4`}>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${meta.text}`}
                          >
                            {meta.icon}
                            {m.status}
                          </span>
                        </td>
                        <td className={`${rowPad} px-4 text-right`}>
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditForm(m)}
                              aria-label={`Edit ${m.name}`}
                              className="p-1.5 rounded-lg text-[#6D4E58] hover:bg-[#FCECEF] hover:text-[#AE5D72]"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m)}
                              aria-label={`Hapus ${m.name}`}
                              className="p-1.5 rounded-lg text-[#6D4E58] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filteredAudiences.map((m) => {
              const meta = statusMeta(m.status);
              return (
                <div
                  key={m.id}
                  className="bg-white border border-[#F1DCE1] rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#341C24] truncate">
                        {m.name}
                      </h3>
                      <p className="text-xs text-[#7A5C66] truncate">{m.email}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${meta.text}`}
                    >
                      {meta.icon}
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#6D4E58]">
                    {m.category} · {m.institution || 'Institusi belum diisi'} ·{' '}
                    {m.interest}
                  </p>

                  <div className="pt-2 border-t border-[#F5E5E9] flex items-center justify-between text-xs">
                    <span className="text-[#7A5C66] tabular-nums">
                      {m.phone || 'Tanpa telepon'}
                      {m.age ? ` · ${m.age} th` : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(m)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#AE5D72] hover:bg-[#FCECEF]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(m)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2]"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Audience Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#341C24]/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white border border-[#F0D5DC] rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#341C24]">
                {editingMember ? 'Edit Data Audiens' : 'Tambah Data Audiens'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Tutup form"
                className="p-1.5 rounded-lg text-[#7A5C66] hover:bg-[#FDF2F4]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Nadia Putri Ramadhani"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Kategori Audiens
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as AudienceCategory })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Status Registrasi
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as AudienceStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Asal Institusi / Komunitas
                  </label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) =>
                      setForm({ ...form, institution: e.target.value })
                    }
                    placeholder="Contoh: Universitas Negeri Jakarta"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#341C24] mb-1">
                    Usia
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={99}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="20"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Minat / Topik Utama
                </label>
                <input
                  type="text"
                  value={form.interest}
                  onChange={(e) => setForm({ ...form, interest: e.target.value })}
                  placeholder="Contoh: Public Relations, Digital Marketing, Media"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#ECCFD6] text-sm font-medium text-[#6D4E58] hover:bg-[#FDF2F4]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Simpan Audiens'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#341C24]/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white border border-[#F0D5DC] rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-[#AE5D72]" />
                <h2 className="text-lg font-bold text-[#341C24]">
                  Import Data Audiens (CSV)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                aria-label="Tutup modal CSV"
                className="p-1.5 rounded-lg text-[#7A5C66] hover:bg-[#FDF2F4]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#6D4E58] leading-relaxed">
              Unggah file <code className="font-mono">.csv</code> atau tempel baris CSV dengan urutan kolom:{' '}
              <span className="font-semibold text-[#341C24]">
                nama, email, telepon, kategori, institusi, usia, minat, status
              </span>
              .
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCECEF] text-[#8F4458] text-xs font-semibold hover:bg-[#F7D7DF]"
              >
                <Upload size={14} />
                Pilih File .CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EBCBD3] text-[#6D4E58] text-xs font-semibold hover:bg-[#FDF2F4]"
              >
                <Download size={14} />
                Unduh Contoh CSV
              </button>
            </div>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={'nama,email,telepon,kategori,institusi,usia,minat,status\nSari Indah,sari@unj.ac.id,08123456789,Mahasiswa,UNJ,20,Public Relations,Terdaftar'}
              className="mt-3 w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#ECCFD6] text-sm font-medium text-[#6D4E58] hover:bg-[#FDF2F4]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={parseAndImportCsv}
                className="px-5 py-2 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold"
              >
                Proses &amp; Impor Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
