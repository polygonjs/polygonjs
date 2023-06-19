const PRECISION = 6;
export function vector3ToStr(x: number, y: number, z: number) {
	return `${x.toFixed(PRECISION)}:${y.toFixed(PRECISION)}:${z.toFixed(PRECISION)}`;
}
// export function number3ToStr(x: number, y: number, z: number) {
// 	return `${x}:${y}:${z}`;
// }
export function string3ToStr(x: string, y: string, z: string) {
	return `${x}:${y}:${z}`;
}
