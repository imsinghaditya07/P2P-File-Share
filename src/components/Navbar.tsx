import Link from "next/link";
import { Github, Zap } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">
                        Share<span className="text-blue-600">Files</span>
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="https://github.com" target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 rounded-full border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm">
                            <Github className="h-4 w-4" />
                            <span>Star on GitHub</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="sm:hidden text-slate-600">
                            <Github className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
