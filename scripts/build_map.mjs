// 生成幕 7 地图（运行一次即可）：node scripts/build_map.mjs
// 输出：public/assets/map/china.svg —— 一张“基准画幅 1280×720”的完整中国地图
//       （周边陆地为淡色底，中国各省在上层，南海诸岛放在右下角小框）
//       src/map-meta.json —— 运行时把经纬度换算成基准坐标的投影参数
// 更新地图后执行 python scripts/rasterize_map.py，重建幕 7 使用的两张 WebP 底图。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { geoMercator, geoPath } from 'd3-geo'

const here = path.dirname(fileURLToPath(import.meta.url))
const site = path.resolve(here, '..')
const outDir = path.join(site, 'public/assets/map')
fs.mkdirSync(outDir, { recursive: true })

const W = 1280, H = 720
const SUPER = 4 // 坐标放大 4 倍后取整，保证镜头放大 3~4 倍时边界依然平滑
const REGION = { west: 108.0, east: 126.7, south: 27.2, north: 36.2 } // 华中—江南特写范围

const read = (f) => JSON.parse(fs.readFileSync(path.join(site, '.cache/map', f), 'utf8'))
const china = read('china_full.json')
const land = read('ne_50m_land.json')

// DataV 为 RFC7946 右手环，d3 需要反向
const rev = (ring) => ring.slice().reverse()
function rewind(g) {
  if (g.type === 'Polygon') g.coordinates = g.coordinates.map(rev)
  if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map((p) => p.map(rev))
  return g
}
// 抽稀：相邻点曼哈顿距离小于 tol 度则丢弃
function thin(g, tol) {
  const t = (ring) => {
    if (ring.length < 8) return ring
    const out = [ring[0]]
    for (let i = 1; i < ring.length - 1; i++) {
      const [x, y] = ring[i], [px, py] = out[out.length - 1]
      if (Math.abs(x - px) + Math.abs(y - py) > tol) out.push(ring[i])
    }
    out.push(ring[ring.length - 1])
    return out.length >= 4 ? out : ring
  }
  if (g.type === 'Polygon') g.coordinates = g.coordinates.map(t)
  if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map((p) => p.map(t))
  return g
}

const DETAIL = new Set(['湖北省', '安徽省', '江西省', '河南省', '浙江省', '江苏省', '上海市', '湖南省', '山东省', '福建省'])
const provinces = []
let nineDash = null
for (const f of china.features) {
  const g = rewind(structuredClone(f.geometry))
  if (!f.properties.name) { nineDash = g; continue }
  provinces.push({ name: f.properties.name, g: thin(g, DETAIL.has(f.properties.name) ? 0.008 : 0.04) })
}

// ---------- 主投影：全国视角铺在 1280×720 中（北纬 17.5°~54°，东经 73°~135°）----------
const proj = geoMercator()
const fitBox = { type: 'Feature', geometry: rewind({ type: 'Polygon', coordinates: [[[73, 17.5], [135, 17.5], [135, 54], [73, 54], [73, 17.5]]] }) }
proj.fitExtent([[40, 24], [W - 40, H - 24]], fitBox)
proj.clipExtent([[0, 0], [W, H]])
const sp = geoMercator().scale(proj.scale() * SUPER).translate(proj.translate().map((v) => v * SUPER)).center(proj.center())
  .clipExtent([[0, 0], [W * SUPER, H * SUPER]])
const P = geoPath(sp).digits(0)

// 周边陆地（淡色）：只保留视野内的大陆块
let landPaths = ''
for (const f of land.features) {
  const d = P(f)
  if (d && d.length > 20) landPaths += `<path d="${d}"/>`
}
let provPaths = ''
for (const { name, g } of provinces) {
  const d = P({ type: 'Feature', geometry: g })
  if (d) provPaths += `<path data-name="${name}" d="${d}"/>\n`
}

// ---------- 南海诸岛小框（右下角）----------
const inset = { x: W - 150, y: H - 196, w: 120, h: 170 }
const ip = geoMercator()
const insetBox = { type: 'Feature', geometry: rewind({ type: 'Polygon', coordinates: [[[106, 2.5], [124, 2.5], [124, 24.5], [106, 24.5], [106, 2.5]]] }) }
ip.fitExtent([[(inset.x + 4) * SUPER, (inset.y + 4) * SUPER], [(inset.x + inset.w - 4) * SUPER, (inset.y + inset.h - 4) * SUPER]], insetBox)
ip.clipExtent([[inset.x * SUPER, inset.y * SUPER], [(inset.x + inset.w) * SUPER, (inset.y + inset.h) * SUPER]])
const IP = geoPath(ip).digits(0)
let insetLand = '', insetProv = ''
for (const f of land.features) { const d = IP(f); if (d && d.length > 20) insetLand += `<path d="${d}"/>` }
for (const { g } of provinces) { const d = IP({ type: 'Feature', geometry: g }); if (d) insetProv += `<path d="${d}"/>` }
const insetDash = nineDash ? IP({ type: 'Feature', geometry: nineDash }) : ''

const S = SUPER
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * S} ${H * S}" width="${W}" height="${H}">
<rect width="${W * S}" height="${H * S}" fill="#274C5E"/>
<g fill="#BFAE8A" stroke="#A8966F" stroke-width="${0.8 * S}">${landPaths}</g>
<g fill="#EAD7B1" stroke="#9E7F55" stroke-width="${0.9 * S}" stroke-linejoin="round">
${provPaths}</g>
<g>
<rect x="${inset.x * S}" y="${inset.y * S}" width="${inset.w * S}" height="${inset.h * S}" fill="#274C5E" stroke="#E5D2B0" stroke-width="${1.5 * S}"/>
<g fill="#BFAE8A">${insetLand}</g>
<g fill="#EAD7B1" stroke="#9E7F55" stroke-width="${0.5 * S}">${insetProv}</g>
<path d="${insetDash}" fill="#E5D2B0" stroke="#E5D2B0" stroke-width="${0.6 * S}"/>
</g>
</svg>`
fs.writeFileSync(path.join(outDir, 'china.svg'), svg)
for (const old of ['region.svg', 'china_mini.svg']) { const p = path.join(outDir, old); if (fs.existsSync(p)) fs.unlinkSync(p) }
const oldMeta = path.join(site, 'src/assets-map-meta.json'); if (fs.existsSync(oldMeta)) fs.unlinkSync(oldMeta)

// ---------- 运行时参数 ----------
const [rx0, ry0] = proj([REGION.west, REGION.north])
const [rx1, ry1] = proj([REGION.east, REGION.south])
const meta = {
  width: W, height: H,
  projection: { scale: proj.scale(), translate: proj.translate(), center: proj.center() },
  region: { x: rx0, y: ry0, w: rx1 - rx0, h: ry1 - ry0, zoom: Math.min(W / (rx1 - rx0), H / (ry1 - ry0)) },
}
fs.writeFileSync(path.join(site, 'src/map-meta.json'), JSON.stringify(meta, null, 2))

console.log('china.svg', (fs.statSync(path.join(outDir, 'china.svg')).size / 1024).toFixed(0) + 'KB')
console.log('region zoom', meta.region.zoom.toFixed(2), meta.region)
const cities = { 武汉: [114.30, 30.59], 宏村: [117.99, 30.00], 庐山: [115.98, 29.56], 南昌: [115.86, 28.68], 开封: [114.31, 34.80], 杭州: [120.16, 30.27], 苏州: [120.62, 31.30] }
for (const [n, c] of Object.entries(cities)) {
  const [x, y] = proj(c)
  const z = meta.region.zoom
  console.log(n, 'base', x.toFixed(0), y.toFixed(0), ' zoomed', ((x - rx0) * z).toFixed(0), ((y - ry0) * z).toFixed(0))
}
