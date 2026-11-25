import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useEventReach } from '../../context/EventReachContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useEventReach();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'error' ? (
            <AlertCircle size={18} className="text-[#B91C1C] shrink-0" />
          ) : toast.type === 'info' ? (
            <Info size={18} className="text-[#AE5D72] shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-[#1F7A53] shrink-0" />
          );

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center gap-3 bg-white border border-[#EBCBD3] shadow-md rounded-xl px-4 py-3 text-sm text-[#341C24] transition-all duration-200"
          >
            {icon}
            <p className="flex-1 font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Tutup notifikasi"
              className="p-1 rounded-lg text-[#7A5C66] hover:text-[#341C24] hover:bg-[#FDF2F4] transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
