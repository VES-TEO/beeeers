import { Trophy, Home, Skull, User } from "lucide-react";
import type { Tab } from "@/components/App";

const items: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "classifica", label: "Classifica", icon: Trophy },
  { id: "feed", label: "Diario", icon: Home },
  { id: "hof", label: "Hall of Fame", icon: Skull },
  { id: "profilo", label: "Profilo", icon: User },
];

export function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-bg-elev border-t border-border flex justify-around pt-[9px] pb-3 z-20">
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="bg-transparent border-none flex flex-col items-center gap-[3px] flex-1">
            <Icon size={20} color={active ? "var(--amber)" : "var(--text-dim)"} strokeWidth={active ? 2.4 : 2} />
            <span className={`text-[10.5px] font-sans ${active ? "font-bold text-amber" : "font-medium text-text-dim"}`}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
