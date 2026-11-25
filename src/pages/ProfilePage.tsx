import React, { useRef, useState } from 'react';
import {
  Camera,
  RotateCcw,
  Save,
  Trash2,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { useEventReach } from '../context/EventReachContext';
import { UserAvatarDisplay } from '../components/common/BrandMark';
import { UserProfile } from '../types/eventreach';

const AVATAR_PRESETS: { id: UserProfile['avatarPreset']; label: string; color: string }[] = [
  { id: 'rose', label: 'Soft Rose', color: '#F5CED7' },
  { id: 'blush', label: 'Blush Pink', color: '#FCE8EC' },
  { id: 'mauve', label: 'Dusty Mauve', color: '#AE5D72' },
  { id: 'berry', label: 'Deep Berry', color: '#5B2E3D' },
];

export const ProfilePage: React.FC = () => {
  const {
    profile,
    settings,
    updateProfile,
    updateSettings,
    resetDemoData,
    requestConfirm,
  } = useEventReach();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [organization, setOrganization] = useState(profile.organization);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      organization: organization.trim(),
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProfile({ customAvatarDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDemo = () => {
    requestConfirm({
      title: 'Pulihkan Data Demo Awal?',
      message:
        'Semua perubahan event, audiens, segmentasi, strategi, dan jadwal promosi yang tersimpan di browser akan dikembalikan ke data contoh awal.',
      confirmLabel: 'Ya, Reset Data Demo',
      variant: 'danger',
      onConfirm: () => {
        resetDemoData();
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#341C24] tracking-tight">
          Profil &amp; Pengaturan
        </h1>
        <p className="mt-1 text-sm text-[#6D4E58]">
          Kelola identitas akun panitia dan preferensi tampilan aplikasi EventReach.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Form */}
        <section className="lg:col-span-7 bg-white border border-[#F1DCE1] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-[#AE5D72]" />
            <h2 className="text-base font-bold text-[#341C24]">
              Informasi Pengguna
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 mb-5 border-b border-[#F5E5E9]">
            <UserAvatarDisplay profile={profile} size="lg" />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FCECEF] text-[#8F4458] text-xs font-semibold hover:bg-[#F7D7DF]"
                >
                  <Camera size={14} />
                  Unggah Foto Profil
                </button>
                {profile.customAvatarDataUrl && (
                  <button
                    type="button"
                    onClick={() => updateProfile({ customAvatarDataUrl: undefined })}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#EBCBD3] text-xs font-medium text-[#6D4E58] hover:bg-[#FDF2F4]"
                  >
                    <Trash2 size={13} />
                    Hapus Foto
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#7A5C66]">Warna inisial:</span>
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    aria-label={`Pilih warna avatar ${preset.label}`}
                    onClick={() =>
                      updateProfile({
                        avatarPreset: preset.id,
                        customAvatarDataUrl: undefined,
                      })
                    }
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      !profile.customAvatarDataUrl &&
                      profile.avatarPreset === preset.id
                        ? 'border-[#341C24] scale-110'
                        : 'border-white'
                    }`}
                    style={{ backgroundColor: preset.color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#341C24] mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#341C24] mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Peran di Kepanitiaan
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#341C24] mb-1">
                  Organisasi / Komunitas
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBCBD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AE5D72] hover:bg-[#8F4458] text-white text-sm font-semibold transition-colors"
              >
                <Save size={16} />
                Simpan Profil
              </button>
            </div>
          </form>
        </section>

        {/* App Settings & Reset */}
        <section className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#F1DCE1] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-[#AE5D72]" />
              <h2 className="text-base font-bold text-[#341C24]">
                Pengaturan Aplikasi
              </h2>
            </div>

            <label className="flex items-start justify-between gap-3 py-2 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-[#341C24]">
                  Tampilan Tabel Ringkas
                </p>
                <p className="text-xs text-[#6D4E58]">
                  Mengurangi jarak baris pada tabel Data Audiens agar lebih banyak data terlihat.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.compactTable}
                onChange={(e) =>
                  updateSettings({ compactTable: e.target.checked })
                }
                className="mt-1 w-4 h-4 accent-[#AE5D72] shrink-0"
              />
            </label>

            <label className="flex items-start justify-between gap-3 py-2 border-t border-[#F5E5E9] cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-[#341C24]">
                  Tampilkan Ringkasan Insight
                </p>
                <p className="text-xs text-[#6D4E58]">
                  Menampilkan panel ringkasan insight otomatis pada halaman Evaluasi &amp; Laporan.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.showInsightTips}
                onChange={(e) =>
                  updateSettings({ showInsightTips: e.target.checked })
                }
                className="mt-1 w-4 h-4 accent-[#AE5D72] shrink-0"
              />
            </label>

            <label className="flex items-start justify-between gap-3 py-2 border-t border-[#F5E5E9] cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-[#341C24]">
                  Penyimpanan Lokal Otomatis
                </p>
                <p className="text-xs text-[#6D4E58]">
                  Menjaga data tetap tersimpan di browser meskipun halaman dimuat ulang.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSaveDrafts}
                onChange={(e) =>
                  updateSettings({ autoSaveDrafts: e.target.checked })
                }
                className="mt-1 w-4 h-4 accent-[#AE5D72] shrink-0"
              />
            </label>
          </div>

          <div className="bg-[#FCECEF] border border-[#EBCBD3] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#341C24]">
              Pemulihan Data Demo
            </h3>
            <p className="mt-1 text-xs text-[#6D4E58] leading-relaxed">
              Kembalikan seluruh data event, peserta, segmentasi, dan rencana promosi ke contoh bawaan awal jika diperlukan untuk presentasi ulang.
            </p>
            <button
              type="button"
              onClick={handleResetDemo}
              className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DCAAB7] text-xs font-semibold text-[#8F4458] hover:bg-[#FFF5F7] transition-colors"
            >
              <RotateCcw size={14} />
              Reset ke Data Demo Awal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
