import { Bus, ExternalLink, Phone, Utensils } from 'lucide-react';

function mapsSearch(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function EatsPanel() {
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Bus className="h-5 w-5 text-[var(--accent)]" />
          起點交通：點樣去「荃灣港安醫院」？
        </h2>
        <p className="text-xs text-[var(--muted)]">
          落車站名認住<strong className="text-[var(--text)]">「荃灣港安醫院 (Tsuen Wan Adventist Hospital)」</strong>，落車後過對面馬路引水道旁就係上山石級入口。
        </p>
        <div className="space-y-2 text-xs">
          <div className="rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3">
            <div className="font-bold text-[var(--accent-soft-text)]">🚐 專線小巴（最快最密）</div>
            <p className="mt-1">
              <strong>84 號小巴：</strong>由荃灣眾安街（千色匯附近）開出，途經港安醫院，車程約 10 分鐘。
            </p>
          </div>
          <div className="rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3">
            <div className="font-bold text-[var(--accent-soft-text)]">🚌 九巴路線（港鐵荃灣站／荃灣西站上車）</div>
            <p className="mt-1">
              可乘搭 <strong>30、30X、39A、39M</strong> 等途經荃景圍／港安醫院嘅巴士，喺「荃灣港安醫院」站落車。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Utensils className="h-5 w-5 text-[var(--profile-steep)]" />
          深井餐廳推介
        </h2>
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          行完落到深井先食。下面地址同電話對過店方或 OpenRice 公開資料。開門時間會變，出發前再打去問。以上只供參考。
        </p>

        <div className="rounded-xl border-[length:var(--bw)] border-[var(--amber-line)] bg-[var(--amber-bg)] p-3 text-xs text-[var(--amber-text)]">
          <div className="text-sm font-bold">🍜 手打炸魚塊／腐皮墨魚丸米線</div>
          <p className="mt-1 leading-relaxed">
            影片重點推介！深井街頭人氣米線小店（如文記／本地特色粉麵店），必點即叫即炸嘅香脆手打炸魚塊、炸腐皮同埋海鮮米線，行完山飲啖熱湯超滿足！沿深井村睇，呢度未核實某一間舖嘅門牌。
          </p>
        </div>

        <article className="space-y-2 rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3 text-xs">
          <h3 className="text-sm font-bold">裕記大飯店</h3>
          <p className="leading-relaxed text-[var(--muted)]">
            1958 年炭火燒鵝。深井深康路 9 號。官網寫星期一至日同公眾假期，午市 11:00–16:30，晚市 16:30–22:00。有停車場。坐低食會貴過落山食個盒飯。
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="tel:+85224910105" className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 font-bold text-[var(--accent-text)]">
              <Phone className="h-3.5 w-3.5" />
              2491 0105
            </a>
            <a
              href={mapsSearch('裕記大飯店 深井深康路9號')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border-[length:var(--bw)] border-[var(--line)] px-2.5 py-1.5 font-bold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              地圖
            </a>
          </div>
        </article>

        <article className="space-y-2 rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3 text-xs">
          <h3 className="text-sm font-bold">深井陳記燒鵝海鮮酒家（深井村老店）</h3>
          <p className="leading-relaxed text-[var(--muted)]">
            行山落到「深井村」巴士站附近呢間。地址係青山公路–深井段深井村 63 號地舖。官網寫每日 11:00–23:00；OpenRice 寫 07:00–22:00。兩個時間唔同，落山前打去問。
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="tel:+85224910722" className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 font-bold text-[var(--accent-text)]">
              <Phone className="h-3.5 w-3.5" />
              2491 0722
            </a>
            <a
              href={mapsSearch('深井陳記燒鵝海鮮酒家 深井村63號')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border-[length:var(--bw)] border-[var(--line)] px-2.5 py-1.5 font-bold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              地圖
            </a>
          </div>
        </article>

        <article className="space-y-2 rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3 text-xs">
          <h3 className="text-sm font-bold">陳記燒鵝（陳記商業中心，另一間）</h3>
          <p className="leading-relaxed text-[var(--muted)]">
            青山公路–深井段 48 號陳記商業中心地下。官網寫每日 11:00–23:00。呢間唔係深井村 63 號嗰間，唔好行錯。
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="tel:+85224168893" className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 font-bold text-[var(--accent-text)]">
              <Phone className="h-3.5 w-3.5" />
              2416 8893
            </a>
            <a
              href={mapsSearch('陳記燒鵝 青山公路48號陳記商業中心')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border-[length:var(--bw)] border-[var(--line)] px-2.5 py-1.5 font-bold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              地圖
            </a>
          </div>
        </article>

        <div className="rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3 text-xs">
          <div className="text-sm font-bold">能記</div>
          <p className="mt-1 leading-relaxed text-[var(--muted)]">
            路線原本提過能記，同裕記、陳記一齊路過可以睇下。呢度未核到一間地址清楚、而家仲營業嘅能記，所以唔寫地址。
          </p>
        </div>

        <div className="rounded-xl border-[length:var(--bw)] border-[var(--line)] bg-[var(--chip)] p-3 text-xs">
          <div className="text-sm font-bold">🥩 本地茶餐廳香煎豬扒麵 ＋ 凍檸茶</div>
          <p className="mt-1 leading-relaxed text-[var(--muted)]">
            深井村內有多間傳統茶記同冰室，一個人行山想快食，叫碗香煎豬扒公仔麵配杯大凍檸茶就最嘆。
          </p>
        </div>

        <div className="border-t border-[var(--line)] pt-2 text-xs text-[var(--muted)]">
          <span className="font-bold text-[var(--text)]">🚌 深井回程交通：</span>
          青山公路（深井段）有大量巴士（如 52X 往旺角、53 往荃灣、234A / 234B 往荃灣西站、952 過海往港島）及小巴（96 / 96M 往荃灣港鐵站），班次極密。
        </div>
      </div>
    </div>
  );
}
