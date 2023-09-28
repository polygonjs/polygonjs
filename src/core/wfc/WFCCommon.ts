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
export const WFC_ALL_HORIZONTAL_SIDES: WFCAllHorizontalSides = 'snwe';
export const ALL_HORIZONTAL_SIDES: WFCAllHorizontalSides = 'snwe';
export type WFCTileSide = 's' | 'n' | 'w' | 'e' | 'b' | 't' | WFCAllHorizontalSides;
export const ALL_SIDES: WFCTileSide[] = ['s', 'n', 'w', 'e', 'b', 't'];
export interface WFCRule {
	readonly id0: string;
	readonly id1: string;
	readonly side0: WFCTileSide;
	readonly side1: WFCTileSide;
}
export const EMPTY_TILE_ID = '__EMPTY_TILE__';
export const GRID_LIMIT_ID = '__GRID_LIMIT__';
export const ERROR_TILE_ID = '__ERROR_TILE__';
export const UNRESOLVED_TILE_ID = '__UNRESOLVED_TILE__';
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
	if (side == 't' || side == 'b') {
		return side;
	}
	const index = CLOCK_WISE_TILE_SIDES.indexOf(side);
	return CLOCK_WISE_TILE_SIDES[mod(index + rotation, 4)];
}

export interface TileConfigStats {
	solid: number;
	empty: number;
}
export function configTilesStats(tileConfigs: TileConfig[], target: TileConfigStats) {
	target.solid = 0;
	target.empty = 0;
	for (const config of tileConfigs) {
		if (config.tileId == EMPTY_TILE_ID) {
			target.empty++;
		} else {
			target.solid++;
		}
	}
}
export function solidTilesStats(tileConfigs: TileConfig[]): TileConfig[] {
	return tileConfigs.filter((config) => config.tileId != EMPTY_TILE_ID);
}

export interface SortedTileIds {
	first: string;
	second: string;
}
export function sortTileIds(id0: string, id1: string, target: SortedTileIds, invert = false) {
	if (invert) {
		if (id0 > id1) {
			target.first = id0;
			target.second = id1;
		} else {
			target.first = id1;
			target.second = id0;
		}
	} else {
		if (id0 < id1) {
			target.first = id0;
			target.second = id1;
		} else {
			target.first = id1;
			target.second = id0;
		}
	}
}

export function tileSideUnrotated(xOffset: number, yOffset: number, zOffset: number): WFCTileSide {
	return xOffset < 0 ? 's' : xOffset > 0 ? 'n' : zOffset < 0 ? 'w' : zOffset > 0 ? 'e' : yOffset < 0 ? 'b' : 't';
}
export function neighbourTileSideUnrotated(xOffset: number, yOffset: number, zOffset: number): WFCTileSide {
	return xOffset < 0 ? 'n' : xOffset > 0 ? 's' : zOffset < 0 ? 'e' : zOffset > 0 ? 'w' : yOffset < 0 ? 't' : 'b';
}
