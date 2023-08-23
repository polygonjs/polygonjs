import {mod} from '../math/_Module';

export enum WFCTileSide {
	SOUTH = 's',
	NORTH = 'n',
	WEST = 'w',
	EAST = 'e',
	BOTTOM = 'b',
	TOP = 't',
}

export const CLOCK_WISE_TILE_SIDES = [WFCTileSide.NORTH, WFCTileSide.EAST, WFCTileSide.SOUTH, WFCTileSide.WEST];
export function rotateSide(side: WFCTileSide, rotation: number): WFCTileSide {
	const index = CLOCK_WISE_TILE_SIDES.indexOf(side);
	console.log(index, rotation, rotation % 4, mod(rotation, 4));
	return CLOCK_WISE_TILE_SIDES[(index + mod(rotation, 4)) % CLOCK_WISE_TILE_SIDES.length];
}
