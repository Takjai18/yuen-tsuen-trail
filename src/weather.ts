const HKO = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php';

const ICON_LABEL: Record<number, string> = {
  50: '陽光充沛',
  51: '間有陽光',
  52: '短暫陽光',
  53: '間有陽光幾陣驟雨',
  54: '短暫陽光有驟雨',
  60: '多雲',
  61: '密雲',
  62: '微雨',
  63: '雨',
  64: '大雨',
  65: '雷暴',
  76: '大致多雲',
  77: '天色大致良好',
  80: '大風',
  81: '乾燥',
  82: '潮濕',
  83: '霧',
  84: '薄霧',
  85: '煙霞',
  90: '熱',
  91: '暖',
  92: '涼',
  93: '冷',
};

export interface TempReading {
  place: string;
  value: number;
}

export interface WeatherWarning {
  key: string;
  name: string;
  code: string;
  level: 'stop' | 'caution' | 'info';
}

export interface WeatherReport {
  icon?: number;
  iconLabel?: string;
  observedAt: string;
  ridgeTemp?: TempReading;
  valleyTemp?: TempReading;
  humidity?: number;
  uv?: { value: number; desc: string };
  tsuenWanRain?: number;
  todayText: string;
  todayRange: string;
  todayWind: string;
  generalSituation: string;
  warnings: WeatherWarning[];
  tip: string;
  severity: 'ok' | 'caution' | 'stop';
}

interface RawTemp {
  place?: string;
  value?: number;
}

interface RawWarning {
  name?: string;
  code?: string;
  actionCode?: string;
}

async function readJson(dataType: string): Promise<unknown> {
  const response = await fetch(`${HKO}?dataType=${dataType}&lang=tc`);
  if (!response.ok) throw new Error(`天文台資料暫時讀唔到（${response.status}）`);
  return response.json() as Promise<unknown>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function tempAt(raw: unknown, place: string): TempReading | undefined {
  const data = asRecord(raw)?.data;
  if (!Array.isArray(data)) return undefined;
  const found = data.find((item) => asRecord(item)?.place === place) as RawTemp | undefined;
  if (!found || typeof found.value !== 'number') return undefined;
  return { place, value: found.value };
}

function formatTime(iso: unknown): string {
  if (typeof iso !== 'string' || !iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('zh-HK', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Hong_Kong',
  }).format(date);
}

function warningLevel(key: string, code: string): WeatherWarning['level'] {
  if (key === 'WTS' || key === 'WTMW' || key === 'WL') return 'stop';
  if (key === 'WRAIN') return code === 'WRAINA' ? 'caution' : 'stop';
  if (key === 'WTCSGNL') return code === 'TC1' ? 'caution' : 'stop';
  if (key === 'WMSGNL' || key === 'WHOT' || key === 'WFNTSA') return 'caution';
  return 'info';
}

function parseWarnings(raw: unknown): WeatherWarning[] {
  const record = asRecord(raw);
  if (!record) return [];
  const warnings: WeatherWarning[] = [];
  for (const [key, value] of Object.entries(record)) {
    const item = asRecord(value) as RawWarning | null;
    if (!item || item.actionCode === 'CANCEL') continue;
    const code = item.code ?? key;
    warnings.push({
      key,
      name: item.name || key,
      code,
      level: warningLevel(key, code),
    });
  }
  const rank = { stop: 0, caution: 1, info: 2 };
  return warnings.sort((a, b) => rank[a.level] - rank[b.level]);
}

function hikingTip(input: {
  warnings: WeatherWarning[];
  rain?: number;
  wind: string;
  forecast: string;
  uvDesc?: string;
}): { tip: string; severity: WeatherReport['severity'] } {
  const notes: string[] = [];
  for (const warning of input.warnings) {
    if (warning.key === 'WTS') notes.push('而家有雷暴警告。石龍拱完全開揚，唔好出發。如果已經喺山上，唔好企喺最高點，沿主徑落到有遮擋嘅地方。');
    else if (warning.key === 'WRAIN' && warning.level === 'stop') notes.push('紅雨或黑雨生效，建議留喺市區，唔好上山。');
    else if (warning.key === 'WRAIN') notes.push('黃色暴雨生效。石級同石屎路會滑，新手最好改期。');
    else if (warning.key === 'WTCSGNL' && warning.level === 'stop') notes.push('而家掛住三號或以上風球。高地風勢大過市區，呢條路線唔適合出發。');
    else if (warning.key === 'WTCSGNL') notes.push('一號戒備信號生效。出發前再睇一次會唔會改掛更高風球。');
    else if (warning.key === 'WMSGNL') notes.push('強烈季候風信號生效。石龍拱係高地，風會比荃灣市區大，記得著風褸。');
    else if (warning.key === 'WHOT') notes.push('酷熱天氣警告生效。頭段樓梯會特別辛苦，水要帶夠，覺得唔舒服就折返。');
    else if (warning.key === 'WL') notes.push('山泥傾瀉警告生效。留喺有路牌嘅主徑，唔好行入小路或草叢。');
    else if (warning.key === 'WTMW') notes.push('海嘯警告生效。深井近岸，留意天文台公布先好落去終點。');
    else if (warning.key === 'WCOLD') notes.push('寒冷天氣警告。山上風大，著定風褸先好停低影相。');
    else notes.push(`${warning.name}生效。出發前先睇清楚天文台公布。`);
  }

  const severity: WeatherReport['severity'] = input.warnings.some((warning) => warning.level === 'stop')
    ? 'stop'
    : input.warnings.some((warning) => warning.level === 'caution')
      ? 'caution'
      : 'ok';

  if (severity === 'ok') {
    if (typeof input.rain === 'number' && input.rain > 0) notes.push(`荃灣過去一小時錄得 ${formatMm(input.rain)} 毫米雨，石級同石屎路會滑。`);
    if (/強風|[6-9]級|暴風/.test(`${input.wind}${input.forecast}`)) notes.push('預測高地有強風。石龍拱停低影相會好大風，著定風褸。');
    if (input.uvDesc && /高|極高/.test(input.uvDesc)) notes.push('紫外線高。石龍拱冇樹蔭，要補防曬同戴帽。');
    if (notes.length === 0) notes.push('而家冇天氣警告。石龍拱仍然會曬同有風，水同防曬照帶。');
  }

  return { tip: notes.slice(0, 2).join(''), severity };
}

function formatMm(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function text(record: Record<string, unknown> | null, key: string): string {
  const value = record?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

function firstRecord(value: unknown): Record<string, unknown> | null {
  return Array.isArray(value) ? asRecord(value[0]) : null;
}

export function iconUrl(icon: number): string {
  return `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${icon}.png`;
}

export async function fetchHkoWeather(): Promise<WeatherReport> {
  const [currentResult, warningResult, forecastResult, localResult] = await Promise.allSettled([
    readJson('rhrread'),
    readJson('warnsum'),
    readJson('fnd'),
    readJson('flw'),
  ]);
  if (currentResult.status === 'rejected' && forecastResult.status === 'rejected') {
    throw new Error('暫時連唔到香港天文台。');
  }

  const current = currentResult.status === 'fulfilled' ? asRecord(currentResult.value) : null;
  const forecast = forecastResult.status === 'fulfilled' ? asRecord(forecastResult.value) : null;
  const local = localResult.status === 'fulfilled' ? asRecord(localResult.value) : null;
  const warnings = warningResult.status === 'fulfilled' ? parseWarnings(warningResult.value) : [];

  const today = Array.isArray(forecast?.weatherForecast) ? asRecord(forecast.weatherForecast[0]) : null;
  const maxTemp = asRecord(today?.forecastMaxtemp)?.value;
  const minTemp = asRecord(today?.forecastMintemp)?.value;
  const todayWind = text(today, 'forecastWind');
  const todayText = text(local, 'forecastDesc') || text(today, 'forecastWeather');
  const rainRecord = asRecord(current?.rainfall)?.data;
  const tsuenWan = Array.isArray(rainRecord)
    ? asRecord(rainRecord.find((item) => asRecord(item)?.place === '荃灣'))
    : null;
  const rainValue = typeof tsuenWan?.max === 'number' ? tsuenWan.max : undefined;
  const uvData = firstRecord(asRecord(current?.uvindex)?.data);
  const uv = typeof uvData?.value === 'number'
    ? { value: uvData.value, desc: text(uvData, 'desc') }
    : undefined;
  const icon = Array.isArray(current?.icon) && typeof current.icon[0] === 'number' ? current.icon[0] : undefined;
  const humidityData = firstRecord(asRecord(current?.humidity)?.data);
  const advice = hikingTip({
    warnings,
    rain: rainValue,
    wind: todayWind,
    forecast: todayText,
    uvDesc: uv?.desc,
  });

  return {
    icon,
    iconLabel: icon !== undefined ? ICON_LABEL[icon] : undefined,
    observedAt: formatTime(current?.updateTime || current?.iconUpdateTime || forecast?.updateTime),
    ridgeTemp: current ? tempAt(current.temperature, '荃灣可觀') : undefined,
    valleyTemp: current ? tempAt(current.temperature, '荃灣城門谷') : undefined,
    humidity: typeof humidityData?.value === 'number' ? humidityData.value : undefined,
    uv,
    tsuenWanRain: rainValue,
    todayText,
    todayRange: typeof minTemp === 'number' && typeof maxTemp === 'number' ? `${minTemp}–${maxTemp}°C` : '',
    todayWind,
    generalSituation: text(local, 'generalSituation') || text(forecast, 'generalSituation'),
    warnings,
    tip: advice.tip,
    severity: advice.severity,
  };
}
