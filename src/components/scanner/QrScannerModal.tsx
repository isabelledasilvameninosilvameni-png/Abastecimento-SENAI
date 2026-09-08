import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Camera, Check, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  expectedType?: 'MATERIAL' | 'POSTO' | 'LOTE' | 'ANY';
  expectedCode?: string;
  title?: string;
  hint?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  expectedType = 'ANY',
  expectedCode,
  title = "Leitor de QR Code & Código de Barras",
  hint = "Aponte a câmera para a etiqueta física do material, lote ou posto de trabalho."
}) => {
  const [manualCode, setManualCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setManualCode('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } else {
        setCameraError("Câmera não suportada neste dispositivo. Utilize a entrada manual ou os atalhos de bipagem.");
      }
    } catch (err) {
      console.warn("Camera access not available or blocked in preview iframe:", err);
      setCameraError("Permissão de câmera não concedida ou dispositivo em iframe. Você pode usar a entrada manual ou os botões de simulação de bip.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleProcessCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsValidating(true);
    setScanResult(trimmed);

    // Audio bip feedback
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio context may be restricted
    }

    setTimeout(() => {
      setIsValidating(false);
      onScanSuccess(trimmed);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        id="qr-scanner-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">{title}</h3>
              <p className="text-xs text-slate-300">{hint}</p>
            </div>
          </div>
          <button
            id="close-scanner-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-black flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
          {isCameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <Camera className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-xs max-w-xs text-slate-300">{cameraError || "Inicializando sensor óptico..."}</p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-3 text-xs flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar Câmera Novamente
              </button>
            </div>
          )}

          {/* Aiming Crosshair / Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-dashed border-blue-400/80 rounded-xl relative flex items-center justify-center">
              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-md" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-md" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-md" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-md" />

              {/* Animated Laser Scanning Line */}
              <div className="absolute w-full h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-bounce" />

              {isValidating && (
                <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center rounded-xl backdrop-blur-xs">
                  <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-lg">
                    <Check className="w-4 h-4" />
                    CÓDIGO RECONHECIDO!
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
            <span className="text-[11px] bg-black/70 text-slate-200 px-2.5 py-1 rounded-full border border-white/10">
              Padrão suportado: QR Code, Code 128, DataMatrix GS1
            </span>
          </div>
        </div>

        {/* Quick Simulation Shortcuts (Crucial for Factory Testing & Coletor Emulation) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Simular Gatilho de Leitor Óptico / Coletor Zebra:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {expectedCode ? (
              <button
                type="button"
                id="quick-scan-expected"
                onClick={() => handleProcessCode(expectedCode)}
                className="col-span-2 sm:col-span-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg text-center transition-colors shadow-xs"
              >
                Bipar Alvo: {expectedCode}
              </button>
            ) : null}
            <button
              type="button"
              id="quick-scan-mat"
              onClick={() => handleProcessCode('MAT-4029|LOT-2026-F88')}
              className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-300 transition-colors text-left truncate"
            >
              Bipar Material: MAT-4029
            </button>
            <button
              type="button"
              id="quick-scan-posto"
              onClick={() => handleProcessCode('LOC-L1-P02')}
              className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-300 transition-colors text-left truncate"
            >
              Bipar Posto: LOC-L1-P02
            </button>
            <button
              type="button"
              id="quick-scan-loc"
              onClick={() => handleProcessCode('ALM-A-03-P02-N1')}
              className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-300 transition-colors text-left truncate"
            >
              Bipar Endereço: Almox. A-03
            </button>
          </div>
        </div>

        {/* Fallback Manual Input (RN-QR-01) */}
        <div className="p-4 bg-white">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Digitação Manual de Contingência (Regra RN-QR-01)</span>
            {scanResult && <span className="text-emerald-600 font-bold text-[11px]">Última leitura: {scanResult}</span>}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="manual-code-input"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProcessCode(manualCode);
              }}
              placeholder="Ex: MAT-4029 ou LOC-L1-P02"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              id="submit-manual-code-btn"
              onClick={() => handleProcessCode(manualCode)}
              disabled={!manualCode.trim() || isValidating}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Confirmar Código
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
