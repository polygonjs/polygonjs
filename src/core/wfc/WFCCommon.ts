import {mod} from '../math/_Module';
import {NeighbourIndex} from '../graph/quad/QuadGraphCommon';
import {Vector3} from 'three';
export interface TileCorners {
	p0: Vector3;
	p1: Vector3;
	p2: Vector3;
	p3: Vector3;
	height: number;
}
export type WFCAllHorizontalSides = 'snwe';
export const ALL_HORIZONTAL_SIDES: WFCAllHorizontalSides = 'snwe';
export type WFCTileSide = 's' | 'n' | 'w' | 'e' | 'b' | 't' | WFCAllHorizontalSides;
export interface WFCConnection {
	readonly id0: string;
	readonly id1: string;
	readonly side0: WFCTileSide;
	readonly side1: WFCTileSide;
}
export const EMPTY_TILE_ID = '__EMPTY_TILE__';
// export enum WFCLookAtSide {
// 	SOUTH = 's',
// 	NORTH = 'n',
// 	WEST = 'w',
// 	EAST = 'e',
// }
// export const WFC_LOOK_AT_SIDES: WFCLookAtSide[] = [
// 	WFCLookAtSide.NORTH,
// 	WFCLookAtSide.EAST,
// 	WFCLookAtSide.SOUTH,
// 	WFCLookAtSide.WEST,
// ];
export type TileRotation = NeighbourIndex;
export interface TileConfig {
	tileId: string;
	rotation: TileRotation;
}
// export interface PotentialNeighbour {
// 	id: string;
// 	side: WFCTileSide;
// }
// export type WFCAvailableTileNeighbours = Record<WFCTileSide, PotentialNeighbour[]>;
// export function createEmptyAvailableTileNeighbours(): WFCAvailableTileNeighbours {
// 	return {
// 		s: [],
// 		n: [],
// 		w: [],
// 		e: [],
// 		b: [],
// 		t: [],
// 	};
// }

export const CLOCK_WISE_TILE_SIDES: WFCTileSide[] = ['n', 'e', 's', 'w'];
export function rotatedSide(side: WFCTileSide, rotation: number): WFCTileSide {
	const index = CLOCK_WISE_TILE_SIDES.indexOf(side);
	return CLOCK_WISE_TILE_SIDES[(index + mod(rotation, 4)) % CLOCK_WISE_TILE_SIDES.length];
}
