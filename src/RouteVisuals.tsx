import { CHECKPOINTS, PROFILE, type RouteMode } from './trail.ts';

const MAP_BOUNDS = {
  minLon: 114.048,
  maxLon: 114.11,
  minLat: 22.363,
  maxLat: 22.386,
};

function project(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * 286 + 40;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 160 + 28;
  return { x, y };
}

const LABEL_NUDGE: Record<number, { dx: number; dy: number }> = {
  1: { dx: -8, dy: 16 },
  2: { dx: 0, dy: -14 },
  3: { dx: 4, dy: -14 },
  4: { dx: 0, dy: 16 },
  5: { dx: 0, dy: -14 },
  6: { dx: 12, dy: -12 },
  7: { dx: 0, dy: 16 },
};

export function RouteSketch({
  routeMode,
  activeId,
  onSelect,
}: {
  routeMode: RouteMode;
  activeId: number | null;
  onSelect: (id: number) => void;
}) {
  const placed = CHECKPOINTS.map((cp) => ({ ...cp, ...project(cp.lat, cp.lng) }));
  const active = placed.filter((cp) => !cp.onlyInMode || cp.onlyInMode === routeMode);
  const later = placed.filter((cp) => cp.onlyInMode === 'B');
  const line = (routeMode === 'A' ? active : placed).map((cp) => `${cp.x},${cp.y}`).join(' ');
  const returnLine =
    routeMode === 'A' && active.length > 1
      ? `${active[active.length - 1].x},${active[active.length - 1].y} ${active[0].x},${active[0].y}`
      : '';

  return (
    <div className="rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-3.5 shadow-[var(--shadow)]">
      <div className="mb-2">
        <h2 className="text-sm font-bold text-[var(--text)]">離線路線示意</h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
          用公開座標畫嘅草圖，唔使上網都睇到。距離未經實地量度，行路以現場路牌為準。撳點可以打開嗰一站。
        </p>
      </div>
      <svg viewBox="0 0 344 230" role="img" aria-label="元荃古道由港安醫院經石龍拱去深井嘅路線示意" className="h-auto w-full">
        <rect x="0" y="176" width="344" height="54" fill="var(--sea)" />
        <text x="16" y="206" fill="var(--sea-text)" fontSize="11">
          藍巴勒海峽方向
        </text>
        <text x="300" y="22" fill="var(--muted)" fontSize="11" textAnchor="middle">
          北
        </text>
        <polygon points="300,28 295,40 305,40" fill="var(--muted)" />
        {routeMode === 'A' && (
          <polyline points={later.map((cp) => `${cp.x},${cp.y}`).join(' ')} fill="none" stroke="var(--ghost)" strokeWidth="2" strokeDasharray="4 4" />
        )}
        <polyline points={line} fill="none" stroke="var(--profile-climb)" strokeWidth="3" strokeLinejoin="round" />
        {returnLine && (
          <polyline points={returnLine} fill="none" stroke="var(--profile-steep)" strokeWidth="2" strokeDasharray="5 4" />
        )}
        {placed.map((cp) => {
          const inRoute = !cp.onlyInMode || cp.onlyInMode === routeMode;
          const nudge = LABEL_NUDGE[cp.id];
          const selected = activeId === cp.id;
          return (
            <g
              key={cp.id}
              role="button"
              tabIndex={0}
              aria-label={`打開${cp.shortLabel}`}
              onClick={() => onSelect(cp.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(cp.id);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={cp.x}
                cy={cp.y}
                r={selected ? 8 : 6}
                fill={inRoute ? 'var(--accent)' : 'var(--card)'}
                stroke="var(--text)"
                strokeWidth={selected ? 2.5 : 1.5}
              />
              <text
                x={cp.x + nudge.dx}
                y={cp.y + nudge.dy}
                fill={inRoute ? 'var(--text)' : 'var(--ghost)'}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {cp.shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
      {routeMode === 'A' && (
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          橙色虛線係方案 A 由石龍拱原路折返。灰色虛線係方案 B 先會行去深井。
        </p>
      )}
    </div>
  );
}

const CHART = { w: 360, h: 176, l: 34, r: 8, t: 14, b: 28 };
const MAX_KM = 10.2;
const MAX_ELEV = 450;

function chartX(km: number) {
  return CHART.l + (km / MAX_KM) * (CHART.w - CHART.l - CHART.r);
}

function chartY(elevation: number) {
  return CHART.t + (1 - elevation / MAX_ELEV) * (CHART.h - CHART.t - CHART.b);
}

export function ElevationProfile({
  routeMode,
  onSelect,
}: {
  routeMode: RouteMode;
  onSelect: (id: number) => void;
}) {
  const solid = PROFILE.filter((point) => !point.onlyInMode || point.onlyInMode === routeMode);
  const solidPath = solid.map((point) => `${chartX(point.km)},${chartY(point.elevation)}`).join(' ');
  const area = `${chartX(solid[0].km)},${chartY(0)} ${solidPath} ${chartX(solid[solid.length - 1].km)},${chartY(0)}`;
  const ghost = routeMode === 'A' ? PROFILE.filter((point) => point.km >= 3.3) : [];
  const ghostPath = ghost.map((point) => `${chartX(point.km)},${chartY(point.elevation)}`).join(' ');

  return (
    <div className="rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-3.5 shadow-[var(--shadow)]">
      <h2 className="text-sm font-bold text-[var(--text)]">海拔示意</h2>
      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
        {routeMode === 'A'
          ? '頭段樓梯最斜。之後緩緩升到石龍拱約 410 米，然後沿原路落返港安。'
          : '頭 15 分鐘樓梯最斜。之後斜度放緩，一路升到石龍拱約 410 米，再落到深井海旁。'}
      </p>
      <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} role="img" aria-label="路線海拔剖面，顯示頭段上斜同之後落深井" className="mt-1 h-auto w-full">
        {[0, 150, 300, 450].map((elevation) => (
          <g key={elevation}>
            <line
              x1={CHART.l}
              x2={CHART.w - CHART.r}
              y1={chartY(elevation)}
              y2={chartY(elevation)}
              stroke="var(--profile-grid)"
              strokeWidth="1"
            />
            <text x="2" y={chartY(elevation) + 4} fill="var(--muted)" fontSize="10">
              {elevation}
            </text>
          </g>
        ))}
        <polygon points={area} fill="var(--accent)" opacity="0.16" />
        {ghostPath && (
          <polyline points={ghostPath} fill="none" stroke="var(--ghost)" strokeWidth="2" strokeDasharray="5 4" />
        )}
        <polyline points={solid.slice(0, 2).map((point) => `${chartX(point.km)},${chartY(point.elevation)}`).join(' ')} fill="none" stroke="var(--profile-steep)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={solid.filter((point) => point.km >= 0.6 && point.km <= 3.3).map((point) => `${chartX(point.km)},${chartY(point.elevation)}`).join(' ')} fill="none" stroke="var(--profile-climb)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {solid.filter((point) => point.km >= 3.3).length > 1 && (
          <polyline points={solid.filter((point) => point.km >= 3.3).map((point) => `${chartX(point.km)},${chartY(point.elevation)}`).join(' ')} fill="none" stroke="var(--profile-down)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {PROFILE.map((point) => {
          const optional = point.onlyInMode === 'B' && routeMode === 'A';
          const showLabel = point.id === 'start' || point.id === 'pavilion' || point.id === 'end';
          return (
            <g
              key={point.id}
              role={point.checkpointId ? 'button' : undefined}
              tabIndex={point.checkpointId ? 0 : undefined}
              aria-label={point.checkpointId ? `打開${point.label}，約 ${point.elevation} 米` : undefined}
              onClick={point.checkpointId ? () => onSelect(point.checkpointId!) : undefined}
              onKeyDown={
                point.checkpointId
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelect(point.checkpointId!);
                      }
                    }
                  : undefined
              }
              style={point.checkpointId ? { cursor: 'pointer' } : undefined}
            >
              <circle cx={chartX(point.km)} cy={chartY(point.elevation)} r={point.checkpointId ? 5 : 4} fill={optional ? 'var(--card)' : point.checkpointId ? 'var(--accent)' : 'var(--profile-steep)'} stroke="var(--text)" strokeWidth="1.5" />
              <title>{`${point.label} 約 ${point.elevation} 米`}</title>
              {point.id === 'stairs' && (
                <text x={chartX(point.km) + 14} y={chartY(point.elevation) - 6} fill="var(--profile-steep)" fontSize="10">
                  樓梯
                </text>
              )}
              {showLabel && (
                <text x={chartX(point.km)} y={CHART.h - 8} fill="var(--muted)" fontSize="10" textAnchor="middle">
                  {point.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="text-[11px] leading-relaxed text-[var(--muted)]">
        港安巴士站約 53 米、石龍拱涼亭約 410 米、深井沉澱池約 127 米、深井村約 7 米，來自公開地圖高度。橙色係頭段樓梯。其餘轉折係大約高度，用來睇邊段斜，唔係儀器實測。
        {routeMode === 'A' ? ' 灰色虛線係方案 B 落深井嘅形狀。' : ''}
      </p>
    </div>
  );
}
