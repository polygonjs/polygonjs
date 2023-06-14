import {Number3} from '../../types/GlobalTypes';

export interface TetMesh {
	name: string;
	verts: number[];
	tetIds: number[];
	tetEdgeIds: number[];
	tetSurfaceTriIds: number[];
}

export const VOL_ID_ORDER: Number3[] = [
	[1, 3, 2],
	[0, 2, 3],
	[0, 3, 1],
	[0, 1, 2],
];
