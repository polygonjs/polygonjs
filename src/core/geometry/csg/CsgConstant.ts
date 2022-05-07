import {FrontSide, LineBasicMaterial, MeshStandardMaterial} from 'three';
import {ObjectType} from '../Constant';
import {CsgObjectType} from './CsgToObject3D';

export interface CsgObjectData {
	type: CsgObjectType;
}

export const CSG_MATERIAL = {
	[ObjectType.MESH]: new MeshStandardMaterial({
		color: 0xffffff,
		vertexColors: true,
		side: FrontSide,
		metalness: 0.0,
		roughness: 0.9,
	}),
	[ObjectType.LINE_SEGMENTS]: new LineBasicMaterial({
		color: 0xffffff,
		linewidth: 1,
		vertexColors: true,
	}),
};
