/**
 * The one table the queries read. Diameter is in kilometres, distance is the
 * average distance from the Sun in millions of kilometres.
 */
export interface Planet {
  name: string;
  type: string;
  moons: number;
  diameter: number;
  distance: number;
}

export const columns = [
  { name: "name", kind: "text" },
  { name: "type", kind: "text" },
  { name: "moons", kind: "number" },
  { name: "diameter", kind: "number" },
  { name: "distance", kind: "number" },
] as const;

export type ColumnName = (typeof columns)[number]["name"];

export const planets: readonly Planet[] = [
  { name: "Mercury", type: "rocky", moons: 0, diameter: 4879, distance: 57.9 },
  { name: "Venus", type: "rocky", moons: 0, diameter: 12104, distance: 108.2 },
  { name: "Earth", type: "rocky", moons: 1, diameter: 12756, distance: 149.6 },
  { name: "Mars", type: "rocky", moons: 2, diameter: 6792, distance: 227.9 },
  { name: "Ceres", type: "dwarf", moons: 0, diameter: 939, distance: 413.7 },
  { name: "Jupiter", type: "gas giant", moons: 95, diameter: 142984, distance: 778.5 },
  { name: "Saturn", type: "gas giant", moons: 146, diameter: 120536, distance: 1432.0 },
  { name: "Uranus", type: "ice giant", moons: 28, diameter: 51118, distance: 2867.0 },
  { name: "Neptune", type: "ice giant", moons: 16, diameter: 49528, distance: 4515.0 },
  { name: "Pluto", type: "dwarf", moons: 5, diameter: 2377, distance: 5906.4 },
  { name: "Eris", type: "dwarf", moons: 1, diameter: 2326, distance: 10125.0 },
];
