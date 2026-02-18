'use client';

import { DropZone } from '@/components/DropZone';
import { useTransferStore } from '@/store/transfer';
import { SignalApi } from '@/lib/signal-api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, ShieldCheck, Zap, Globe, Lock } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-10">

      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Zap className="w-3 h-3 fill-current" />
          Vercel P2P Share
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Share Files <span className="text-blue-600">Instantly</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Secure, direct peer-to-peer file transfer. No servers, no limits.
          Works on your local network or across the internet.
        </p>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-2xl bg-white/50 backdrop-blur-sm p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white">
        <DropZone />

        {file && manifest && (
          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between mx-auto max-w-md">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • {manifest.totalChunks} chunks</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>

            <Button
              onClick={createRoom}
              disabled={creating}
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-14 text-lg rounded-full shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700"
            >
              {creating && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              {creating ? 'Creating Room...' : 'Start Transfer'}
            </Button>
          </div>
        )}
      </div>

      {/* Footer Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl px-4">
        <div className="p-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Direct P2P</h3>
          <p className="text-sm text-slate-500">Data flows directly between devices. No intermediate servers.</p>
        </div>
        <div className="p-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-600">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">End-to-End Encrypted</h3>
          <p className="text-sm text-slate-500">DTLS encryption ensures your files remain private and secure.</p>
        </div>
        <div className="p-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-green-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Integrity Verified</h3>
          <p className="text-sm text-slate-500">Automatic SHA-256 checksums guarantee file didn&apos;t change.</p>
        </div>
      </div>

      {/* Version Footer */}
      <div className="mt-12 text-center pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/50 text-slate-400 text-xs font-medium border border-slate-100">
          <ShieldCheck className="w-3 h-3" />
          <span>Secure P2P Encrypted • v0.1.0</span>
        </div>
      </div>
    </div>
  );
}
