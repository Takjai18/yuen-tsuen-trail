import { useMemo, useState } from 'react';
import { Sunset } from 'lucide-react';
import { CHECKPOINTS } from './trail.ts';
import {
  SUNSET_PLACES,
  hkDateValue,
  hkParts,
  hkTimeValue,
  judgeSunset,
  type VerdictId,
} from './sunset.ts';

const TONE: Record<VerdictId, string> = {
  see: 'border-[var(--teal-line)] bg-[var(--teal-bg)] text-[var(--teal-text)]',
  tight: 'border-[var(--amber-line)] bg-[var(--amber-bg)] text-[var(--amber-text)]',
  glow: 'border-[var(--sky-line)] bg-[var(--sky-bg)] text-[var(--sky-text)]',
  miss: 'border-[var(--rose-line)] bg-[var(--rose-bg)] text-[var(--rose-text)]',
};

const fieldClass =
  'w-full rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] px-3 py-2 text-sm text-[var(--text)]';

export function SunsetPanel() {
  const initial = hkParts();
  const [dateValue, setDateValue] = useState(() => hkDateValue(initial));
  const [timeValue, setTimeValue] = useState(() => hkTimeValue(initial));
  const [placeId, setPlaceId] = useState(1);

  const verdict = useMemo(() => {
    const [year, month, day] = dateValue.split('-').map(Number);
    const [hour, minute] = timeValue.split(':').map(Number);
    const place = CHECKPOINTS.find((item) => item.id === placeId);
    if (!place || !year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return judgeSunset({
      checkpointId: place.id,
      lat: place.lat,
      lng: place.lng,
      year,
      month,
      day,
      hour,
      minute,
    });
  }, [dateValue, timeValue, placeId]);

  const useNow = () => {
    const now = hkParts();
    setDateValue(hkDateValue(now));
    setTimeValue(hkTimeValue(now));
  };

  const until =
    verdict == null
      ? ''
      : verdict.minutesUntilSunset >= 0
        ? `距離日落仲有 ${verdict.minutesUntilSunset} 分鐘`
        : `日落已經過咗 ${-verdict.minutesUntilSunset} 分鐘`;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Sunset className="h-5 w-5 text-[var(--profile-steep)]" />
          日落計算器
        </h2>
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          揀我哋而家嘅時間同身處邊個站，計下趕唔趕得切去望到日落。三橋嗰張相只係石龍拱涼亭同觀景台。沿住條徑，日落鐘點差唔到一分鐘。
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-bold">
            日期
            <input
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className={`${fieldClass} mt-1`}
            />
          </label>
          <label className="block text-xs font-bold">
            時間
            <input
              type="time"
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
              className={`${fieldClass} mt-1`}
            />
          </label>
        </div>
        <label className="block text-xs font-bold">
          身處位置
          <select
            value={placeId}
            onChange={(event) => setPlaceId(Number(event.target.value))}
            className={`${fieldClass} mt-1`}
          >
            {SUNSET_PLACES.map((place) => (
              <option key={place.id} value={place.id}>
                {place.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={useNow}
          className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-bold text-[var(--accent-text)]"
        >
          用而家時間
        </button>
      </div>

      {verdict && (
        <div className={`space-y-2 rounded-2xl border-[length:var(--bw)] p-4 ${TONE[verdict.id]}`} aria-live="polite">
          <div className="text-2xl font-black">{verdict.title}</div>
          <p className="text-sm font-bold">
            日落 {verdict.sunsetLabel}
            <span className="ml-2 font-medium">｜{until}</span>
          </p>
          {verdict.walkMinutes != null && verdict.walkTarget && (
            <p className="text-sm font-bold">
              慢行去{verdict.walkTarget}約 {verdict.walkMinutes} 分鐘
            </p>
          )}
          <p className="text-xs leading-relaxed">{verdict.detail}</p>
          <p className="text-xs leading-relaxed opacity-80">
            晴空天文估算，同天文台公布通常差一兩分鐘。山脊同雲會擋到個太陽，可能早幾分鐘冇晒。行山用慢行時間計，唔好當跑到。
          </p>
        </div>
      )}
    </div>
  );
}
