export interface PotPackBox {
	w: number;
	h: number;
}
export interface PotPackBoxResult {
	w: number;
	h: number;
	x: number;
	y: number;
}
export interface PotPackResult {
	w: number;
	h: number;
	fill: number;
}
// @ts-ignore
import potpack from 'potpack';

export function Potpack(boxes: PotPackBox[]): PotPackResult {
	return potpack(boxes);
}
