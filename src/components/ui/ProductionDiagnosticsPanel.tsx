import React, { useState, useEffect } from 'react';
import { firebaseConfig } from '../../firebase/config';
import { firestoreHealthManager } from '../../firebase/FirestoreHealthManager';
import { useShowroom } from '../../context/ShowroomContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { db } from '../../firebase/firestore';
import { collection, getDocsFromServer, getDoc, doc } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../../core/config/FirestoreConfig';
import { Terminal, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp, ShieldAlert, Cpu } from 'lucide-react';

export const ProductionDiagnosticsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [forceVisible, setForceVisible] = useState<boolean>(false);
  const { products, isLoadingProducts } = useShowroom();
  const { firebaseUser, customer, isAuthLoading } = useCustomerAuth();

  const [testLog, setTestLog] = useState<string[]>([]);
  const [isTestingDocs, setIsTestingDocs] = useState<boolean>(false);
  const [lastTestDurationMs, setLastTestDurationMs] = useState<number | null>(null);
  const [lastDocTestSuccess, setLastDocTestSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const showDiag = urlParams.get('diagnostics') === '1' || localStorage.getItem('proteck_diagnostics') === 'true';
      if (showDiag) {
        setForceVisible(true);
        setIsOpen(true);
      }
    }
  }, []);

  const healthState = firestoreHealthManager.getState();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'SSR';

  const runLiveFirestoreTest = async () => {
    setIsTestingDocs(true);
    const log: string[] = [];
    log.push(`[${new Date().toLocaleTimeString()}] Starting live getDocsFromServer test...`);
    const startMs = performance.now();

    try {
      const colRef = collection(db, FIRESTORE_COLLECTIONS.PRODUCTS);
      const snap = await getDocsFromServer(colRef);
      const elapsed = Math.round(performance.now() - startMs);
      setLastTestDurationMs(elapsed);
      setLastDocTestSuccess(true);
      log.push(`[SUCCESS] getDocsFromServer returned ${snap.docs.length} docs in ${elapsed} ms.`);

      // Test single doc read
      const singleDocRef = doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, 'prod_01_ref_2026');
      const singleSnap = await getDoc(singleDocRef);
      log.push(`[SUCCESS] Single doc test prod_01_ref_2026 exists=${singleSnap.exists()}`);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startMs);
      setLastTestDurationMs(elapsed);
      setLastDocTestSuccess(false);
      log.push(`[ERROR] Firestore test failed in ${elapsed} ms: ${err?.code || ''} - ${err?.message || String(err)}`);
    } finally {
      setIsTestingDocs(false);
      setTestLog((prev) => [...log, ...prev].slice(0, 30));
    }
  };

  if (!forceVisible && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('diagnostics') !== '1' && localStorage.getItem('proteck_diagnostics') !== 'true') {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-[99999] font-mono text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-emerald-500/50 shadow-2xl px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer font-bold transition-all"
        >
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>لوحة تشخيص الإنتاج (Diagnostics)</span>
        </button>
      ) : (
        <div className="bg-slate-950 text-slate-200 border-2 border-emerald-500/60 rounded-2xl shadow-2xl p-4 w-[92vw] max-w-lg max-h-[85vh] overflow-y-auto space-y-3.5 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">PROTECK PRODUCTION DIAGNOSTICS</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 hover:bg-slate-800 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Environment & Firebase Config */}
          <div className="space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px]">
            <div className="text-emerald-400 font-bold mb-1">=== ENVIRONMENT & FIREBASE CONFIG ===</div>
            <div><span className="text-slate-500">Origin:</span> <span className="text-amber-300">{currentOrigin}</span></div>
            <div><span className="text-slate-500">Project ID:</span> <span className="text-white">{firebaseConfig.projectId}</span></div>
            <div><span className="text-slate-500">Firestore DB:</span> <span className="text-white">{firebaseConfig.firestoreDatabaseId}</span></div>
            <div><span className="text-slate-500">Auth Domain:</span> <span className="text-white">{firebaseConfig.authDomain}</span></div>
            <div><span className="text-slate-500">API Key Prefix:</span> <span className="text-white">{firebaseConfig.apiKey?.slice(0, 10)}...</span></div>
          </div>

          {/* Firestore Status */}
          <div className="space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px]">
            <div className="text-emerald-400 font-bold mb-1 flex items-center justify-between">
              <span>=== FIRESTORE STATUS & PRODUCTS ===</span>
              {isLoadingProducts ? (
                <span className="text-amber-400 animate-pulse">جاري التحميل...</span>
              ) : (
                <span className="text-emerald-400">جاهز</span>
              )}
            </div>
            <div>
              <span className="text-slate-500">Products Count:</span>{' '}
              <span className="text-emerald-300 font-bold">{products.length} أجهزة</span>
            </div>
            <div>
              <span className="text-slate-500">Health Status:</span>{' '}
              <span className={healthState.status === 'online' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {healthState.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Fallback To Local:</span>{' '}
              <span className={healthState.isFallbackToLocal ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {String(healthState.isFallbackToLocal)}
              </span>
            </div>
            {healthState.lastError && (
              <div className="text-rose-400 text-[10px] break-words">
                Last Error: {healthState.lastError.message}
              </div>
            )}
          </div>

          {/* Auth Status */}
          <div className="space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px]">
            <div className="text-emerald-400 font-bold mb-1">=== CUSTOMER AUTH STATUS ===</div>
            <div>
              <span className="text-slate-500">Auth Initializing:</span>{' '}
              <span className="text-white">{String(isAuthLoading)}</span>
            </div>
            <div>
              <span className="text-slate-500">Firebase User:</span>{' '}
              <span className="text-sky-300">{firebaseUser ? firebaseUser.email || firebaseUser.uid : 'None'}</span>
            </div>
            <div>
              <span className="text-slate-500">Customer Profile:</span>{' '}
              <span className="text-sky-300">{customer ? customer.name : 'None'}</span>
            </div>
          </div>

          {/* Interactive Live Tests */}
          <div className="space-y-2 pt-1">
            <button
              onClick={runLiveFirestoreTest}
              disabled={isTestingDocs}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingDocs ? 'animate-spin' : ''}`} />
              <span>اختبر الاتصال بالموديل getDocsFromServer المباشر</span>
            </button>

            {lastTestDurationMs !== null && (
              <div className="flex items-center gap-2 text-[11px] px-2">
                {lastDocTestSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>زمن الاستجابة المباشر: {lastTestDurationMs} ms</span>
              </div>
            )}
          </div>

          {/* Diagnostic Console Log Output */}
          {testLog.length > 0 && (
            <div className="bg-black/90 p-2.5 rounded-xl border border-slate-800 max-h-36 overflow-y-auto space-y-1 text-[10px]">
              <div className="text-slate-500 font-bold">=== DIAGNOSTIC LOGS ===</div>
              {testLog.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('[ERROR]')
                      ? 'text-rose-400 break-words'
                      : log.includes('[SUCCESS]')
                      ? 'text-emerald-400 break-words'
                      : 'text-slate-300 break-words'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Footer Close / Clear Diagnostics */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800">
            <span>To hide: remove ?diagnostics=1</span>
            <button
              onClick={() => {
                localStorage.removeItem('proteck_diagnostics');
                setForceVisible(false);
                setIsOpen(false);
              }}
              className="text-rose-400 hover:underline cursor-pointer"
            >
              إغلاق وحذف التشخيص
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
