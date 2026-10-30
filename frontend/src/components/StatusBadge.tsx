import React from 'react';
import { RecognitionState } from '../types';
import { Check, AlertTriangle, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StatusBadgeProps {
  status: RecognitionState | 'patient_reported_taken' | 'caregiver_reported_taken' | 'patient_reported_skipped' | 'not_sure' | 'unconfirmed';
  confirmedBy?: string | null;
  confirmedAt?: string | null;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  confirmedBy,
  confirmedAt,
  className = ''
}) => {
  const { t } = useLanguage();

  if (status === 'confirmed') {
    return (
      <div className={`inline-flex flex-col gap-0.5 ${className}`}>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E6F4EF] text-[#123F3A] border border-[#138A7B]/30">
          <Check className="w-3.5 h-3.5 text-[#138A7B] stroke-[2.5]" />
          {t.review.stateC}
        </span>
        {confirmedBy && (
          <span className="text-[11px] text-[#66736F] pl-1">
            by {confirmedBy}
          </span>
        )}
      </div>
    );
  }

  if (status === 'needs_clarification') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF9EF] text-[#9A5E0B] border border-[#D99026]/40 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#D99026] stroke-[2.2]" />
        {t.review.stateB}
      </span>
    );
  }

  if (status === 'needs_review') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F4] text-[#25312F] border border-[#CBD5E1] ${className}`}>
        <Eye className="w-3.5 h-3.5 text-[#66736F] stroke-[2]" />
        {t.review.stateA}
      </span>
    );
  }

  if (status === 'patient_reported_taken') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#E6F4EF] text-[#123F3A] border border-[#138A7B]/30 ${className}`}>
        <Check className="w-3 h-3 text-[#138A7B]" />
        Patient reported
      </span>
    );
  }

  if (status === 'caregiver_reported_taken') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#E6F4EF] text-[#123F3A] border border-[#138A7B]/30 ${className}`}>
        <Check className="w-3 h-3 text-[#138A7B]" />
        Caregiver witnessed
      </span>
    );
  }

  if (status === 'patient_reported_skipped') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FDF2F2] text-[#991B1B] border border-[#B94F45]/30 ${className}`}>
        Reported skipped
      </span>
    );
  }

  if (status === 'not_sure') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F9FA] text-[#475569] border border-[#CBD5E1] ${className}`}>
        Uncertain
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#475569] ${className}`}>
      Unconfirmed reminder
    </span>
  );
};

