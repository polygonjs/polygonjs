import {Vector3} from 'three';

export type TetEdge = [number, number, number, number];

export const DIRS = [
	new Vector3(1.0, 0.0, 0.0),
	new Vector3(-1.0, 0.0, 0.0),
	new Vector3(0.0, 1.0, 0.0),
	new Vector3(0.0, -1.0, 0.0),
	new Vector3(0.0, 0.0, 1.0),
	new Vector3(0.0, 0.0, -1.0),
];

export const TET_FACES = [
	[2, 1, 0],
	[0, 1, 3],
	[1, 2, 3],
	[2, 0, 3],
];

export enum TetCreationStage {
	POINTS_INSIDE = 'pointsInside',
	TETS = 'tets',
}
export const TET_CREATION_STAGES: TetCreationStage[] = [TetCreationStage.POINTS_INSIDE, TetCreationStage.TETS];
