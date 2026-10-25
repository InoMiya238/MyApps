// 「オーダー図鑑」共有データ。
// value は基準単位(m・kg・s・個)での値。桁(exp)は表示する単位ごとに計算する。
// units: 切り替えられる単位。factor は基準単位でいくつ分か。auto は「身近な単位」の自動選択に使う。
// prefer: 身近な単位を自動選択せず、この単位で表す。
const OOM_DATA = {
  length: {
    label: "長さ・大きさ",
    short: "長さ",
    icon: "📏",
    base: "m",
    units: [
      { id: "nm", label: "nm", name: "ナノメートル", factor: 1e-9, auto: true },
      { id: "um", label: "μm", name: "マイクロメートル", factor: 1e-6, auto: true },
      { id: "mm", label: "mm", name: "ミリメートル", factor: 1e-3, auto: true },
      { id: "cm", label: "cm", name: "センチメートル", factor: 1e-2 },
      { id: "m", label: "m", name: "メートル", factor: 1, auto: true },
      { id: "km", label: "km", name: "キロメートル", factor: 1e3, auto: true },
      { id: "au", label: "天文単位", name: "天文単位(地球〜太陽)", factor: 1.496e11 },
      { id: "ly", label: "光年", name: "光年", factor: 9.461e15 },
    ],
    items: [
      { value: 1.7e-15, prefer: "m", name: "陽子", emoji: "⚛️", note: "原子核をつくる粒子の一つ" },
      { value: 1e-10, prefer: "nm", name: "原子", emoji: "🔬", note: "すべての物質の最小単位" },
      { value: 2e-9, name: "DNAの直径", emoji: "🧬", note: "遺伝情報を記録する二重らせん" },
      { value: 1e-7, name: "インフルエンザウイルス", emoji: "🦠", note: "光学顕微鏡でも見えないほど小さい" },
      { value: 7e-6, name: "赤血球", emoji: "🩸", note: "血液中を流れる細胞" },
      { value: 7e-5, name: "髪の毛の太さ", emoji: "💇", note: "人の髪の毛1本の直径" },
      { value: 5e-3, name: "米粒", emoji: "🌾", note: "お米1粒の大きさ" },
      { value: 1e-2, prefer: "cm", name: "指の爪", emoji: "💅", note: "人差し指の爪1枚分の幅" },
      { value: 1.5e-1, prefer: "cm", name: "スマートフォン", emoji: "📱", note: "手のひらサイズの機器の長さ" },
      { value: 1.7, name: "人の身長", emoji: "🧍", note: "成人の平均的な身長" },
      { value: 1e1, name: "電柱の高さ", emoji: "⚡", note: "街でよく見る電柱の高さ" },
      { value: 1e2, name: "サッカーコートの長さ", emoji: "⚽", note: "競技場のフィールドの長さ" },
      { value: 3.8e3, prefer: "m", name: "富士山の高さ", emoji: "🗻", note: "日本で最も高い山(3776m)" },
      { value: 3e4, name: "東京〜横浜間の距離", emoji: "🚃", note: "隣接する都市までの距離" },
      { value: 4e5, name: "東京〜大阪間の距離", emoji: "🚄", note: "新幹線でおよそ2時間半" },
      { value: 6.4e6, name: "地球の半径", emoji: "🌍", note: "地球の中心から表面までの距離" },
      { value: 4e7, name: "地球一周の距離", emoji: "🛰️", note: "赤道に沿って地球を1周する距離" },
      { value: 3.8e8, name: "地球から月までの距離", emoji: "🌕", note: "地球の唯一の衛星までの距離" },
      { value: 1.4e9, name: "太陽の直径", emoji: "☀️", note: "地球の約109倍の大きさ" },
      { value: 1.5e11, name: "地球から太陽までの距離", emoji: "🌞", note: "この距離を1天文単位(AU)と呼ぶ" },
      { value: 4.5e12, name: "太陽系の広がり(海王星軌道)", emoji: "🪐", note: "太陽から海王星まで約30天文単位" },
      { value: 9.5e15, name: "1光年", emoji: "✨", note: "光が1年かけて進む距離" },
      { value: 1e21, prefer: "ly", name: "天の川銀河の直径", emoji: "🌌", note: "太陽系が属する銀河の大きさ(約10万光年)" },
    ],
  },
  mass: {
    label: "質量",
    short: "質量",
    icon: "⚖️",
    base: "kg",
    units: [
      { id: "mg", label: "mg", name: "ミリグラム", factor: 1e-6, auto: true },
      { id: "g", label: "g", name: "グラム", factor: 1e-3, auto: true },
      { id: "kg", label: "kg", name: "キログラム", factor: 1, auto: true },
      { id: "t", label: "t", name: "トン", factor: 1e3, auto: true },
    ],
    items: [
      { value: 1.7e-27, prefer: "kg", name: "陽子", emoji: "⚛️", note: "原子核を構成する粒子の質量" },
      { value: 3e-26, prefer: "kg", name: "水分子1個", emoji: "💧", note: "H₂O分子1個分の質量" },
      { value: 1e-19, prefer: "g", name: "インフルエンザウイルス", emoji: "🦠", note: "非常に軽いウイルスの質量" },
      { value: 1e-15, prefer: "g", name: "大腸菌1個", emoji: "🧫", note: "細菌1個分の質量" },
      { value: 1e-11, prefer: "g", name: "花粉1粒", emoji: "🌼", note: "植物の花粉1粒の質量(数〜数十ナノグラム)" },
      { value: 2e-6, name: "蚊1匹", emoji: "🦟", note: "小さな昆虫1匹の質量" },
      { value: 2e-5, name: "米粒1粒", emoji: "🌾", note: "お米1粒分の質量" },
      { value: 1e-3, name: "クリップ1個", emoji: "📎", note: "文房具の小さな金具" },
      { value: 6e-2, name: "卵1個", emoji: "🥚", note: "鶏卵Mサイズ1個分" },
      { value: 2e-1, name: "りんご1個", emoji: "🍎", note: "果物1個分の質量" },
      { value: 1, name: "水1リットル", emoji: "🍶", note: "ペットボトル飲料1本分" },
      { value: 6e1, name: "人間(成人)", emoji: "🧍", note: "成人の平均的な体重" },
      { value: 2e2, name: "冷蔵庫", emoji: "🧊", note: "家庭用冷蔵庫1台の質量" },
      { value: 1e3, prefer: "kg", name: "軽自動車", emoji: "🚗", note: "小型自動車1台の質量" },
      { value: 2e4, name: "大型トラック", emoji: "🚚", note: "積載時の大型トラックの質量" },
      { value: 1.5e5, name: "シロナガスクジラ", emoji: "🐋", note: "地球最大の動物" },
      { value: 3e8, name: "大型タンカー", emoji: "🚢", note: "満載時の大型タンカーの質量" },
      { value: 6e24, prefer: "kg", name: "地球", emoji: "🌍", note: "地球全体の質量" },
      { value: 2e30, prefer: "kg", name: "太陽", emoji: "☀️", note: "太陽系の質量の99.8%を占める" },
      { value: 1e41, prefer: "kg", name: "天の川銀河(恒星の総質量)", emoji: "🌌", note: "銀河系に含まれる星々の質量の合計(暗黒物質を含めると約10⁴² kg)" },
    ],
  },
  time: {
    label: "時間",
    short: "時間",
    icon: "⏱️",
    base: "s",
    units: [
      { id: "ns", label: "ns", name: "ナノ秒", factor: 1e-9, auto: true },
      { id: "ms", label: "ms", name: "ミリ秒", factor: 1e-3, auto: true },
      { id: "s", label: "秒", name: "秒", factor: 1, auto: true },
      { id: "min", label: "分", name: "分", factor: 60, auto: true },
      { id: "h", label: "時間", name: "時間", factor: 3600, auto: true },
      { id: "day", label: "日", name: "日", factor: 86400, auto: true },
      { id: "year", label: "年", name: "年", factor: 3.156e7, auto: true },
    ],
    items: [
      { value: 1e-9, name: "CPUが1回処理する時間", emoji: "💻", note: "1GHzのコンピュータの1クロック" },
      { value: 1e-3, name: "カメラのフラッシュの発光", emoji: "📸", note: "一瞬光るフラッシュの発光時間" },
      { value: 3e-1, name: "まばたき1回", emoji: "😉", note: "目を閉じて開けるまでの時間" },
      { value: 4, name: "深呼吸1回", emoji: "🫁", note: "ゆっくり息を吸って吐く時間" },
      { value: 1e1, name: "100m走のタイム", emoji: "🏃", note: "トップ選手が走りきる時間" },
      { value: 1.8e2, name: "電子レンジで温める時間", emoji: "🍱", note: "お弁当を温める目安の時間" },
      { value: 2.7e3, name: "授業1コマ", emoji: "🏫", note: "45分間の授業時間" },
      { value: 8.64e4, prefer: "h", name: "1日", emoji: "🌗", note: "24時間の長さ" },
      { value: 6.05e5, name: "1週間", emoji: "📅", note: "7日間の長さ" },
      { value: 2.59e6, name: "1ヶ月", emoji: "🗓️", note: "約30日間の長さ" },
      { value: 3.156e7, prefer: "day", name: "1年", emoji: "🎍", note: "地球が太陽を1周する時間" },
      { value: 2.525e9, name: "人の一生(80年)", emoji: "👴", note: "人の平均寿命ほどの時間" },
      { value: 1.578e11, name: "文明の歴史(約5000年)", emoji: "🏺", note: "文字が使われ始めてからの時間" },
      { value: 2.083e15, name: "恐竜が絶滅してからの年月", emoji: "🦖", note: "約6600万年前の出来事" },
      { value: 4.355e17, name: "宇宙の年齢", emoji: "🌌", note: "ビッグバンから現在までの時間(約138億年)" },
    ],
  },
  quantity: {
    label: "個数・数",
    short: "個数",
    icon: "🔢",
    base: "",
    units: [
      { id: "one", label: "そのまま", name: "1個単位", factor: 1, auto: true },
      { id: "man", label: "万", name: "万(10⁴)", factor: 1e4 },
      { id: "oku", label: "億", name: "億(10⁸)", factor: 1e8 },
      { id: "cho", label: "兆", name: "兆(10¹²)", factor: 1e12 },
    ],
    items: [
      { value: 4, name: "家族の人数", emoji: "👨‍👩‍👧", note: "一般的な家族の人数" },
      { value: 3e1, name: "クラスの人数", emoji: "🏫", note: "学校の1クラスの生徒数" },
      { value: 2e2, name: "学年全体の人数", emoji: "🎒", note: "同じ学年の生徒数" },
      { value: 1e3, name: "学校全体の生徒数", emoji: "🏫", note: "1つの学校に通う生徒数" },
      { value: 2e4, name: "町の人口", emoji: "🏘️", note: "小さな町の人口" },
      { value: 3e5, name: "中規模都市の人口", emoji: "🏙️", note: "地方都市の人口の目安" },
      { value: 5e6, name: "都道府県の人口", emoji: "🗾", note: "1つの県に住む人の数" },
      { value: 1.4e7, name: "東京都の人口", emoji: "🌆", note: "日本で最も人口の多い都道府県" },
      { value: 1.2e8, name: "日本の人口", emoji: "🇯🇵", note: "日本全体に住む人の数" },
      { value: 8e9, name: "世界の人口", emoji: "🌏", note: "地球上の全人類の数" },
      { value: 2e11, name: "天の川銀河の恒星の数", emoji: "⭐", note: "銀河系に含まれる星の数" },
      { value: 3.7e13, name: "人体の細胞の数", emoji: "🧫", note: "人間の体をつくる細胞の総数" },
      { value: 6.02e23, name: "1molの粒子の数", emoji: "🧪", note: "アボガドロ数。化学で使う物質量の単位" },
      { value: 1e80, name: "観測可能な宇宙の原子の総数", emoji: "🌌", note: "宇宙にある原子をすべて数えた概算" },
    ],
  },
};

// 上付き数字を含む "10ⁿ" 表記を作る
function formatExp(exp) {
  const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const str = String(exp).split("").map((c) => map[c] ?? c).join("");
  return "10" + str;
}

// 桁 = floor(log10(x))。割り算の誤差で 999.999… になっても正しい桁にする
function orderOf(x) {
  const e = Math.floor(Math.log10(x));
  const m = x / Math.pow(10, e);
  if (m >= 9.9999999999) return e + 1;
  if (m < 0.9999999999) return e - 1;
  return e;
}

// 有効数字3桁までに丸めた仮数と桁
function splitSci(x) {
  let e = orderOf(x);
  const raw = x / Math.pow(10, e);
  // 丸めで 10 になって桁が変わらないよう、必要なら桁数を増やす(9999 → 9.999)
  let p = 3;
  let m = Number(raw.toPrecision(p));
  while (m >= 10 && p < 15) m = Number(raw.toPrecision(++p));
  return { m, e };
}

// 数値の表記。1e-3〜1e4 は普通の小数、それ以外は 1.5×10⁸
function formatNum(x) {
  const { m, e } = splitSci(x);
  if (e >= -3 && e < 4) return String(Number((m * Math.pow(10, e)).toPrecision(15)));
  return (m === 1 ? "" : m + "×") + formatExp(e);
}

// 漢数字の位(万・億・兆…)を使った表記。1万未満や 10²⁴ 以上は null
function formatJa(x) {
  if (x < 1e4 || x >= 1e24) return null;
  const { m, e } = splitSci(x);
  const n = Math.round(m * 100) * Math.pow(10, e - 2); // 有効数字3桁の整数
  const ranks = [["垓", 1e20], ["京", 1e16], ["兆", 1e12], ["億", 1e8], ["万", 1e4]];
  let rest = n;
  let out = "";
  for (const [ch, size] of ranks) {
    const q = Math.floor(rest / size + 1e-9);
    if (q > 0) { out += q + ch; rest -= q * size; }
  }
  if (rest >= 1) out += Math.round(rest);
  return out;
}

function unitOf(catKey, unitId) {
  const cat = OOM_DATA[catKey];
  return cat.units.find((u) => u.id === unitId) || cat.units.find((u) => u.factor === 1);
}

// その単位での桁
function expIn(item, unit) {
  return orderOf(item.value / unit.factor);
}

// 身近な単位: prefer があればそれ、なければ値以下で最大の単位(auto のもの)
function naturalUnit(catKey, item) {
  const cat = OOM_DATA[catKey];
  if (item.prefer) return unitOf(catKey, item.prefer);
  const autos = cat.units.filter((u) => u.auto);
  let best = autos[0];
  for (const u of autos) if (item.value / u.factor >= 0.9999999) best = u;
  return best;
}

// 数値の文字に単位を付ける(英字の単位だけ間をあける)
function withUnit(text, unit) {
  if (unit.id === "one") return text;
  return text + (/^[a-zμ]/i.test(unit.label) ? " " : "") + unit.label;
}

// 単位付きの値の表記(例: "1.5×10⁸ km")
function formatValue(x, unit) {
  return withUnit(formatNum(x), unit);
}

// 身近な単位での読みやすい表記(例: "1億5000万 km")
function friendlyText(catKey, item) {
  const u = naturalUnit(catKey, item);
  const v = item.value / u.factor;
  return withUnit(formatJa(v) || formatNum(v), u);
}

// 基準単位での桁を items に持たせる(並べ替え・クイズ用)
for (const cat of Object.values(OOM_DATA)) {
  for (const it of cat.items) it.exp = orderOf(it.value);
}
