import {mod} from '../math/_Module';
import {Vector3} from 'three';
export interface TileCorners {
	p0: Vector3;
	p1: Vector3;
	p2: Vector3;
	p3: Vector3;
	height: number;
}

export enum WFCTileSide {
	SOUTH = 's',
	NORTH = 'n',
	WEST = 'w',
	EAST = 'e',
	BOTTOM = 'b',
	TOP = 't',
}
export interface PotentialNeighbour {
	id: string;
	side: WFCTileSide;
}
export interface WFCAvailableTileNeighbours {
	[WFCTileSide.SOUTH]: PotentialNeighbour[];
	[WFCTileSide.NORTH]: PotentialNeighbour[];
	[WFCTileSide.WEST]: PotentialNeighbour[];
	[WFCTileSide.EAST]: PotentialNeighbour[];
	[WFCTileSide.BOTTOM]: PotentialNeighbour[];
	[WFCTileSide.TOP]: PotentialNeighbour[];
}
export function createEmptyAvailableTileNeighbours(): WFCAvailableTileNeighbours {
	return {
		[WFCTileSide.SOUTH]: [],
		[WFCTileSide.NORTH]: [],
		[WFCTileSide.WEST]: [],
		[WFCTileSide.EAST]: [],
		[WFCTileSide.BOTTOM]: [],
		[WFCTileSide.TOP]: [],
	};
}

export const CLOCK_WISE_TILE_SIDES: WFCTileSide[] = [
	WFCTileSide.NORTH,
	WFCTileSide.EAST,
	WFCTileSide.SOUTH,
	WFCTileSide.WEST,
];
export function rotateSide(side: WFCTileSide, rotation: number): WFCTileSide {
	const index = CLOCK_WISE_TILE_SIDES.indexOf(side);
	return CLOCK_WISE_TILE_SIDES[(index + mod(rotation, 4)) % CLOCK_WISE_TILE_SIDES.length];
}
