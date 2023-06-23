import {Number3} from '../../types/GlobalTypes';
import {Object3D} from 'three';
import {TetObject} from '../geometry/tet/TetObject';

// export interface TetMesh {
// 	name: string;
// 	verts: number[];
// 	tetIds: number[];
// 	tetEdgeIds: number[];
// 	tetSurfaceTriIds: number[];
// }

export const VOL_ID_ORDER: Number3[] = [
	[1, 3, 2],
	[0, 2, 3],
	[0, 3, 1],
	[0, 1, 2],
];

export interface TetEmbed {
	tetObject: TetObject;
	lowResObject: Object3D;
	highResObject?: Object3D;
	threejsObjectInSceneTree?: Object3D;
}
