import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { ReportSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Info,
  Download,
  AlertCircle
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { adherenceEvents, setActivePdfReport } = useApp();

  const [period, setPeriod] = useState<'this_week' | 'this_month' | 'custom'>('this_week');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchSummary = async (selectedPeriod: string) => {
    try {
      const res = await fetch(`/api/reports/summary?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.warn("Failed to fetch report summary:", e);
    }
  };

  useEffect(() => {
    fetchSummary(period);
  }, [period, adherenceEvents]);

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const form = new FormData();
      form.append('period', period.replace('_', ' ').toUpperCase());

      const res = await fetch('/api/reports/pdf', {
        method: 'POST',
        body: form
      });

      if (!res.ok) throw new Error("PDF generation failed");
      const data = await res.json();

      setActivePdfReport({
        url: data.download_url,
        filename: data.filename
      });

      setSuccessToast(t.reports.downloadSuccess);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CBD5E1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4EF] text-[#123F3A] text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5 text-[#138A7B]" />
            <span>{language === 'ta' ? 'மருத்துவர் அறிக்கை & புள்ளிவிவரங்கள்' : 'Clinical Adherence & Doctor Summary'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123F3A]">
            {t.reports.title}
          </h1>
          <p className="text-sm text-[#66736F] mt-1 max-w-2xl">
            {t.reports.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="px-5 py-3 rounded-2xl bg-[#123F3A] text-white hover:bg-[#1A534C] text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#138A7B]" />
            ) : (
              <Download className="w-4 h-4 text-[#138A7B]" />
            )}
            <span>{language === 'ta' ? 'PDF பதிவிறக்கம்' : 'Generate Doctor PDF'}</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-[#E6F4EF] border border-[#138A7B] text-[#123F3A] text-sm font-medium rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#138A7B] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#CBD5E1] flex flex-wrap sm:inline-flex text-xs font-semibold shadow-2xs">
        <button
          onClick={() => setPeriod('this_week')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            period === 'this_week'
              ? 'bg-[#123F3A] text-white shadow-xs'
              : 'text-[#66736F] hover:text-[#25312F]'
          }`}
        >
          {t.reports.filters.thisWeek}
        </button>
        <button
          onClick={() => setPeriod('this_month')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            period === 'this_month'
              ? 'bg-[#123F3A] text-white shadow-xs'
              : 'text-[#66736F] hover:text-[#25312F]'
          }`}
        >
          {t.reports.filters.thisMonth}
        </button>
        <button
          onClick={() => setPeriod('custom')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            period === 'custom'
              ? 'bg-[#123F3A] text-white shadow-xs'
              : 'text-[#66736F] hover:text-[#25312F]'
          }`}
        >
          {t.reports.filters.custom}
        </button>
      </div>

      {/* Primary KPI & Adherence Formula Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Adherence Score Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#66736F] uppercase tracking-wider">
                {language === 'ta' ? 'நோயாளி-அறிவித்த மருந்து விகிதம்' : 'Patient-Reported Adherence Rate'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4EF] text-[#138A7B] text-xs font-bold">
                {period.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-[#123F3A]">
                {summary ? `${summary.reported_adherence_rate}%` : '0%'}
              </span>
              <span className="text-xs text-[#66736F]">
                {summary?.reported_taken ?? 0} of {((summary?.reported_taken ?? 0) + (summary?.reported_skipped ?? 0))} reported doses
              </span>
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#CBD5E1] text-xs text-[#66736F] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#138A7B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.reports.formulaExplainer}
            </p>
          </div>
        </div>

        {/* 4 Detailed Adherence Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#CBD5E1] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#66736F]">{t.reports.statTaken}</span>
              <div className="w-8 h-8 rounded-full bg-[#E6F4EF] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#138A7B]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#123F3A]">{summary?.reported_taken ?? 0}</span>
              <span className="text-[11px] text-[#66736F] block mt-0.5">Reported taken on schedule</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#CBD5E1] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#66736F]">{t.reports.statCaregiver}</span>
              <div className="w-8 h-8 rounded-full bg-[#FAF8F3] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#123F3A]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#25312F]">{summary?.caregiver_reported ?? 0}</span>
              <span className="text-[11px] text-[#66736F] block mt-0.5">Confirmed by authorized family</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#CBD5E1] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#66736F]">{t.reports.statSkipped}</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF9EF] flex items-center justify-center">
                <XCircle className="w-4 h-4 text-[#D99026]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#9A5E0B]">{summary?.reported_skipped ?? 0}</span>
              <span className="text-[11px] text-[#66736F] block mt-0.5">With documented clinical reason</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#CBD5E1] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#66736F]">{t.reports.statUnconfirmed}</span>
              <div className="w-8 h-8 rounded-full bg-[#F8F9FA] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#66736F]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#66736F]">{summary?.unconfirmed ?? 0}</span>
              <span className="text-[11px] text-[#66736F] block mt-0.5">Pending user response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skipped Reasons Breakdown if any exist */}
      {summary && Object.keys(summary.skipped_reasons_breakdown).length > 0 && (
        <section className="p-6 sm:p-7 rounded-3xl bg-white border border-[#CBD5E1] shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D99026]" />
            <h3 className="text-sm font-bold text-[#123F3A] uppercase tracking-wider">
              {language === 'ta' ? 'தவிர்க்கப்பட்ட அளவுகளுக்கான காரணங்கள்' : 'Reported Reasons for Skipped Doses'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(summary.skipped_reasons_breakdown).map(([reason, count]) => (
              <div key={reason} className="p-3.5 rounded-2xl bg-[#FFF9EF] border border-[#D99026]/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9A5E0B] capitalize">{reason.replace('_', ' ')}</span>
                <span className="px-2.5 py-1 rounded-full bg-white text-[#9A5E0B] font-bold text-xs shadow-2xs">
                  {count} {count === 1 ? 'time' : 'times'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detailed Event Timeline / Adherence Log Table */}
      <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#123F3A]">
              {language === 'ta' ? 'பதிவு செய்யப்பட்ட நேரடி நிகழ்வுகள்' : 'Recorded Event Timeline'}
            </h3>
            <p className="text-xs text-[#66736F]">
              {language === 'ta' ? 'நோயாளி அல்லது பராமரிப்பாளரால் உறுதிப்படுத்தப்பட்ட அனைத்து பதிவுகளும்' : 'Chronological audit trail of reported patient responses'}
            </p>
          </div>
        </div>

        {adherenceEvents.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl bg-[#FAF8F3] border border-dashed border-[#CBD5E1] text-center space-y-2">
            <Clock className="w-8 h-8 text-[#66736F]/50 mx-auto" />
            <p className="text-sm font-semibold text-[#25312F]">
              {language === 'ta' ? 'பதிவுகள் எதுவும் இல்லை' : 'No dose events recorded yet'}
            </p>
            <p className="text-xs text-[#66736F] max-w-md mx-auto">
              {language === 'ta' ? 'மருந்து அட்டவணை தொடங்கப்பட்டவுடன் இங்கே அனைத்து விவரங்களும் பட்டியலிடப்படும்.' : 'When reminders are logged or doses confirmed from the home dashboard, they will populate here for clinical review.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E9E8] text-[#66736F] uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Medicine</th>
                  <th className="py-3 px-3 font-semibold">Scheduled Time</th>
                  <th className="py-3 px-3 font-semibold">Reported Source</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Clinical Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F7F2]">
                {adherenceEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-[#25312F]">
                      {ev.medicine_name}
                    </td>
                    <td className="py-3.5 px-3 text-[#66736F]">
                      {ev.scheduled_time}
                    </td>
                    <td className="py-3.5 px-3 text-[#25312F] capitalize">
                      {ev.reporting_source}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="py-3.5 px-3 text-[#66736F]">
                      {ev.skipped_reason ? (
                        <span className="text-[#D99026] font-medium capitalize">
                          Reason: {ev.skipped_reason.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-[#66736F]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
