import {Texture} from 'three/src/textures/Texture';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';

export interface IUniformN {
	value: number;
}
export interface IUniformV2 {
	value: Vector2;
}
export interface IUniformV3 {
	value: Vector3;
}
export interface IUniformTexture {
	value: Texture | null;
}
