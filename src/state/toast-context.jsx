import { CheckCircle2, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 2200;
const MIN_LOADING_DURATION = 900;

function getToastIcon(tone) {
  if (tone === 'success') {
    return CheckCircle2;
  }

  if (tone === 'error') {
    return TriangleAlert;
  }

  return LoaderCircle;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  const dismiss = (id) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const scheduleDismiss = (id, duration = DEFAULT_DURATION) => {
    const currentTimeout = timeoutsRef.current.get(id);
    if (currentTimeout) {
      window.clearTimeout(currentTimeout);
    }

    const timeoutId = window.setTimeout(() => {
      dismiss(id);
    }, duration);

    timeoutsRef.current.set(id, timeoutId);
  };

  const show = ({ tone = 'loading', title, description, duration } = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((current) => [...current, { id, tone, title, description }]);

    if (tone !== 'loading') {
      scheduleDismiss(id, duration);
    }

    return id;
  };

  const update = (id, { tone, title, description, duration } = {}) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id
          ? {
              ...toast,
              ...(tone ? { tone } : {}),
              ...(title !== undefined ? { title } : {}),
              ...(description !== undefined ? { description } : {}),
            }
          : toast,
      ),
    );

    if (tone && tone !== 'loading') {
      scheduleDismiss(id, duration);
    }
  };

  const toastPromise = async (promiseFactory, messages, options = {}) => {
    const startedAt = Date.now();
    const id = show({
      tone: 'loading',
      title: messages.loading,
      description: messages.loadingDescription,
    });

    try {
      const result = await promiseFactory();
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max((options.minLoadingDuration || MIN_LOADING_DURATION) - elapsed, 0);

      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }

      update(id, {
        tone: 'success',
        title: typeof messages.success === 'function' ? messages.success(result) : messages.success,
        description: messages.successDescription,
        duration: options.successDuration || DEFAULT_DURATION,
      });

      return result;
    } catch (error) {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max((options.minLoadingDuration || MIN_LOADING_DURATION) - elapsed, 0);

      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }

      update(id, {
        tone: 'error',
        title: typeof messages.error === 'function' ? messages.error(error) : messages.error || 'Action failed',
        description: messages.errorDescription || error.message,
        duration: options.errorDuration || 3200,
      });

      throw error;
    }
  };

  return (
    <ToastContext.Provider value={{ show, update, dismiss, toastPromise }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }) {
  const Icon = getToastIcon(toast.tone);
  const toneClass =
    toast.tone === 'success'
      ? 'border-finance-teal/25'
      : toast.tone === 'error'
        ? 'border-finance-red/20'
        : 'border-finance-charcoal/10';
  const iconClass =
    toast.tone === 'success' ? 'text-finance-teal' : toast.tone === 'error' ? 'text-finance-red' : 'text-finance-charcoal';
  const accentClass =
    toast.tone === 'success'
      ? 'bg-finance-teal'
      : toast.tone === 'error'
        ? 'bg-finance-red'
        : 'bg-finance-charcoal';

  return (
    <div className={`overlay-panel pointer-events-auto relative overflow-hidden ${toneClass}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${accentClass}`} />
      <div className="flex items-start gap-3 px-4 py-3.5 pl-5">
        <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-finance-paper/90 ${iconClass}`}>
          <Icon size={18} className={toast.tone === 'loading' ? 'animate-spin' : ''} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-finance-text">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-sm leading-5 text-finance-muted">{toast.description}</p> : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
          className="grid h-9 w-9 place-items-center rounded-xl text-finance-muted transition hover:bg-finance-paper/70 hover:text-finance-text"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
