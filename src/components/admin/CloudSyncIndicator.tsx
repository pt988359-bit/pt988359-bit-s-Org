/**
 * CloudSyncIndicator — Visible admin badge for records waiting to reach the cloud.
 *
 * Renders nothing when everything is synced. When the Cloud Sync Outbox has
 * pending entries, a small amber chip appears showing the count with a
 * "retry now" button, so failed cloud saves are never silent again.
 */

import React, { useEffect, useState } from 'react';
import { subscribeToPendingSync, flushOutbox, initCloudSyncOutbox } from '../../core/storage/CloudSyncOutbox';

export const CloudSyncIndicator: React.FC = () => {
  const [pending, setPending] = useState<number>(0);
  const [retrying, setRetrying] = useState<boolean>(false);

  useEffect(() => {
    initCloudSyncOutbox();
    const unsubscribe = subscribeToPendingSync((count) => setPending(count));
    return () => {
      unsubscribe();
    };
  }, []);

  if (pending <= 0) return null;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await flushOutbox();
    } catch {}
    setRetrying(false);
  };

  return (
    <div
      className="fixed bottom-3 left-3 z-[9998] flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs text-amber-200 shadow-lg backdrop-blur"
      title="سجلات لم تصل للسحابة بعد — سيتم إرسالها تلقائيًا"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
      </span>
      <span>
        {pending} سجل بانتظار المزامنة السحابية
      </span>
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-100 transition hover:bg-amber-400/35 disabled:opacity-50"
      >
        {retrying ? 'جارٍ الإرسال…' : 'إعادة المحاولة'}
      </button>
    </div>
  );
};

export default CloudSyncIndicator;
