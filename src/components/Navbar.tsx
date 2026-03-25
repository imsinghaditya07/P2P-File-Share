import Link from "next/link";
import { Cloud, Github } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/50 transition-all duration-300">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-[52px] items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                    <Cloud className="h-6 w-6 text-blue-500 fill-blue-500/10 stroke-[1.5]" />
                    <span className="font-semibold text-[17px] tracking-tight text-slate-900 font-sans">
                        iCloud Drop
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="https://github.com/imsinghaditya07/P2P-File-Share" target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-black/5 font-medium transition-colors">
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="sm:hidden text-slate-600 hover:bg-black/5 rounded-full">
                            <Github className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
