import { useCallback, useEffect, useRef, useState } from 'react';
import { CloudSun, Droplets, RefreshCw, Umbrella, Wind } from 'lucide-react';
import { fetchHkoWeather, iconUrl, type WeatherReport } from './weather.ts';

export function useHkoWeather() {
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasReport = useRef(false);
  const lastFetch = useRef(0);

  const load = useCallback(async (force = false) => {
    if (!force && Date.now() - lastFetch.current < 2 * 60 * 1000) return;
    setLoading(true);
    try {
      const next = await fetchHkoWeather();
      hasReport.current = true;
      lastFetch.current = Date.now();
      setReport(next);
      setError(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '暫時連唔到香港天文台。';
      setError(hasReport.current ? '更新失敗，下面仍然係上一次嘅資料。' : message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => void load(true), 10 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load(false);
    };
    const start = window.setTimeout(() => void load(true), 0);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  return { report, error, loading, reload: () => load(true) };
}

function tipClass(severity: WeatherReport['severity']): string {
  if (severity === 'stop') return 'border-[var(--rose-line)] bg-[var(--rose-bg)] text-[var(--rose-text)]';
  if (severity === 'caution') return 'border-[var(--amber-line)] bg-[var(--amber-bg)] text-[var(--amber-text)]';
  return 'border-[var(--line)] bg-[var(--chip)] text-[var(--text)]';
}

export function WeatherBanner({ report }: { report: WeatherReport | null }) {
  if (!report || report.severity === 'ok') return null;
  return (
    <div className={`rounded-2xl border-[length:var(--bw)] p-3 text-xs leading-relaxed ${tipClass(report.severity)}`}>
      <p className="font-bold">{report.warnings.map((warning) => warning.name).join('、')}</p>
      <p className="mt-1">{report.tip}</p>
    </div>
  );
}

export function WeatherCard({
  report,
  error,
  loading,
  onRefresh,
}: {
  report: WeatherReport | null;
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <section
      aria-label="香港天文台即時天氣"
      className="rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-3.5 shadow-[var(--shadow)]"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold">
          <CloudSun className="h-4 w-4 text-[var(--accent)]" />
          天文台即時
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1 text-xs font-bold text-[var(--accent-soft-text)]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          更新
        </button>
      </div>

      {!report && loading && <p className="mt-3 text-xs text-[var(--muted)]">正在讀取香港天文台資料…</p>}
      {!report && error && <p className="mt-3 text-xs leading-relaxed text-[var(--rose-text)]">{error}</p>}

      {report && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            {report.icon !== undefined && (
              <img
                src={iconUrl(report.icon)}
                alt=""
                className="h-12 w-12 rounded-xl bg-white p-1"
              />
            )}
            <div>
              <p className="text-sm font-bold">{report.iconLabel ?? '最新天氣'}</p>
              <p className="text-[11px] text-[var(--muted)]">
                {report.observedAt ? `觀測 ${report.observedAt}` : '香港天文台'}
                {report.ridgeTemp ? ` · 荃灣可觀 ${report.ridgeTemp.value}°C` : ''}
              </p>
            </div>
            {report.ridgeTemp && <p className="ml-auto text-3xl font-bold">{report.ridgeTemp.value}°</p>}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[var(--chip)] px-2 py-2">
              <Droplets className="mx-auto h-4 w-4 text-[var(--accent)]" />
              <p className="mt-1 text-sm font-bold">{report.humidity !== undefined ? `${report.humidity}%` : '—'}</p>
              <p className="text-[10px] text-[var(--muted)]">濕度</p>
            </div>
            <div className="rounded-xl bg-[var(--chip)] px-2 py-2">
              <Umbrella className="mx-auto h-4 w-4 text-[var(--accent)]" />
              <p className="mt-1 text-sm font-bold">{report.tsuenWanRain !== undefined ? `${report.tsuenWanRain} mm` : '—'}</p>
              <p className="text-[10px] text-[var(--muted)]">荃灣雨量</p>
            </div>
            <div className="rounded-xl bg-[var(--chip)] px-2 py-2">
              <CloudSun className="mx-auto h-4 w-4 text-[var(--accent)]" />
              <p className="mt-1 text-sm font-bold">{report.uv ? report.uv.desc : '—'}</p>
              <p className="text-[10px] text-[var(--muted)]">{report.uv ? `紫外線 ${report.uv.value}` : '紫外線'}</p>
            </div>
          </div>

          {report.valleyTemp && (
            <p className="text-[11px] text-[var(--muted)]">
              荃灣城門谷 {report.valleyTemp.value}°C。可觀站較近山上，城門谷係荃灣市內。
            </p>
          )}

          {(report.todayText || report.todayWind) && (
            <div className="space-y-1 text-xs leading-relaxed">
              <p className="font-bold">今日預測</p>
              {report.generalSituation && <p className="text-[var(--muted)]">{report.generalSituation}</p>}
              {report.todayText && <p>{report.todayText}</p>}
              <p className="flex items-start gap-1.5 text-[var(--muted)]">
                <Wind className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {[report.todayRange, report.todayWind].filter(Boolean).join(' · ')}
                </span>
              </p>
            </div>
          )}

          {report.warnings.length > 0 && (
            <ul className="space-y-1 text-xs font-bold">
              {report.warnings.map((warning) => (
                <li key={warning.key}>{warning.name}</li>
              ))}
            </ul>
          )}

          <div className={`rounded-xl border-[length:var(--bw)] p-3 text-xs leading-relaxed ${tipClass(report.severity)}`}>
            {report.tip}
          </div>
          {error && <p className="text-[11px] text-[var(--rose-text)]">{error}</p>}
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
        資料來源：
        <a href="https://www.hko.gov.hk/tc/wxinfo/currwx/current.htm" target="_blank" rel="noopener noreferrer" className="underline">
          香港天文台
        </a>
        。每 10 分鐘自動更新，山上訊號差就撳「更新」。
      </p>
    </section>
  );
}
