import { useState, type MouseEvent } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Camera,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Compass,
  Contrast,
  ExternalLink,
  Footprints,
  Moon,
  Mountain,
  Navigation,
  PhoneCall,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sun,
  Sunset,
  Utensils,
} from 'lucide-react';
import { EatsPanel } from './EatsPanel.tsx';
import { ElevationProfile, RouteSketch } from './RouteVisuals.tsx';
import { SunsetPanel } from './SunsetPanel.tsx';
import { WeatherBanner, WeatherCard, useHkoWeather } from './WeatherCard.tsx';
import {
  CHECKPOINTS,
  INITIAL_CHECKLIST,
  STORAGE_KEYS,
  mapsUrl,
  type RouteMode,
  type ThemeName,
} from './trail.ts';

const THEMES: { id: ThemeName; label: string; Icon: typeof Sun }[] = [
  { id: 'day', label: '日間', Icon: Sun },
  { id: 'sun', label: '陽光', Icon: Contrast },
  { id: 'dark', label: '深色', Icon: Moon },
];

function readTheme(): ThemeName {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === 'day' || saved === 'sun' || saved === 'dark') return saved;
  return 'day';
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function focusStep(id: number) {
  requestAnimationFrame(() => {
    document.getElementById(`cp-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'guide' | 'photo' | 'sunset' | 'food' | 'prep'>('guide');
  const [routeMode, setRouteMode] = useState<RouteMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.mode);
    return saved === 'A' || saved === 'B' ? saved : 'B';
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => readJson<number[]>(STORAGE_KEYS.steps, []));
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [checkedItems, setCheckedItems] = useState<string[]>(() => readJson<string[]>(STORAGE_KEYS.checks, []));
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [theme, setTheme] = useState<ThemeName>(readTheme);
  const weather = useHkoWeather();

  const applyTheme = (next: ThemeName) => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEYS.theme, next);
  };

  const openCheckpoint = (id: number) => {
    const checkpoint = CHECKPOINTS.find((item) => item.id === id);
    if (checkpoint?.onlyInMode === 'B' && routeMode === 'A') {
      setRouteMode('B');
      localStorage.setItem(STORAGE_KEYS.mode, 'B');
    }
    setExpandedStep(id);
    setActiveTab('guide');
    focusStep(id);
  };

  const toggleStepComplete = (id: number, event: MouseEvent) => {
    event.stopPropagation();
    const updated = completedSteps.includes(id)
      ? completedSteps.filter((item) => item !== id)
      : [...completedSteps, id];
    setCompletedSteps(updated);
    localStorage.setItem(STORAGE_KEYS.steps, JSON.stringify(updated));

    if (!completedSteps.includes(id)) {
      const visible = CHECKPOINTS.filter((cp) => !cp.onlyInMode || cp.onlyInMode === routeMode);
      const currentIndex = visible.findIndex((cp) => cp.id === id);
      if (currentIndex !== -1 && currentIndex + 1 < visible.length) {
        const nextId = visible[currentIndex + 1].id;
        setExpandedStep(nextId);
        focusStep(nextId);
      }
    }
  };

  const handleModeChange = (mode: RouteMode) => {
    setRouteMode(mode);
    localStorage.setItem(STORAGE_KEYS.mode, mode);
    if (mode === 'A' && expandedStep !== null && expandedStep > 3) setExpandedStep(3);
  };

  const toggleChecklist = (id: string) => {
    const updated = checkedItems.includes(id)
      ? checkedItems.filter((item) => item !== id)
      : [...checkedItems, id];
    setCheckedItems(updated);
    localStorage.setItem(STORAGE_KEYS.checks, JSON.stringify(updated));
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    setExpandedStep(1);
    localStorage.removeItem(STORAGE_KEYS.steps);
  };

  const visibleCheckpoints = CHECKPOINTS.filter((cp) => !cp.onlyInMode || cp.onlyInMode === routeMode);
  const completedVisibleCount = visibleCheckpoints.filter((cp) => completedSteps.includes(cp.id)).length;
  const progressPercentage = Math.round((completedVisibleCount / visibleCheckpoints.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 text-[var(--text)] selection:bg-emerald-200">
      <header className="app-header sticky top-0 z-30 px-4 pb-5 pt-6 shadow-md">
        <div className="mx-auto max-w-md">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--header-text)_30%,transparent)] bg-[var(--header-soft)] px-2.5 py-0.5 text-xs font-medium">
                <Mountain className="h-3.5 w-3.5" /> 新手安心導航版
              </span>
              <h1 className="text-xl font-bold tracking-tight">元荃古道：石龍拱 ➔ 深井</h1>
              <p className="mt-0.5 text-xs opacity-90">三橋海景・大草地打卡・深井美食路線</p>
            </div>
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-stone-950 shadow-sm transition active:scale-95"
            >
              <ShieldAlert className="h-4 w-4" />
              撤退/求助
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-[var(--header-soft)] p-1" role="group" aria-label="畫面模式">
            {THEMES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={theme === id}
                onClick={() => applyTheme(id)}
                className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold ${
                  theme === id ? 'bg-[var(--header-text)] text-[var(--header-from)]' : 'opacity-80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-[color-mix(in_srgb,var(--header-text)_25%,transparent)] bg-[var(--header-soft)] p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Footprints className="h-3.5 w-3.5" />
                當前模式：{routeMode === 'A' ? '方案 A（石龍拱折返輕鬆遊）' : '方案 B（行足全程落深井食嘢）'}
              </span>
              <span className="shrink-0 font-bold">{progressPercentage}% 已完成</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--track)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--fill-from)] to-[var(--fill-to)] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        {activeTab !== 'guide' && weather.report && weather.report.severity !== 'ok' && (
          <div className="mb-4">
            <WeatherBanner report={weather.report} />
          </div>
        )}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <WeatherCard
              report={weather.report}
              error={weather.error}
              loading={weather.loading}
              onRefresh={() => void weather.reload()}
            />
            <div className="rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-3.5 shadow-[var(--shadow)]">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-[var(--accent)]" />
                  隨時切換路線方案（視乎當日體力）
                </span>
                {completedSteps.length > 0 && (
                  <button
                    type="button"
                    onClick={resetProgress}
                    className="flex items-center gap-1 text-xs text-[var(--muted)]"
                  >
                    <RotateCcw className="h-3 w-3" /> 重設進度
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('A')}
                  className={`rounded-xl border-[length:var(--bw)] p-2.5 text-left ${
                    routeMode === 'A'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--line)] bg-[var(--chip)] opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">方案 A：精華折返</span>
                    {routeMode === 'A' && <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />}
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">石龍拱睇完三橋海景原路落荃灣</p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent-soft-text)]">
                    <Clock className="h-3 w-3" /> 約 2 小時｜零迷路風險
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('B')}
                  className={`rounded-xl border-[length:var(--bw)] p-2.5 text-left ${
                    routeMode === 'B'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--line)] bg-[var(--chip)] opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">方案 B：深井美食</span>
                    {routeMode === 'B' && <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />}
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">行晒全程經清快塘落深井開餐</p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent-soft-text)]">
                    <Clock className="h-3 w-3" /> 約 3.5 小時｜最完整體驗
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border-[length:var(--bw)] border-[var(--amber-line)] bg-[var(--amber-bg)] p-3.5 text-[var(--amber-text)]">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1 text-xs leading-relaxed">
                <p className="font-bold">給第一次行呢條路嘅你：</p>
                <p>頭 15 分鐘上港安醫院條樓梯係全段最辛苦嘅位，只要慢慢行捱過咗，後面 85% 都係平路、緩坡同落山石屎路！去到每個 Checkpoint 撳一下「打卡完成」，一步步跟住路牌字眼行就唔會蕩失路。</p>
              </div>
            </div>

            <RouteSketch routeMode={routeMode} activeId={expandedStep} onSelect={openCheckpoint} />
            <ElevationProfile routeMode={routeMode} onSelect={openCheckpoint} />

            <div className="space-y-3">
              {visibleCheckpoints.map((cp, index) => {
                const isCompleted = completedSteps.includes(cp.id);
                const isExpanded = expandedStep === cp.id;
                return (
                  <div
                    key={cp.id}
                    id={`cp-${cp.id}`}
                    className={`scroll-mt-52 overflow-hidden rounded-2xl border-[length:var(--bw)] bg-[var(--card)] shadow-[var(--shadow)] ${
                      isCompleted
                        ? 'border-[var(--accent)]'
                        : isExpanded
                          ? 'border-[var(--accent)]'
                          : 'border-[var(--line)]'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedStep(isExpanded ? null : cp.id)}
                      className="flex cursor-pointer select-none items-start gap-3 p-4"
                    >
                      <button
                        type="button"
                        onClick={(event) => toggleStepComplete(cp.id, event)}
                        className="mt-0.5 shrink-0 text-[var(--accent)]"
                        title={isCompleted ? '標記為未完成' : '標記為已到達'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 fill-[var(--accent)] text-[var(--card)]" />
                        ) : (
                          <Circle className="h-6 w-6 text-[var(--ghost)]" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-[var(--chip)] px-2 py-0.5 text-[11px] font-bold text-[var(--muted)]">
                            站點 {index + 1}/{visibleCheckpoints.length}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--accent-soft-text)]">
                            <Clock className="h-3 w-3" /> {cp.durationFromPrev}
                          </span>
                          {cp.difficulty === 'hard' && (
                            <span className="rounded bg-[var(--rose-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--rose-text)]">
                              需調整呼吸慢行
                            </span>
                          )}
                        </div>
                        <h3 className={`mt-1 text-base font-bold ${isCompleted ? 'text-[var(--ghost)] line-through' : ''}`}>
                          {cp.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">{cp.subtitle}</p>
                      </div>
                      <div className="mt-1 text-[var(--muted)]">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 border-t border-[var(--line)] px-4 pb-4 pt-3 text-sm">
                        <div className="flex items-center gap-3 rounded-xl bg-[var(--sign-bg)] p-3 text-[var(--sign-label)]">
                          <Navigation className="h-5 w-5 shrink-0" />
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider">現場認住呢個路牌方向：</div>
                            <div className="mt-0.5 text-sm font-bold text-[var(--sign-text)]">{cp.signpost}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-[var(--chip)] px-3 py-2 text-xs text-[var(--text)]">
                          <Footprints className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                          <span>
                            <strong>地面路況：</strong>
                            {cp.terrain}（累計時間：{cp.accumulatedTime}）
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-bold uppercase text-[var(--muted)]">行進指示：</div>
                          <ul className="space-y-2">
                            {cp.instructions.map((inst, i) => (
                              <li key={inst} className="flex items-start gap-2 text-xs leading-relaxed">
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[10px] font-bold text-[var(--accent-soft-text)]">
                                  {i + 1}
                                </span>
                                <span>{inst}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {cp.isDecisionPoint && routeMode === 'A' && (
                          <div className="space-y-1.5 rounded-xl border-[length:var(--bw)] border-[var(--teal-line)] bg-[var(--teal-bg)] p-3 text-xs text-[var(--teal-text)]">
                            <div className="flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className="h-4 w-4" /> 你目前選擇咗「方案 A：精華折返遊」
                            </div>
                            <p>喺石龍拱涼亭同草坡影完靚相、吹夠海風之後，就可以沿住頭先上嚟嘅路原路行返落去「荃灣港安醫院」搭車返荃灣市中心食嘢！落山好輕鬆，大約 40–45 分鐘就落到去。</p>
                          </div>
                        )}

                        {cp.photoTip && (
                          <div className="space-y-1 rounded-xl border-[length:var(--bw)] border-[var(--sky-line)] bg-[var(--sky-bg)] p-3 text-xs text-[var(--sky-text)]">
                            <div className="flex items-center gap-1 font-bold">
                              <Camera className="h-4 w-4" /> 打卡取景貼士
                            </div>
                            <p className="leading-relaxed">{cp.photoTip}</p>
                          </div>
                        )}

                        {cp.warning && (
                          <div className="flex items-start gap-2 rounded-xl border-[length:var(--bw)] border-[var(--rose-line)] bg-[var(--rose-bg)] p-3 text-xs font-medium text-[var(--rose-text)]">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="leading-relaxed">{cp.warning}</span>
                          </div>
                        )}

                        {cp.facilities && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {cp.facilities.map((fac) => (
                              <span key={fac} className="rounded-full bg-[var(--chip)] px-2.5 py-1 text-[11px] font-medium">
                                📍 {fac}
                              </span>
                            ))}
                          </div>
                        )}

                        <a
                          href={mapsUrl(cp.lat, cp.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-[length:var(--bw)] border-[var(--accent)] bg-[var(--accent-soft)] py-2.5 text-xs font-bold text-[var(--accent-soft-text)]"
                        >
                          <ExternalLink className="h-4 w-4" />
                          喺 Google Maps 開啟位置
                        </a>
                        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                          {cp.lat.toFixed(5)}, {cp.lng.toFixed(5)}。{cp.mapNote}
                        </p>

                        <button
                          type="button"
                          onClick={(event) => toggleStepComplete(cp.id, event)}
                          className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold ${
                            isCompleted
                              ? 'bg-[var(--chip)] text-[var(--text)]'
                              : 'bg-[var(--accent)] text-[var(--accent-text)]'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isCompleted ? '已完成此站（點擊取消）' : '我已經到達呢度！打卡前往下一站'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'photo' && (
          <div className="rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Camera className="h-5 w-5 text-[var(--accent)]" />
              影片同款！三大必影打卡機位
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              呢條路線最出名就係「三橋海景」同埋石龍拱草坡，跟住以下方法影，手機都影到大片感！
            </p>
            <div className="mt-4 space-y-4">
              <div className="space-y-2 rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent-soft-text)]">
                    機位 1（最推薦！）
                  </span>
                  <span className="text-xs text-[var(--muted)]">位於：Checkpoint 3 石龍拱涼亭旁</span>
                </div>
                <h3 className="text-sm font-bold">石龍拱隱藏小草坡「草地＋三橋海景」</h3>
                <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed">
                  <li><strong>點樣搵個位：</strong>去到石龍拱涼亭之後，唔好淨係企喺涼亭入面影！沿住涼亭旁邊條山徑行多十幾步上去，會見到一片斜斜哋嘅開揚小草地。</li>
                  <li><strong>手機拍攝秘訣：</strong>做 Model 嘅朋友行落草地少少（背向大海或側身望海），揸機嘅朋友企高幾級，開啟手機<strong>「人像模式 (Portrait)」或者「2x / 3x 長焦距」</strong>由上而下影落去。</li>
                  <li><strong>效果：</strong>長焦距會將遠處嘅青馬大橋、汀九橋、昂船洲大橋「壓縮」拉近，令成片草地同壯觀大橋海景充滿晒成個畫面！</li>
                </ul>
              </div>
              <div className="space-y-2 rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--sky-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--sky-text)]">機位 2</span>
                  <span className="text-xs text-[var(--muted)]">位於：Checkpoint 4 石龍拱觀景台</span>
                </div>
                <h3 className="text-sm font-bold">觀景台全景欄杆位</h3>
                <p className="text-xs leading-relaxed">
                  離開涼亭往田夫仔方向行約 15 分鐘就會到官方觀景台。呢度視野完全無遮擋，適合用手機「0.5x 超廣角」或者全景模式，影低成個藍巴勒海峽、馬灣同大嶼山嘅壯闊景色。
                </p>
              </div>
              <div className="space-y-2 rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--teal-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--teal-text)]">機位 3</span>
                  <span className="text-xs text-[var(--muted)]">位於：Checkpoint 6 深井沉澱池</span>
                </div>
                <h3 className="text-sm font-bold">深井沉澱池山谷水塘景</h3>
                <p className="text-xs leading-relaxed">
                  落深井途中必經嘅大水池，水池配合遠處嘅青山公路海景同埋山谷樹木，畫面好日系清新，行到呢度不妨停低同水塘欄杆影返張輕鬆漫步相。
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sunset' && <SunsetPanel />}

        {activeTab === 'food' && <EatsPanel />}

        {activeTab === 'prep' && (
          <div className="rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <CheckSquare className="h-5 w-5 text-[var(--accent)]" />
                新手出發前執袋 Checklist
              </h2>
              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent-soft-text)]">
                已執齊 {checkedItems.length}/{INITIAL_CHECKLIST.length}
              </span>
            </div>
            <p className="mb-4 text-xs text-[var(--muted)]">出門口前逐項剔一剔，確保帶齊嘢先好上山！</p>
            <div className="space-y-2.5">
              {INITIAL_CHECKLIST.map((item) => {
                const isChecked = checkedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`flex cursor-pointer select-none items-start gap-3 rounded-xl border-[length:var(--bw)] p-3 ${
                      isChecked ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--line)] bg-[var(--chip)]'
                    }`}
                  >
                    <div className="mt-0.5 text-[var(--accent)]">
                      {isChecked ? (
                        <CheckCircle2 className="h-5 w-5 fill-[var(--accent)] text-[var(--card)]" />
                      ) : (
                        <Circle className="h-5 w-5 text-[var(--ghost)]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${isChecked ? 'text-[var(--ghost)] line-through' : ''}`}>{item.text}</div>
                      <div className="mt-0.5 text-xs text-[var(--muted)]">{item.subtext}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-5 text-[var(--text)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-[var(--rose-text)]">
                <ShieldAlert className="h-5 w-5" />
                中途撤退路線 ＆ 緊急支援
              </h3>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="rounded-lg bg-[var(--chip)] px-3 py-1.5 text-xs font-bold"
              >
                關閉
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="space-y-1.5 rounded-xl border-[length:var(--bw)] border-[var(--amber-line)] bg-[var(--amber-bg)] p-3.5 text-[var(--amber-text)]">
                <div className="text-sm font-bold">1. 行到「石龍拱涼亭」覺得攰點算？</div>
                <p>
                  千祈唔好勉強行去深井！喺石龍拱涼亭（Checkpoint 3）休息夠之後，<strong>直接沿住上山條路原路折返落「荃灣港安醫院」</strong>。落山只需約 40 分鐘，而且全石級同石屎路，非常安全好行。
                </p>
              </div>
              <div className="space-y-1.5 rounded-xl border-[length:var(--bw)] border-[var(--sky-line)] bg-[var(--sky-bg)] p-3.5 text-[var(--sky-text)]">
                <div className="text-sm font-bold">2. 過咗「清快塘」先覺得攰點算？</div>
                <p>
                  如果你已經行到清快塘（喜香農莊／公廁位，Checkpoint 5），呢個時候<strong>跟住「深井」路牌落山係最快離開山頭嘅方法</strong>（約 45–55 分鐘全落斜石屎路直達深井市區），比原路行返轉頭上石龍拱更省力！
                </p>
              </div>
              <div className="space-y-1.5 rounded-xl bg-[var(--chip)] p-3.5">
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <PhoneCall className="h-4 w-4 text-[var(--rose-text)]" /> 3. 萬一迷路或身體不適
                </div>
                <ul className="list-disc space-y-1 pl-4">
                  <li><strong>留在原處主徑：</strong>千祈唔好行入無路牌嘅小路或草叢。</li>
                  <li><strong>留意距離標距柱：</strong>元荃古道沿途設有標距柱（例如 C6101、C6102 等），報警或求助時讀出標距柱號碼，救援人員就可以即刻鎖定你嘅位置。</li>
                  <li><strong>香港緊急求救電話：</strong>999 或 112（無SIM卡或跨網絡均可撥打）。</li>
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowEmergencyModal(false)}
              className="w-full rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold text-[var(--accent-text)]"
            >
              明白，返回路線導航
            </button>
          </div>
        </div>
      )}

      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--line)] bg-[var(--nav)] backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-5 px-1 py-1.5">
          {(
            [
              ['guide', '導航', Compass],
              ['photo', '打卡', Camera],
              ['sunset', '日落', Sunset],
              ['food', '深井食', Utensils],
              ['prep', '準備', CheckSquare],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`relative flex flex-col items-center rounded-xl py-1.5 ${
                activeTab === id ? 'bg-[var(--accent-soft)] font-bold text-[var(--accent-soft-text)]' : 'text-[var(--muted)]'
              }`}
            >
              <Icon className="mb-0.5 h-5 w-5" />
              <span className="text-[10px] leading-none">{label}</span>
              {id === 'prep' && checkedItems.length < INITIAL_CHECKLIST.length && (
                <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
