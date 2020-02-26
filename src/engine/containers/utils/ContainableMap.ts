import {CoreGroup} from '../../../core/geometry/Group';
import {Material} from 'three/src/materials/Materials';
import {Texture} from 'three/src/textures/Texture';
import {Object3D} from 'three/src/core/Object3D';

export interface ContainableMap {
	GEOMETRY: CoreGroup;
	MATERIAL: Material;
	TEXTURE: Texture;
	OBJECT: Object3D;
	EVENT: string;
	MANAGER: boolean;
	POST: number;
	GL: string;
	JS: string;
}
