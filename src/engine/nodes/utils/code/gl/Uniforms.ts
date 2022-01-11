import {Texture} from 'three/src/textures/Texture';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Color} from 'three/src/math/Color';
export interface IUniformB {
	value: boolean;
}

export interface IUniformN {
	value: number;
}
export interface IUniformNArray {
	value: number[];
}

export interface IUniformV2 {
	value: Vector2;
}
export interface IUniformV3 {
	value: Vector3;
}
export interface IUniformV3Array {
	value: Vector3[];
}
export interface IUniformColor {
	value: Color;
}
export interface IUniformTexture {
	value: Texture | null;
}
