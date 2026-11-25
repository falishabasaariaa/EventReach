import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useEventReach } from '../../context/EventReachContext';

export const ConfirmDialog: React.FC = () => {
  const { confirmDialog, closeConfirm } = useEventReach();

  if (!confirmDialog.isOpen) return null;

  const isDanger = confirmDialog.variant !== 'primary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#341C24]/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md bg-white border border-[#F0D5DC] rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDanger ? 'bg-[#FEF2F2] text-[#B91C1C]' : 'bg-[#FCE8EC] text-[#AE5D72]'
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3
                id="confirm-dialog-title"
                className="text-base font-semibold text-[#341C24]"
              >
                {confirmDialog.title}
              </h3>
              <p className="mt-1.5 text-sm text-[#6D4E58] leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeConfirm}
            aria-label="Tutup dialog"
            className="p-1.5 rounded-lg text-[#7A5C66] hover:bg-[#FDF2F4] hover:text-[#341C24] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeConfirm}
            className="px-4 py-2 text-sm font-medium text-[#6D4E58] bg-[#FDF6F7] border border-[#ECCFD6] rounded-xl hover:bg-[#FCECEF] transition-colors whitespace-nowrap shrink-0"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              confirmDialog.onConfirm();
              closeConfirm();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              isDanger
                ? 'bg-[#B91C1C] hover:bg-[#991B1B]'
                : 'bg-[#AE5D72] hover:bg-[#8F4458]'
            }`}
          >
            {confirmDialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
