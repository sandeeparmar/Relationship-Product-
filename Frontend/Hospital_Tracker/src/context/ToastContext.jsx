import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = "info") => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const getVariantClasses = (variant) => {
    switch (variant) {
      case "success":
        return "bg-emerald-600 text-white border-emerald-400";
      case "error":
        return "bg-red-600 text-white border-red-400";
      case "warning":
        return "bg-amber-500 text-white border-amber-300";
      default:
        return "bg-slate-900 text-white border-slate-600";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[220px] max-w-xs px-4 py-3 rounded-xl border shadow-lg shadow-black/20 text-sm flex items-start gap-2 animate-in slide-in-from-right`}
          >
            <div
              className={`flex-1 rounded-lg px-3 py-2 ${getVariantClasses(
                toast.variant
              )}`}
            >
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

