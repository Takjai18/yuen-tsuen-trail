export type RouteMode = 'A' | 'B';
export type ThemeName = 'day' | 'sun' | 'dark';

export interface Checkpoint {
  id: number;
  title: string;
  subtitle: string;
  durationFromPrev: string;
  accumulatedTime: string;
  terrain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  signpost: string;
  instructions: string[];
  photoTip?: string;
  warning?: string;
  facilities?: string[];
  onlyInMode?: RouteMode;
  isDecisionPoint?: boolean;
  lat: number;
  lng: number;
  mapNote: string;
  shortLabel: string;
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    id: 1,
    title: '起點：荃灣港安醫院對面',
    subtitle: '元荃古道入口（引水道樓梯）',
    durationFromPrev: '起點',
    accumulatedTime: '0 分鐘',
    terrain: '長石級上斜（先苦後甜段）',
    difficulty: 'hard',
    signpost: '元荃古道 / 下花山',
    instructions: [
      '喺「荃灣港安醫院」巴士站落車後，過對面馬路就會見到上山石級入口。',
      '頭 10 至 15 分鐘全部都係上山樓梯，係成條路線最喘氣嘅一段！',
      '千祈唔好急，用最慢、最舒服嘅步速行，覺得喘就停低飲啖水，過咗呢段之後就全部都係輕鬆路！',
    ],
    warning: '呢度上山後好耐都冇正式洗手間，建議搭車前喺荃灣市區去定廁所先。',
    lat: 22.3763679,
    lng: 114.1047455,
    mapNote: '公開地圖巴士站「荃灣港安醫院」。石級入口喺對面馬路。',
    shortLabel: '港安',
  },
  {
    id: 2,
    title: '下花山涼亭及開揚石屎路',
    subtitle: '告別急斜，進入林蔭與開揚山徑',
    durationFromPrev: '約 15–20 分鐘',
    accumulatedTime: '約 20 分鐘',
    terrain: '平緩石屎村徑、小量緩坡',
    difficulty: 'easy',
    signpost: '元荃古道（沿主徑直行）',
    instructions: [
      '恭喜你！最辛苦嘅樓梯已經行完！接住落嚟係好舒服嘅平緩石屎路同埋林蔭路。',
      '沿途會經過一啲晨運客整嘅小花園同埋休息位，跟住主徑同埋「元荃古道」方向指示牌行就得。',
      '左手邊會開始見到荃灣同埋青衣一帶嘅海景越嚟越開揚。',
    ],
    photoTip: '沿途回望已經可以影到荃灣市景同藍巴勒海峽。',
    lat: 22.379509,
    lng: 114.0980354,
    mapNote: '公開地圖下花山山峰。涼亭喺主徑附近，唔係峰頂本身。',
    shortLabel: '下花山',
  },
  {
    id: 3,
    title: '石龍拱涼亭（三橋海景打卡位）',
    subtitle: '全線最靚景觀！重要路線分岔點',
    durationFromPrev: '約 35–40 分鐘',
    accumulatedTime: '約 1 小時',
    terrain: '開揚草坡、無遮擋山徑',
    difficulty: 'easy',
    signpost: '往深井請跟「田夫仔」｜折返請原路回「荃灣」',
    instructions: [
      '去到石龍拱涼亭，呢度擁有無敵視野，可以一次過望晒青馬大橋、汀九橋同埋昂船洲大橋！',
      '【路線抉擇時刻】：如果今日覺得體力夠晒數，可以喺度打完卡、吹夠風之後，原路行返落港安醫院（方案 A）。',
      '如果想繼續行去深井食燒鵝／炸魚塊米線（方案 B），休息完就跟住寫住「田夫仔」嘅路牌繼續前行。',
    ],
    photoTip:
      '📸 隱藏機位秘笈：喺石龍拱涼亭旁邊條小路行多幾步上去小草坡，人企喺草地偏下位置，叫朋友喺高少少嘅位用手機「人像模式（2x 或 3x 焦距）」影落去，就可以影到好有電影感嘅「大草地＋三橋大海景」同框靚相！',
    warning: '呢一段完全無樹蔭遮擋，太陽猛嗰陣記得補搽防曬同飲水。',
    isDecisionPoint: true,
    lat: 22.3802,
    lng: 114.0859,
    mapNote: '山峰西南參考點，附近約 410 米，同公開行山紀錄嘅涼亭高度相符。到埗認路牌。',
    shortLabel: '涼亭',
  },
  {
    id: 4,
    title: '石龍拱觀景台',
    subtitle: '官方觀景台與開闊山巒',
    durationFromPrev: '約 15 分鐘',
    accumulatedTime: '約 1 小時 15 分鐘',
    terrain: '平緩古道石級與泥石混和路',
    difficulty: 'easy',
    signpost: '田夫仔（元荃古道）',
    instructions: [
      '離開涼亭後跟住「田夫仔」方向行無耐，就會到達另一個觀景台。',
      '呢度同樣可以飽覽大嶼山、馬灣同埋汀九橋海景，人流通常比涼亭少啲，好適合慢慢影相。',
      '影完相繼續順住元荃古道主徑往「田夫仔」方向前進。',
    ],
    onlyInMode: 'B',
    lat: 22.3808,
    lng: 114.083,
    mapNote: '由涼亭沿「田夫仔」方向大約 15 分鐘嘅參考點，現場以觀景台為準。',
    shortLabel: '觀景台',
  },
  {
    id: 5,
    title: '清快塘（喜香農莊及公廁分岔口）',
    subtitle: '離開元荃古道，轉向深井嘅關鍵轉彎位！',
    durationFromPrev: '約 45–50 分鐘',
    accumulatedTime: '約 2 小時 05 分鐘',
    terrain: '林蔭下坡路轉入開揚村落草地',
    difficulty: 'easy',
    signpost: '⚠️ 轉向「深井」路牌（唔好再跟田夫仔行！）',
    instructions: [
      '行過一段舒服嘅林蔭路之後，會嚟到清快塘村，見到一片大草地同埋「喜香農莊」。',
      '農莊有時會開門賣豆腐花、飲品，亦有孔雀同羊仔可以睇（但注意未必日日開，唔好100%依賴佢做唯一水源）。',
      '【防迷路重點】：經過大草地同埋流動公廁／洗手間位置時，留意路牌！呢度要轉左跟住「深井」方向落山，千祈唔好再跟「田夫仔」行（繼續跟田夫仔會行咗去元朗大棠，要行多幾個鐘！）。',
    ],
    facilities: ['洗手間（公廁）', '喜香農莊（不定時營業補給）'],
    warning: '千祈唔好行錯去「田夫仔／大棠」方向！一定要認住「深井」路牌轉落山！',
    onlyInMode: 'B',
    lat: 22.3816421,
    lng: 114.0622063,
    mapNote: '公開地圖清快塘村落。分岔口喺草地同公廁附近，一定要認「深井」路牌。',
    shortLabel: '清快塘',
  },
  {
    id: 6,
    title: '深井沉澱池',
    subtitle: '開揚水塘景觀與下山石屎路',
    durationFromPrev: '約 30 分鐘',
    accumulatedTime: '約 2 小時 35 分鐘',
    terrain: '持續落斜石屎馬路',
    difficulty: 'medium',
    signpost: '深井',
    instructions: [
      '由清快塘轉落深井之後，全部都係鋪好晒嘅石屎小馬路，完全唔怕迷路。',
      '途中會經過「深井沉澱池」，環境好幽靜開揚，遠望青山公路一帶同埋海景，可以停低影張相。',
      '因為呢段全部係落斜石屎路，行嗰陣膝頭哥微曲、步幅細啲，減少對膝頭嘅衝擊。',
    ],
    photoTip: '沉澱池欄杆位置配埋背後嘅山谷同海景，構圖好乾淨舒服。',
    onlyInMode: 'B',
    lat: 22.3713637,
    lng: 114.0528042,
    mapNote: '公開地圖 Sham Tseng Settlement Basin（深井沉澱池）。',
    shortLabel: '沉澱池',
  },
  {
    id: 7,
    title: '終點：深井市中心（美食大本營）',
    subtitle: '完成行程！準備開餐醫肚',
    durationFromPrev: '約 25–30 分鐘',
    accumulatedTime: '約 3 至 3.5 小時',
    terrain: '市區平路',
    difficulty: 'easy',
    signpost: '青山公路 - 深井段 / 深井村',
    instructions: [
      '順住石屎路一直落到底，穿過深井村就會出到深井市中心（陳記燒鵝／裕記／各大茶記同米線舖附近）！',
      '你可以喺度大擦一餐深井燒鵝、手打炸魚塊米線或者豬扒麵，然後搭巴士或小巴舒舒服服返出去荃灣或市區。',
    ],
    facilities: ['大量餐廳食肆', '便利店', '巴士及小巴站'],
    onlyInMode: 'B',
    lat: 22.3668493,
    lng: 114.0591846,
    mapNote: '公開地圖巴士站「深井村」，青山公路深井段。',
    shortLabel: '深井',
  },
];

export interface ProfilePoint {
  id: string;
  km: number;
  elevation: number;
  label: string;
  checkpointId?: number;
  onlyInMode?: RouteMode;
  sourced: boolean;
}

// 港安、涼亭、沉澱池、深井用公開地圖或行山紀錄嘅高度。
// 樓梯頂、下花山主徑、觀景台、清快塘係按路程形狀畫嘅大約高度，用來睇斜度。
export const PROFILE: ProfilePoint[] = [
  { id: 'start', km: 0, elevation: 53, label: '港安', checkpointId: 1, sourced: true },
  { id: 'stairs', km: 0.6, elevation: 170, label: '樓梯', sourced: false },
  { id: 'hafa', km: 1.2, elevation: 240, label: '下花山', checkpointId: 2, sourced: false },
  { id: 'pavilion', km: 3.3, elevation: 410, label: '涼亭', checkpointId: 3, sourced: true },
  { id: 'view', km: 4.2, elevation: 360, label: '觀景台', checkpointId: 4, onlyInMode: 'B', sourced: false },
  { id: 'tft', km: 6.6, elevation: 200, label: '清快塘', checkpointId: 5, onlyInMode: 'B', sourced: false },
  { id: 'basin', km: 8.4, elevation: 127, label: '沉澱池', checkpointId: 6, onlyInMode: 'B', sourced: true },
  { id: 'end', km: 10.2, elevation: 7, label: '深井', checkpointId: 7, onlyInMode: 'B', sourced: true },
];

export function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export interface ChecklistItem {
  id: string;
  text: string;
  subtext: string;
  category: 'essential' | 'wear' | 'safety';
}

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'water', text: '飲用水（最少 1 至 1.5 公升）', subtext: '山上農莊未必開門，必須喺荃灣買定足夠水同運動飲品', category: 'essential' },
  { id: 'snacks', text: '輕便乾糧／朱古力／能量棒', subtext: '喺石龍拱吹風睇景時可以補充體力', category: 'essential' },
  { id: 'sun', text: '防曬用品、太陽眼鏡及帽', subtext: '石龍拱一帶好開揚無樹蔭，非常曬', category: 'essential' },
  { id: 'shoes', text: '舒適防滑運動鞋／行山鞋', subtext: '全程以石級同石屎路為主，著對平時行慣、鞋底有紋嘅波鞋就得', category: 'wear' },
  { id: 'jacket', text: '輕便風褸及紙巾／濕紙巾', subtext: '石龍拱山上好大風，停低影相時著返件風褸免著涼', category: 'wear' },
  { id: 'power', text: '手機充滿電 ＋ 尿袋（行動電源）', subtext: '影相打卡同睇呢個導航 App 都會用電', category: 'safety' },
  { id: 'octopus', text: '八達通及少量現金', subtext: '搭小巴巴士、或者喺農莊買豆腐花同深井食嘢用', category: 'safety' },
];

export const STORAGE_KEYS = {
  mode: 'yt_route_mode',
  steps: 'yt_completed_steps',
  checks: 'yt_checked_items',
  theme: 'yt_theme',
} as const;
