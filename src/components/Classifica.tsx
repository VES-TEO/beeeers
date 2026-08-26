import { Trophy } from "lucide-react";
import { Avatar } from "./Avatar";
import { fmtInt } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export interface LeaderboardRow {
  profile: Profile;
  points: number;
  count: number;
}

const medals = ["🥇", "🥈", "🥉"];

export function Classifica({
  leaderboard,
  years,
  year,
  setYear,
  myProfileId,
  streakMap,
  warmMap,
}: {
  leaderboard: LeaderboardRow[];
  years: number[];
  year: number;
  setYear: (y: number) => void;
  myProfileId: string;
  streakMap: Record<string, number>;
  warmMap: Record<string, boolean>;
}) {
  return (
    <div>
      <div className="flex gap-1.5 mb-3">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`border rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold font-sans ${
              y === year ? "bg-amber text-[#12100B] border-amber" : "bg-bg-elev text-text-dim border-border"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {leaderboard.every((l) => l.points === 0) ? (
        <div className="bg-bg-elev border border-dashed border-border rounded-2xl px-4 py-[30px] flex flex-col items-center">
          <Trophy size={30} color="var(--amber)" />
          <div className="mt-2 font-sans text-[13.5px] text-text-dim text-center">
            Nessuna birra registrata nel {year}.
            <br />
            Chi rompe il ghiaccio?
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-[9px]">
          {leaderboard.map((row, i) => {
            const onFire = (streakMap[row.profile.id] || 0) >= 2;
            const isWarm = !!warmMap[row.profile.id];
            return (
              <div
                key={row.profile.id}
                className="flex items-center gap-3 border rounded-2xl px-3.5 py-[11px]"
                style={{
                  background:
                    i === 0 && row.points > 0
                      ? "linear-gradient(120deg, rgba(255,201,60,0.14) 0%, rgba(255,166,48,0.05) 100%)"
                      : "var(--bg-elev)",
                  borderColor: row.profile.id === myProfileId ? "var(--amber)" : "var(--border)",
                  borderWidth: row.profile.id === myProfileId ? 1.5 : 1,
                  boxShadow: row.profile.id === myProfileId ? "0 0 0 1px rgba(255,201,60,0.15)" : undefined,
                }}
              >
                <div className="w-[30px] text-center text-base font-baloo font-bold text-text-dim">
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>
                <Avatar profile={row.profile} size={42} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-bold font-sans text-text flex items-center">
                    {row.profile.name}
                    {onFire && (
                      <span className="ml-1.5 text-xs" title={`In streak da ${streakMap[row.profile.id]} giorni`}>
                        🍺🔥
                      </span>
                    )}
                    {isWarm && (
                      <span
                        title="Ha bevuto una birra calda oggi — punti doppi"
                        className="inline-flex items-center justify-center ml-1.5 w-4 h-[13px] rounded-[3px] bg-[#3A3742] border border-[rgba(255,166,48,0.6)]"
                        style={{ animation: "microwaveGlow 1.4s ease-in-out infinite" }}
                      >
                        <span className="text-[8px] inline-block" style={{ animation: "beerSpin 1.8s linear infinite" }}>
                          🍺
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] text-text-dim mt-0.5">
                    {row.count} {row.count === 1 ? "birra" : "birre"}
                  </div>
                </div>
                <div className="font-baloo font-extrabold text-lg text-amber">
                  {fmtInt(row.points)}
                  <span className="text-[11px] font-semibold ml-[3px] text-text-dim">pt</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
