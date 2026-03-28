import { BarChart3, Home, PlusSquare } from "lucide-react";

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-20 rounded-3xl border border-white/70 bg-white/90 shadow-lg backdrop-blur-xl sm:hidden">
      <div className="mx-auto max-w-md">
        <div className="flex h-16 items-center justify-around">
          <a href="#feed" className="flex flex-col items-center text-slate-900">
            <Home className="h-6 w-6" />
            <span className="text-xs">Feed</span>
          </a>
          <a href="/submit" className="flex flex-col items-center text-slate-500 hover:text-slate-900">
            <PlusSquare className="h-6 w-6" />
            <span className="text-xs">Post</span>
          </a>
          <a href="#feed" className="flex flex-col items-center text-slate-500 hover:text-slate-900">
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs">Top</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
