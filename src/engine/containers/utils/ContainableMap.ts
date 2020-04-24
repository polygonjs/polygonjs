import {CoreGroup} from '../../../core/geometry/Group';
import {Material} from 'three/src/materials/Materials';
import {Texture} from 'three/src/textures/Texture';
import {Object3D} from 'three/src/core/Object3D';
import {AnimationClip} from 'three/src/animation/AnimationClip';

export interface ContainableMap {
	ANIMATION: AnimationClip;
	EVENT: string;
	GEOMETRY: CoreGroup;
	GL: string;
	JS: string;
	MANAGER: boolean;
	MATERIAL: Material;
	OBJECT: Object3D;
	TEXTURE: Texture;
	POST: number;
}
