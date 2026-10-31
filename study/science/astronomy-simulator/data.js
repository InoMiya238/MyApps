/* 宇宙シミュレーターの共通データと天体の位置計算。
   グローバルは Astro ひとつだけ。
   - 惑星の軌道要素: JPL "Keplerian Elements for Approximate Positions of the Major Planets"
     (Standish, 1800〜2050年向け、J2000黄道座標)。
   - 天体の物理量: NASA Planetary Fact Sheet(半径は赤道半径。GM/R² で表面重力が出る)。
   - 月と太陽の位置: 天文年鑑の簡易式(誤差は月で0.3°程度、太陽で0.01°程度)。
   座標はすべてJ2000基準。歳差は無視している(星空の表示には十分)。 */
(function () {
  "use strict";

  const DEG = Math.PI / 180;
  const AU_KM = 149597870.7;
  const G = 6.674e-11;

  /* 軌道要素: [J2000の値, 1世紀あたりの変化]
     a: 軌道長半径(AU) e: 離心率 I: 軌道傾斜角(°) L: 平均黄経(°)
     peri: 近日点黄経 ϖ(°) node: 昇交点黄経 Ω(°) */
  const PLANETS = [
    { id: "mercury", name: "水星",
      a: [0.38709927, 0.00000037], e: [0.20563593, 0.00001906], I: [7.00497902, -0.00594749],
      L: [252.25032350, 149472.67411175], peri: [77.45779628, 0.16047689], node: [48.33076593, -0.12534081] },
    { id: "venus", name: "金星",
      a: [0.72333566, 0.00000390], e: [0.00677672, -0.00004107], I: [3.39467605, -0.00078890],
      L: [181.97909950, 58517.81538729], peri: [131.60246718, 0.00268329], node: [76.67984255, -0.27769418] },
    { id: "earth", name: "地球",
      a: [1.00000261, 0.00000562], e: [0.01671123, -0.00004392], I: [-0.00001531, -0.01294668],
      L: [100.46457166, 35999.37244981], peri: [102.93768193, 0.32327364], node: [0, 0] },
    { id: "mars", name: "火星",
      a: [1.52371034, 0.00001847], e: [0.09339410, 0.00007882], I: [1.84969142, -0.00813131],
      L: [-4.55343205, 19140.30268499], peri: [-23.94362959, 0.44441088], node: [49.55953891, -0.29257343] },
    { id: "jupiter", name: "木星",
      a: [5.20288700, -0.00011607], e: [0.04838624, -0.00013253], I: [1.30439695, -0.00183714],
      L: [34.39644051, 3034.74612775], peri: [14.72847983, 0.21252668], node: [100.47390909, 0.20469106] },
    { id: "saturn", name: "土星",
      a: [9.53667594, -0.00125060], e: [0.05386179, -0.00050991], I: [2.48599187, 0.00193609],
      L: [49.95424423, 1222.49362201], peri: [92.59887831, -0.41897216], node: [113.66242448, -0.28867794] },
    { id: "uranus", name: "天王星",
      a: [19.18916464, -0.00196176], e: [0.04725744, -0.00004397], I: [0.77263783, -0.00242939],
      L: [313.23810451, 428.48202785], peri: [170.95427630, 0.40805281], node: [74.01692503, 0.04240589] },
    { id: "neptune", name: "海王星",
      a: [30.06992276, 0.00026291], e: [0.00859048, 0.00005105], I: [1.77004347, 0.00035372],
      L: [-55.12002969, 218.45945325], peri: [44.96476227, -0.32241464], node: [131.78422574, -0.00508664] },
  ];

  /* 天体の物理量。GM: m³/s²、radius: 赤道半径 km、mass: kg、
     period: 公転周期(日、太陽と月はnull)、rotation: 自転周期(時間、負は逆回転) */
  const BODIES = [
    { id: "sun",     name: "太陽",   kind: "恒星",   GM: 1.32712440e20, radius: 695700, mass: 1.9885e30, period: null,    rotation: 609.12 },
    { id: "mercury", name: "水星",   kind: "惑星",   GM: 2.2032e13,     radius: 2440.5, mass: 3.3011e23, period: 87.969,  rotation: 1407.6 },
    { id: "venus",   name: "金星",   kind: "惑星",   GM: 3.24859e14,    radius: 6051.8, mass: 4.8675e24, period: 224.701, rotation: -5832.5 },
    { id: "earth",   name: "地球",   kind: "惑星",   GM: 3.986004e14,   radius: 6378.1, mass: 5.9724e24, period: 365.256, rotation: 23.934 },
    { id: "moon",    name: "月",     kind: "衛星",   GM: 4.9049e12,     radius: 1738.1, mass: 7.346e22,  period: null,    rotation: 655.72 },
    { id: "mars",    name: "火星",   kind: "惑星",   GM: 4.282837e13,   radius: 3396.2, mass: 6.4171e23, period: 686.980, rotation: 24.623 },
    { id: "jupiter", name: "木星",   kind: "惑星",   GM: 1.26686534e17, radius: 71492,  mass: 1.8982e27, period: 4332.59, rotation: 9.925 },
    { id: "saturn",  name: "土星",   kind: "惑星",   GM: 3.7931187e16,  radius: 60268,  mass: 5.6834e26, period: 10759.22, rotation: 10.656 },
    { id: "uranus",  name: "天王星", kind: "惑星",   GM: 5.793939e15,   radius: 25559,  mass: 8.6810e25, period: 30685.4, rotation: -17.24 },
    { id: "neptune", name: "海王星", kind: "惑星",   GM: 6.836529e15,   radius: 24764,  mass: 1.02413e26, period: 60189,  rotation: 16.11 },
    { id: "pluto",   name: "冥王星", kind: "準惑星", GM: 8.71e11,       radius: 1188.3, mass: 1.303e22,  period: 90560,   rotation: -153.29 },
  ];
  for (const b of BODIES) {
    const r = b.radius * 1000;
    b.gravity = b.GM / (r * r);              // 表面重力 m/s²
    b.escape = Math.sqrt(2 * b.GM / r) / 1000; // 脱出速度 km/s
  }

  // 月の軌道(平均値)
  const MOON = {
    synodic: 29.530589,   // 朔望月(日): 満ち欠けの周期
    sidereal: 27.321662,  // 恒星月(日): 公転周期
    inclination: 5.145,   // 黄道に対する傾き(°)
    perigee: 363300,      // 近地点距離 km(平均)
    apogee: 405500,       // 遠地点距離 km(平均)
    mean: 384400,         // 平均距離 km
    nodeRegression: 6798.38, // 交点が1周後退する日数(約18.6年)
  };

  const norm360 = (x) => ((x % 360) + 360) % 360;

  // Date → ユリウス日
  function julianDay(date) { return date.getTime() / 86400000 + 2440587.5; }
  // J2000.0 からのユリウス世紀
  function centuries(date) { return (julianDay(date) - 2451545.0) / 36525; }

  // ケプラー方程式 M = E − e sinE を解く(度で受け取り、ラジアンを返す)
  function solveKepler(Mdeg, e) {
    const M = norm360(Mdeg + 180) - 180;
    const Mr = M * DEG;
    let E = e < 0.8 ? Mr : Math.PI;
    for (let i = 0; i < 30; i++) {
      const d = (E - e * Math.sin(E) - Mr) / (1 - e * Math.cos(E));
      E -= d;
      if (Math.abs(d) < 1e-12) break;
    }
    return E;
  }

  function planet(id) { return PLANETS.find((p) => p.id === id); }
  function body(id) { return BODIES.find((b) => b.id === id); }

  // その日の軌道要素
  function elements(id, date) {
    const p = planet(id);
    const T = centuries(date);
    const v = (k) => p[k][0] + p[k][1] * T;
    return { a: v("a"), e: v("e"), I: v("I"), L: v("L"), peri: v("peri"), node: v("node") };
  }

  /* 太陽中心の黄道座標(AU)。x軸は春分点の方向。
     {x, y, z, r, lon(黄経°), M(平均近点角°), nu(真近点角°)} */
  function heliocentric(id, date) {
    const el = elements(id, date);
    const M = el.L - el.peri;
    const w = (el.peri - el.node) * DEG;
    const O = el.node * DEG;
    const I = el.I * DEG;
    const E = solveKepler(M, el.e);
    const xp = el.a * (Math.cos(E) - el.e);
    const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
    const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
    const x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp;
    const y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp;
    const z = (sw * sI) * xp + (cw * sI) * yp;
    return {
      x, y, z,
      r: Math.hypot(x, y, z),
      lon: norm360(Math.atan2(y, x) / DEG),
      M: norm360(M),
      nu: norm360(Math.atan2(yp, xp) / DEG),
    };
  }

  // 平均黄道傾斜角(°)
  function obliquity(date) { return 23.439291 - 0.0130042 * centuries(date); }

  // 黄道座標(黄経・黄緯°)→ 赤道座標(赤経・赤緯°)
  function eclToEq(lon, lat, date) {
    const e = obliquity(date) * DEG;
    const l = lon * DEG, b = lat * DEG;
    const x = Math.cos(b) * Math.cos(l);
    const y = Math.cos(b) * Math.sin(l) * Math.cos(e) - Math.sin(b) * Math.sin(e);
    const z = Math.cos(b) * Math.sin(l) * Math.sin(e) + Math.sin(b) * Math.cos(e);
    return { ra: norm360(Math.atan2(y, x) / DEG), dec: Math.asin(z) / DEG };
  }

  /* 地球から見た惑星の位置。{ra, dec(°), lon, lat(黄経・黄緯°), dist(AU)} */
  function geocentric(id, date) {
    const p = heliocentric(id, date);
    const e = heliocentric("earth", date);
    const x = p.x - e.x, y = p.y - e.y, z = p.z - e.z;
    const dist = Math.hypot(x, y, z);
    const lon = norm360(Math.atan2(y, x) / DEG);
    const lat = Math.asin(z / dist) / DEG;
    return Object.assign({ lon, lat, dist }, eclToEq(lon, lat, date));
  }

  /* 太陽の位置(地球から)。{lon(黄経°), ra, dec, dist(AU)} */
  function sun(date) {
    const n = julianDay(date) - 2451545.0;
    const L = norm360(280.460 + 0.9856474 * n);
    const g = (357.528 + 0.9856003 * n) * DEG;
    const lon = norm360(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    const dist = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g);
    return Object.assign({ lon, lat: 0, dist }, eclToEq(lon, 0, date));
  }

  /* 月の位置(地球中心)。{lon, lat, ra, dec(°), dist(km)} */
  function moon(date) {
    const T = centuries(date);
    const s = (a, b) => Math.sin((a + b * T) * DEG);
    const c = (a, b) => Math.cos((a + b * T) * DEG);
    const lon = norm360(218.32 + 481267.881 * T
      + 6.29 * s(135.0, 477198.87) - 1.27 * s(259.3, -413335.36)
      + 0.66 * s(235.7, 890534.22) + 0.21 * s(269.9, 954397.74)
      - 0.19 * s(357.5, 35999.05) - 0.11 * s(186.5, 966404.03));
    const lat = 5.13 * s(93.3, 483202.02) + 0.28 * s(228.2, 960400.89)
      - 0.28 * s(318.3, 6003.15) - 0.17 * s(217.6, -407332.21);
    const par = 0.9508 + 0.0518 * c(135.0, 477198.87) + 0.0095 * c(259.3, -413335.36)
      + 0.0078 * c(235.7, 890534.22) + 0.0028 * c(269.9, 954397.74);
    const dist = 6378.14 / Math.sin(par * DEG);
    return Object.assign({ lon, lat, dist }, eclToEq(lon, lat, date));
  }

  /* 月の満ち欠け。elongation: 太陽からの黄経差(0=新月, 180=満月)、
     age: 月齢の目安(日)、illum: 輝面率(0〜1) */
  function moonPhase(date) {
    const m = moon(date), su = sun(date);
    const elong = norm360(m.lon - su.lon);
    const cosE = Math.cos(m.lat * DEG) * Math.cos(elong * DEG);
    return {
      elongation: elong,
      age: elong / 360 * MOON.synodic,
      illum: (1 - cosE) / 2,
    };
  }

  // 地方恒星時(°)。lonDeg は東経を正
  function siderealTime(date, lonDeg) {
    const d = julianDay(date) - 2451545.0;
    const T = d / 36525;
    const gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T;
    return norm360(gmst + lonDeg);
  }

  /* 赤道座標 → 地平座標。{alt(高度°), az(方位°、北=0、東=90)} */
  function toHorizontal(ra, dec, latDeg, lstDeg) {
    const H = (lstDeg - ra) * DEG;
    const d = dec * DEG, f = latDeg * DEG;
    const sinAlt = Math.sin(d) * Math.sin(f) + Math.cos(d) * Math.cos(f) * Math.cos(H);
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    const y = -Math.cos(d) * Math.sin(H);
    const x = Math.sin(d) * Math.cos(f) - Math.cos(d) * Math.sin(f) * Math.cos(H);
    return { alt: alt / DEG, az: norm360(Math.atan2(y, x) / DEG) };
  }

  // ケプラーの第3法則: 軌道長半径 a(AU)→ 公転周期(年)
  function periodYears(a) { return Math.pow(a, 1.5); }

  window.Astro = {
    DEG, AU_KM, G, PLANETS, BODIES, MOON,
    planet, body, norm360, julianDay, centuries, solveKepler, elements,
    heliocentric, geocentric, obliquity, eclToEq, sun, moon, moonPhase,
    siderealTime, toHorizontal, periodYears,
  };
})();
