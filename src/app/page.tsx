'use client';

import { DropZone } from '@/components/DropZone';
import { useTransferStore } from '@/store/transfer';
import { SignalApi } from '@/lib/signal-api';
import { formatBytes } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, ShieldCheck, Globe, Lock, Cloud, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const { file, manifest } = useTransferStore();
  const [creating, setCreating] = useState(false);

  const createRoom = async () => {
    if (!file || !manifest) return;
    setCreating(true);
    try {
      const { roomId } = await SignalApi.createRoom();
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create room. Check console.');
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-16">

      {/* Header */}
      <div className="text-center mb-10 space-y-4 px-4">
        <h1 className="text-5xl md:text-7xl font-semibold text-slate-900 tracking-[-0.02em]">
          iCloud <span className="text-blue-500">Drop</span>
        </h1>
        <p className="text-[17px] md:text-xl text-slate-500 max-w-xl mx-auto font-light tracking-wide leading-relaxed">
          Secure, direct peer-to-peer file transfer. No servers, no limits.
          Works natively across your devices.
        </p>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-[640px] glass-panel p-2 sm:p-2 rounded-[36px] mx-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="bg-white/90 p-6 sm:p-8 rounded-[28px] shadow-sm">
          <DropZone />

          {file && manifest && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between mx-auto max-w-md transition-all">
                <div className="text-left flex-1 min-w-0 pr-4">
                  <p className="text-[15px] font-semibold text-slate-900 truncate">{file.name}</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">{formatBytes(file.size)}</p>
                </div>
                <div className="h-10 w-10 bg-green-50/80 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>

              <Button
                onClick={createRoom}
                disabled={creating}
                size="lg"
                className="w-full sm:w-auto min-w-[200px] h-12 text-[15px] rounded-full shadow-md shadow-blue-500/10 bg-blue-500 hover:bg-blue-600 font-medium transition-all"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {creating ? 'Preparing...' : 'Start Transfer'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Features */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 text-center max-w-4xl px-4 w-full">
        <div className="flex flex-col items-center">
          <Globe className="w-8 h-8 text-blue-500 mb-4 stroke-[1.5]" />
          <h3 className="font-medium text-[17px] text-slate-900 mb-2">Direct P2P</h3>
          <p className="text-[15px] text-slate-500 leading-relaxed font-light">Data flows directly between devices without intermediate servers.</p>
        </div>
        <div className="flex flex-col items-center">
          <Lock className="w-8 h-8 text-slate-700 mb-4 stroke-[1.5]" />
          <h3 className="font-medium text-[17px] text-slate-900 mb-2">Encrypted</h3>
          <p className="text-[15px] text-slate-500 leading-relaxed font-light">Industry-standard encryption ensures your files remain private.</p>
        </div>
        <div className="flex flex-col items-center">
          <ShieldCheck className="w-8 h-8 text-green-500 mb-4 stroke-[1.5]" />
          <h3 className="font-medium text-[17px] text-slate-900 mb-2">Verified</h3>
          <p className="text-[15px] text-slate-500 leading-relaxed font-light">Automatic checksums guarantee files are delivered perfectly.</p>
        </div>
      </div>
    </div>
  );
}
