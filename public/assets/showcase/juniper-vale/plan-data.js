// 18 Linden Court: rooms in plan units (one unit ≈ one foot). Used by the 3D plan and the still drawing.
export const ROOMS = [
  { name: 'Living', x: 0, y: 0, w: 22, h: 16, floor: 0xd9c3a3, items: [['sofa', 11, 12, 10, 3.2, 2.6]] },
  { name: 'Kitchen', x: 22, y: 0, w: 14, h: 12, floor: 0xe6dccd, items: [['island', 29, 7, 7, 2.6, 3]] },
  { name: 'Dining', x: 36, y: 0, w: 16, h: 12, floor: 0xd9c3a3, items: [['table', 44, 6, 7, 3.4, 2.6]] },
  { name: 'Primary suite', x: 0, y: 16, w: 18, h: 22, floor: 0xcdb592, items: [['bed', 9, 29, 6.5, 7, 1.8]] },
  { name: 'Bath', x: 18, y: 16, w: 8, h: 10, floor: 0xe9e6e0, items: [] },
  { name: 'Bath', x: 26, y: 16, w: 10, h: 10, floor: 0xe9e6e0, items: [] },
  { name: 'Entry', x: 18, y: 26, w: 18, h: 12, floor: 0xe6dccd, items: [] },
  { name: 'Bedroom', x: 36, y: 12, w: 16, h: 13, floor: 0xcdb592, items: [['bed', 44, 18.5, 5.5, 6.5, 1.8]] },
  { name: 'Bedroom', x: 36, y: 25, w: 16, h: 13, floor: 0xcdb592, items: [['bed', 44, 31.5, 5.5, 6.5, 1.8]] },
];
export const PLAN_W = 52, PLAN_H = 38;

// Every room edge as a wall segment, with shared edges merged so no two walls overlap.
export function walls() {
  const segs = new Map();
  for (const r of ROOMS) {
    const edges = [[r.x, r.y, r.x + r.w, r.y], [r.x, r.y + r.h, r.x + r.w, r.y + r.h], [r.x, r.y, r.x, r.y + r.h], [r.x + r.w, r.y, r.x + r.w, r.y + r.h]];
    for (const [x1, y1, x2, y2] of edges) {
      const key = [x1, y1, x2, y2].join(',');
      const outer = (y1 === y2 && (y1 === 0 || y1 === PLAN_H)) || (x1 === x2 && (x1 === 0 || x1 === PLAN_W));
      if (!segs.has(key)) segs.set(key, { x1, y1, x2, y2, outer });
    }
  }
  return [...segs.values()];
}
