import React, { useMemo, useState } from 'react';
import {
  Info,
  TrendingUp,
  Eye,
  HeartHandshake,
  MousePointerClick,
  UserCheck,
  Percent,
  Lightbulb,
} from 'lucide-react';
import { useEventReach } from '../context/EventReachContext';
import {
  PlatformBarChart,
  TrendLineChart,
} from '../components/common/Charts';
import { MediaPlatform } from '../types/eventreach';

const PLATFORMS: MediaPlatform[] = [
  'Instagram',
  'TikTok',
  'WhatsApp',
  'Email',
  'Poster',
  'Website',
];

export const EvaluationPage: React.FC = () => {
  const { events, activeEventId, evaluations, settings } = useEventReach();

  const [selectedEventId, setSelectedEventId] = useState<string>(activeEventId);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Semua');
  const [selectedPlatform, setSelectedPlatform] = useState<'Semua' | MediaPlatform>('Semua');

  const eventMetrics = useMemo(() => {
    return evaluations.filter((ev) =>
      selectedEventId === 'Semua' ? true : ev.eventId === selectedEventId
    );
  }, [evaluations, selectedEventId]);

  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    eventMetrics.forEach((m) => set.add(m.period));
    return Array.from(set);
  }, [eventMetrics]);

  const filteredMetrics = useMemo(() => {
    return eventMetrics.filter((m) => {
      if (selectedPeriod !== 'Semua' && m.period !== selectedPeriod) return false;
      if (selectedPlatform !== 'Semua' && m.platform !== selectedPlatform) return false;
      return true;
    });
  }, [eventMetrics, selectedPeriod, selectedPlatform]);

  const summary = useMemo(() => {
    const reach = filteredMetrics.reduce((s, m) => s + m.reach, 0);
    const views = filteredMetrics.reduce((s, m) => s + m.views, 0);
    const engagement = filteredMetrics.reduce((s, m) => s + m.engagement, 0);
    const clicks = filteredMetrics.reduce((s, m) => s + m.clicks, 0);
    const registrations = filteredMetrics.reduce((s, m) => s + m.registrations, 0);
    const conversionRate =
      clicks > 0 ? Number(((registrations / clicks) * 100).toFixed(1)) : 0;

    return { reach, views, engagement, clicks, registrations, conversionRate };
  }, [filteredMetrics]);

  const platformComparison = useMemo(() => {
    return PLATFORMS.map((pl) => {
      const rows = filteredMetrics.filter((m) => m.platform === pl);
      const reach = rows.reduce((s, r) => s + r.reach, 0);
      const views = rows.reduce((s, r) => s + r.views, 0);
      const engagement = rows.reduce((s, r) => s + r.engagement, 0);
      const clicks = rows.reduce((s, r) => s + r.clicks, 0);
      const registrations = rows.reduce((s, r) => s + r.registrations, 0);
      const conversion =
        clicks > 0 ? Number(((registrations / clicks) * 100).toFixed(1)) : 0;

      return {
        platform: pl,
        reach,
        views,
        engagement,
        clicks,
        registrations,
        conversion,
      };
    }).filter((item) => item.reach > 0 || item.registrations > 0);
  }, [filteredMetrics]);

  const trendData = useMemo(() => {
    const periods = availablePeriods.length > 0 ? availablePeriods : ['Minggu 1'];
    return periods.map((p) => {
      const rows = eventMetrics.filter((m) => {
        if (m.period !== p) return false;
        if (selectedPlatform !== 'Semua' && m.platform !== selectedPlatform) return false;
        return true;
      });
      return {
        label: p,
        reach: rows.reduce((s, r) => s + r.reach, 0),
        registrations: rows.reduce((s, r) => s + r.registrations, 0),
      };
    });
  }, [eventMetrics, availablePeriods, selectedPlatform]);

  const insights = useMemo(() => {
    if (platformComparison.length === 0) return [];
    const topReach = [...platformComparison].sort((a, b) => b.reach - a.reach)[0];
    const topConv = [...platformComparison].sort(
      (a, b) => b.conversion - a.conversion
    )[0];
    const topReg = [...platformComparison].sort(
      (a, b) => b.registrations - a.registrations
    )[0];

    return [
      `${topReach.platform} menghasilkan jangkauan (reach) tertinggi sebesar ${topReach.reach.toLocaleString('id-ID')} audiens.`,
      `${topConv.platform} mencatat tingkat konversi klik-ke-registrasi tertinggi yaitu ${topConv.conversion}%.`,
      `${topReg.platform} menyumbang jumlah pendaftar terbanyak (${topReg.registrations} registrasi) pada periode evaluasi terpilih.`,
    ];
  }, [platformComparison]);

  const kpiCards = [
    {
      label: 'Total Reach',
      value: summary.reach.toLocaleString('id-ID'),
      icon: TrendingUp,
    },
    {
      label: 'Total Views',
      value: summary.views.toLocaleString('id-ID'),
      icon: Eye,
    },
    {
      label: 'Engagement',
      value: summary.engagement.toLocaleString('id-ID'),
      icon: HeartHandshake,
    },
    {
      label: 'Clicks',
      value: summary.clicks.toLocaleString('id-ID'),
      icon: MousePointerClick,
    },
    {
      label: 'Registrasi',
      value: summary.registrations.toLocaleString('id-ID'),
      icon: UserCheck,
    },
    {
      label: 'Konversi Klik',
      value: `${summary.conversionRate}%`,
      icon: Percent,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#341C24] tracking-tight">
          Evaluasi &amp; Laporan
        </h1>
        <p className="mt-1 text-sm text-[#6D4E58]">
          Analisis jangkauan, interaksi, dan efektivitas konversi media promosi event.
        </p>
      </div>

      {/* Clear Demo Data Banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FCECEF] border border-[#EBCBD3] text-xs text-[#6E3647]">
        <Info size={16} className="text-[#AE5D72] shrink-0 mt-0.5" />
        <p>
          <strong>Data Simulasi Demo:</strong> Seluruh metrik Reach, Views, Engagement, Clicks, dan Registrasi di halaman ini merupakan data demo terstruktur untuk ilustrasi evaluasi promosi dan tidak terhubung langsung ke API platform eksternal.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#F1DCE1] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#7A5C66] mb-1">
            Filter Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setSelectedPeriod('Semua');
            }}
            className="w-full px-3 py-2 rounded-xl bg-[#FDF6F7] border border-[#EBCBD3] text-xs font-semibold text-[#341C24] focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
          >
            <option value="Semua">Semua Event</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#7A5C66] mb-1">
            Periode Evaluasi
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#FDF6F7] border border-[#EBCBD3] text-xs font-semibold text-[#341C24] focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
          >
            <option value="Semua">Semua Periode</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#7A5C66] mb-1">
            Media Promosi
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) =>
              setSelectedPlatform(e.target.value as 'Semua' | MediaPlatform)
            }
            className="w-full px-3 py-2 rounded-xl bg-[#FDF6F7] border border-[#EBCBD3] text-xs font-semibold text-[#341C24] focus:outline-none focus:ring-2 focus:ring-[#AE5D72]"
          >
            <option value="Semua">Semua Media</option>
            {PLATFORMS.map((pl) => (
              <option key={pl} value={pl}>
                {pl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6 KPI Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white border border-[#F1DCE1] rounded-2xl p-4"
            >
              <div className="flex items-center justify-between text-[#AE5D72] mb-2">
                <span className="text-xs font-medium text-[#6D4E58]">
                  {kpi.label}
                </span>
                <Icon size={16} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#341C24] tabular-nums">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </section>

      {filteredMetrics.length === 0 ? (
        <div className="bg-white border border-[#F1DCE1] rounded-2xl p-12 text-center">
          <p className="text-base font-semibold text-[#341C24]">
            Belum ada data evaluasi untuk kombinasi filter ini
          </p>
          <p className="text-sm text-[#6D4E58] mt-1">
            Ubah filter event, periode, atau media promosi untuk melihat laporan performa.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-[#F1DCE1] rounded-2xl p-5 sm:p-6">
              <div className="mb-4">
                <h2 className="text-base font-bold text-[#341C24]">
                  Tren Performa Mingguan
                </h2>
                <p className="text-xs text-[#7A5C66]">
                  Perkembangan jangkauan (reach) dan hasil registrasi antarperiode
                </p>
              </div>
              <TrendLineChart data={trendData} />
            </div>

            <div className="bg-white border border-[#F1DCE1] rounded-2xl p-5 sm:p-6">
              <div className="mb-4">
                <h2 className="text-base font-bold text-[#341C24]">
                  Perbandingan Antarplatform
                </h2>
                <p className="text-xs text-[#7A5C66]">
                  Perbandingan Clicks dan Engagement di setiap kanal promosi
                </p>
              </div>
              <PlatformBarChart
                primaryLabel="Engagement"
                secondaryLabel="Clicks"
                data={platformComparison.map((p) => ({
                  label: p.platform,
                  primary: p.engagement,
                  secondary: p.clicks,
                }))}
              />
            </div>
          </section>

          {/* Insights + Breakdown Table */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {settings.showInsightTips && (
              <div className="lg:col-span-4 bg-[#FCECEF] border border-[#EBCBD3] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#8F4458]">
                  <Lightbulb size={18} />
                  <h2 className="text-base font-bold">Ringkasan Insight</h2>
                </div>
                <ul className="space-y-2.5 text-xs text-[#341C24] leading-relaxed">
                  {insights.map((ins, i) => (
                    <li
                      key={i}
                      className="bg-white/80 rounded-xl p-3 border border-[#F0D5DC]"
                    >
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className={`${
                settings.showInsightTips ? 'lg:col-span-8' : 'lg:col-span-12'
              } bg-white border border-[#F1DCE1] rounded-2xl overflow-hidden`}
            >
              <div className="px-5 py-4 border-b border-[#F5E5E9]">
                <h2 className="text-base font-bold text-[#341C24]">
                  Rincian Performa Media Promosi
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FDF6F7] border-b border-[#F1DCE1] text-[11px] font-semibold text-[#6D4E58]">
                      <th className="py-3 px-4">Platform</th>
                      <th className="py-3 px-4 text-right">Reach</th>
                      <th className="py-3 px-4 text-right">Views</th>
                      <th className="py-3 px-4 text-right">Engagement</th>
                      <th className="py-3 px-4 text-right">Clicks</th>
                      <th className="py-3 px-4 text-right">Registrasi</th>
                      <th className="py-3 px-4 text-right">Konversi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5E5E9] text-xs tabular-nums">
                    {platformComparison.map((row) => (
                      <tr key={row.platform} className="hover:bg-[#FFF9FA]">
                        <td className="py-3 px-4 font-bold text-[#341C24]">
                          {row.platform}
                        </td>
                        <td className="py-3 px-4 text-right text-[#341C24]">
                          {row.reach.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right text-[#6D4E58]">
                          {row.views.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right text-[#6D4E58]">
                          {row.engagement.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right text-[#6D4E58]">
                          {row.clicks.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#1F7A53]">
                          {row.registrations.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#AE5D72]">
                          {row.conversion}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
