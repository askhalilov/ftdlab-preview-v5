// Points sampled from the brightest pixels of the supplied horizon images.
// Coordinates stay in each source image's native pixel space so the SVG and
// contain-fitted bitmap remain aligned at every viewport size.
const desktopPoints: [number, number][] = [
  [0,476],[80,479],[160,486],[240,499],[320,518],[400,541],
  [480,572],[560,609],[640,648],[720,682],[800,710],[880,730],
  [960,744],[1040,753],[1120,756],[1200,754],[1280,748],
  [1360,740],[1440,730],[1520,719],[1600,708],[1672,700],
]
const mobilePoints: [number, number][] = [
  [0,979],[45,982],[90,988],[135,995],[180,1005],[225,1016],
  [270,1030],[315,1046],[360,1064],[405,1085],[450,1108],
  [495,1133],[540,1156],[585,1177],[630,1196],[675,1213],
  [720,1227],[765,1238],[810,1247],[855,1253],[900,1258],[941,1261],
]

function smoothPath(points: [number, number][]): string {
  const parts = [`M${points[0]![0]} ${points[0]![1]}`]
  for (let i = 0; i < points.length - 1; i++) {
    const before = points[Math.max(0, i - 1)]!
    const start = points[i]!
    const end = points[i + 1]!
    const after = points[Math.min(points.length - 1, i + 2)]!
    const c1x = start[0] + (end[0] - before[0]) / 6
    const c1y = start[1] + (end[1] - before[1]) / 6
    const c2x = end[0] - (after[0] - start[0]) / 6
    const c2y = end[1] - (after[1] - start[1]) / 6
    parts.push(`C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${end[0]} ${end[1]}`)
  }
  return parts.join(' ')
}
export const desktopHorizonPath = smoothPath(desktopPoints)
export const mobileHorizonPath = smoothPath(mobilePoints)
