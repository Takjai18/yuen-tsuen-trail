export interface SolarEvent {
  sunsetMinutes: number;
  sunsetClock: number;
  azimuth: number;
}

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const TZ_MINUTES = 8 * 60;
const REFRACTION_ZENITH = 90.833;

function julianDayUtcMidnight(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  return jdn - 0.5;
}

function sunAt(t: number): { decl: number; eqTime: number } {
  let meanLong = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  if (meanLong < 0) meanLong += 360;
  const anomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const ecc = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const center =
    Math.sin(anomaly * RAD) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * anomaly * RAD) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * anomaly * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * t;
  const apparent = meanLong + center - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const meanObliq = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliq = meanObliq + 0.00256 * Math.cos(omega * RAD);
  const decl = DEG * Math.asin(Math.sin(obliq * RAD) * Math.sin(apparent * RAD));
  const varY = Math.tan((obliq / 2) * RAD) ** 2;
  const eqTime =
    4 *
    DEG *
    (varY * Math.sin(2 * meanLong * RAD) -
      2 * ecc * Math.sin(anomaly * RAD) +
      4 * ecc * varY * Math.sin(anomaly * RAD) * Math.cos(2 * meanLong * RAD) -
      0.5 * varY * varY * Math.sin(4 * meanLong * RAD) -
      1.25 * ecc * ecc * Math.sin(2 * anomaly * RAD));
  return { decl, eqTime };
}

/** Clear-sky sunset for a Hong Kong lat/lng. Checked against the Observatory's 2026-11-07 time of 17:43. */
export function solarSunset(lat: number, lng: number, year: number, month: number, day: number): SolarEvent {
  const jd0 = julianDayUtcMidnight(year, month, day);
  let minutes = 18 * 60;
  let decl = 0;
  for (let i = 0; i < 5; i++) {
    const t = (jd0 + (minutes - TZ_MINUTES) / 1440 - 2451545.0) / 36525;
    const sun = sunAt(t);
    decl = sun.decl;
    const hourAngleArg =
      Math.cos(REFRACTION_ZENITH * RAD) / (Math.cos(lat * RAD) * Math.cos(decl * RAD)) -
      Math.tan(lat * RAD) * Math.tan(decl * RAD);
    const hourAngle = DEG * Math.acos(Math.min(1, Math.max(-1, hourAngleArg)));
    minutes = 720 - 4 * lng - sun.eqTime + TZ_MINUTES + hourAngle * 4;
  }
  const latR = lat * RAD;
  const decR = decl * RAD;
  const alt = -0.833;
  const cosAz =
    (Math.sin(decR) - Math.sin(latR) * Math.sin(alt * RAD)) / (Math.cos(latR) * Math.cos(alt * RAD));
  const azimuth = 360 - DEG * Math.acos(Math.min(1, Math.max(-1, cosAz)));
  const sunsetClock = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return { sunsetMinutes: minutes, sunsetClock, azimuth };
}

export function formatClock(clockMinutes: number): string {
  const day = ((clockMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(day / 60);
  const minute = day % 60;
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

export function bearingWords(azimuth: number): string {
  const a = ((azimuth % 360) + 360) % 360;
  if (a >= 240 && a < 265) return '西南偏西';
  if (a >= 265 && a < 285) return '正西';
  if (a >= 215 && a < 240) return '西南';
  if (a >= 285 && a < 320) return '西北偏西';
  return `約 ${Math.round(a)} 度`;
}

export interface HkParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export function hkParts(date = new Date()): HkParts {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const bag = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  let hour = Number(bag.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour,
    minute: Number(bag.minute),
  };
}

export function hkDateValue(parts: HkParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function hkTimeValue(parts: HkParts): string {
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

export const SUNSET_PLACES: { id: number; label: string }[] = [
  { id: 1, label: '1. 港安（起點，望住荃灣）' },
  { id: 2, label: '2. 下花山（未到打卡位）' },
  { id: 3, label: '3. 石龍拱涼亭（三橋位）' },
  { id: 4, label: '4. 觀景台（三橋位）' },
  { id: 5, label: '5. 清快塘（已過打卡位）' },
  { id: 6, label: '6. 沉澱池（已過打卡位）' },
  { id: 7, label: '7. 深井村（市區）' },
];

const WALK_TO_PAVILION: Record<number, number> = { 1: 60, 2: 40 };
const WALK_TO_SEA: Record<number, number> = { 5: 60, 6: 30 };

export type VerdictId = 'see' | 'tight' | 'glow' | 'miss';

export interface SunsetVerdict {
  id: VerdictId;
  title: string;
  detail: string;
  sunsetLabel: string;
  minutesUntilSunset: number;
  walkMinutes: number | null;
  walkTarget: string | null;
  bearing: string;
}

function faceLine(bearing: string, azimuth: number): string {
  return `太陽大約喺${bearing}（${Math.round(azimuth)}°）。望住青馬大橋同藍巴勒海峽，唔好望返去山。`;
}

function spotNow(
  left: number,
  where: string,
  bearing: string,
  azimuth: number,
): Pick<SunsetVerdict, 'id' | 'title' | 'detail'> {
  const face = faceLine(bearing, azimuth);
  if (left > 45) {
    return {
      id: 'see',
      title: '睇到',
      detail: `${where}距離日落仲有 ${left} 分鐘。最靚光大約日落前 45 分鐘先開始，而家可以慢慢企定。${face}`,
    };
  }
  if (left > 15) {
    return {
      id: 'see',
      title: '睇到',
      detail: `${where}距離日落仲有 ${left} 分鐘，而家就係最靚光。${face}`,
    };
  }
  if (left >= 0) {
    const when = left === 0 ? '太陽而家落到地平線' : `太陽約 ${left} 分鐘後就落`;
    return {
      id: 'tight',
      title: '趕得切',
      detail: `${where}${when}，趕得切但好趕。即刻企定。${face}`,
    };
  }
  if (left >= -20) {
    return {
      id: 'glow',
      title: '只剩餘暉',
      detail: `${where}太陽已經落咗約 ${-left} 分鐘，天邊可能仲有餘暉。正光已經過咗。`,
    };
  }
  return {
    id: 'miss',
    title: '趕唔切',
    detail: `${where}太陽落咗約 ${-left} 分鐘，呢度已經睇唔到日落。`,
  };
}

function walkToPavilion(
  arrive: number,
  walk: number,
  here: string,
  bearing: string,
  azimuth: number,
): Pick<SunsetVerdict, 'id' | 'title' | 'detail'> {
  const pace = `由呢度慢行上石龍拱涼亭大約 ${walk} 分鐘。${here}`;
  if (arrive > 15) {
    const early = arrive > 45 ? '你會早到。最靚光約喺日落前 45 分鐘先開始，之前可以慢慢休息。' : '到埗已經入咗最靚光。';
    return {
      id: 'see',
      title: '睇到',
      detail: `${pace}到埗之後仲有約 ${arrive} 分鐘先日落，趕得切。${early}${faceLine(bearing, azimuth)}`,
    };
  }
  if (arrive >= 0) {
    const leftThere = arrive === 0 ? '一到就係日落' : `到埗只剩約 ${arrive} 分鐘`;
    return {
      id: 'tight',
      title: '趕得切',
      detail: `${pace}${leftThere}，趕得切但好趕，冇時間慢慢擺位。${faceLine(bearing, azimuth)}`,
    };
  }
  if (arrive >= -20) {
    return {
      id: 'glow',
      title: '只剩餘暉',
      detail: `${pace}行到涼亭太陽已經落咗，最多睇到餘暉。深井海旁仲遠，都唔係呢個位嘅退路。`,
    };
  }
  return {
    id: 'miss',
    title: '趕唔切',
    detail: `${pace}日落前趕唔切三橋。深井海旁仲遠，都唔係呢個位嘅退路。`,
  };
}

function walkToSea(
  arrive: number,
  walk: number,
  passed: string,
  sign: string,
  bearing: string,
  azimuth: number,
): Pick<SunsetVerdict, 'id' | 'title' | 'detail'> {
  const pace = `${passed}行去深井青山公路近海一邊大約 ${walk} 分鐘。${sign}`;
  if (arrive > 15) {
    return {
      id: 'see',
      title: '睇到',
      detail: `${pace}到海旁仲有約 ${arrive} 分鐘先日落，望到地平線，但唔係三橋相。${faceLine(bearing, azimuth)}`,
    };
  }
  if (arrive >= 0) {
    return {
      id: 'tight',
      title: '趕得切',
      detail: `${pace}到海旁太陽就嚟落，趕得切但好趕，而且只係地平線，唔係三橋相。`,
    };
  }
  if (arrive >= -20) {
    return {
      id: 'glow',
      title: '只剩餘暉',
      detail: `${pace}落到海旁可能只剩餘暉。三橋位已經過咗。`,
    };
  }
  return {
    id: 'miss',
    title: '趕唔切',
    detail: `${pace}深井海旁都趕唔切。`,
  };
}

export function judgeSunset(input: {
  checkpointId: number;
  lat: number;
  lng: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}): SunsetVerdict {
  const solar = solarSunset(input.lat, input.lng, input.year, input.month, input.day);
  const now = input.hour * 60 + input.minute;
  const left = solar.sunsetClock - now;
  const bearing = bearingWords(solar.azimuth);
  const base = {
    sunsetLabel: formatClock(solar.sunsetClock),
    minutesUntilSunset: left,
    bearing: `${bearing}（約 ${Math.round(solar.azimuth)}°）`,
  };

  if (input.checkpointId === 3 || input.checkpointId === 4) {
    const where =
      input.checkpointId === 3
        ? '你已經喺石龍拱涼亭。企喺旁邊草坡影相，唔好走上鬆散嘅峰頂。'
        : '你已經喺觀景台，一樣向西開揚，人通常少過涼亭。';
    return { ...base, walkMinutes: null, walkTarget: null, ...spotNow(left, where, bearing, solar.azimuth) };
  }

  if (input.checkpointId === 1 || input.checkpointId === 2) {
    const walk = WALK_TO_PAVILION[input.checkpointId] ?? 60;
    const here =
      input.checkpointId === 1
        ? '港安呢邊望住荃灣同青衣，睇唔到三橋日落。'
        : '下花山望返荃灣海景，經典日落喺前面嘅石龍拱。';
    return {
      ...base,
      walkMinutes: walk,
      walkTarget: '石龍拱涼亭',
      ...walkToPavilion(left - walk, walk, here, bearing, solar.azimuth),
    };
  }

  if (input.checkpointId === 7) {
    const where = '深井村內街多數被樓擋住。要行到青山公路近海一邊，先望到地平線日落，嗰個唔係三橋相。';
    return { ...base, walkMinutes: null, walkTarget: null, ...spotNow(left, where, bearing, solar.azimuth) };
  }

  const walk = WALK_TO_SEA[input.checkpointId] ?? 60;
  const passed = '三橋日落位已經行過。呢度望唔到石龍拱嗰個西面海景，唔好為咗回頭再爬上山。';
  const sign =
    input.checkpointId === 5
      ? '若果落深井，清快塘一定要轉「深井」路牌，唔好再跟田夫仔去大棠。'
      : '落深井沿住石屎路行就得。';
  return {
    ...base,
    walkMinutes: walk,
    walkTarget: '深井近海',
    ...walkToSea(left - walk, walk, passed, sign, bearing, solar.azimuth),
  };
}
