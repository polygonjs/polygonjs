import type {
	Object3D,
	Mesh,
	Color,
	Material,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Vector2,
	Vector3,
	Vector4,
	Texture,
} from 'three';

import {UNIFORM_PARAM_PREFIX, UNIFORM_TEXTURE_PREFIX} from '../../core/material/uniform';
import {isArray} from '../../core/Type';
import {MaterialUserDataUniforms} from '../nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {
	NamedFunction2,
	NamedFunction3,
	NamedFunction5,
	NamedFunction6,
	ObjectNamedFunction1,
	ObjectNamedFunction2,
} from './_Base';

//
//
// UTILS
//
//
function _setMaterialColor(material: Material, targetColor: Color, lerp: number) {
	const color = (material as MeshBasicMaterial).color;
	if (!color) {
		return;
	}
	if (lerp >= 1) {
		color.copy(targetColor);
	} else {
		color.lerp(targetColor, lerp);
	}
}
function _setMaterialEmissiveColor(material: Material, targetColor: Color, lerp: number) {
	const color = (material as MeshStandardMaterial).emissive;
	if (!color) {
		return;
	}
	if (lerp >= 1) {
		color.copy(targetColor);
	} else {
		color.lerp(targetColor, lerp);
	}
}
function _addParamUniformNamePrefix(uniformName: string, addPrefix: boolean): string {
	return addPrefix ? `${UNIFORM_PARAM_PREFIX}${uniformName}` : uniformName;
}
function _addTextureUniformNamePrefix(uniformName: string, addPrefix: boolean): string {
	return addPrefix ? `${UNIFORM_TEXTURE_PREFIX}${uniformName}` : uniformName;
}

//
//
// SET OBJECT
//
//
export class setObjectMaterial extends ObjectNamedFunction1<[Material]> {
	static override type() {
		return 'setObjectMaterial';
	}
	func(object3D: Object3D, material: Material): void {
		(object3D as Mesh).material = material;
	}
}

export class setObjectMaterialColor extends ObjectNamedFunction2<[Color, number]> {
	static override type() {
		return 'setObjectMaterialColor';
	}
	func(object3D: Object3D, color: Color, lerp: number): void {
		const material = (object3D as Mesh).material;
		if (isArray(material)) {
			for (let mat of material) {
				_setMaterialColor(mat, color, lerp);
			}
		} else {
			_setMaterialColor(material, color, lerp);
		}
	}
}

//
//
// SET MAT COLOR
//
//
export class setMaterialColor extends NamedFunction3<[Material, Color, number]> {
	static override type() {
		return 'setMaterialColor';
	}
	func(material: Material, color: Color, lerp: number): void {
		_setMaterialColor(material, color, lerp);
	}
}
export class setMaterialEmissiveColor extends NamedFunction3<[Material, Color, number]> {
	static override type() {
		return 'setMaterialEmissiveColor';
	}
	func(material: Material, color: Color, lerp: number): void {
		_setMaterialEmissiveColor(material, color, lerp);
	}
}

//
//
// SET MAT TEXTURE
//
//
interface SetMaterialTextureFactoryOptions {
	type: string;
	mapName:
		| 'map'
		| 'alphaMap'
		| 'aoMap'
		| 'displacementMap'
		| 'envMap'
		| 'emissiveMap'
		| 'metalnessMap'
		| 'roughnessMap';
}
function setMaterialTextureFactory(options: SetMaterialTextureFactoryOptions) {
	const {type, mapName} = options;
	return class setMaterialTexture extends NamedFunction2<[Material, Texture]> {
		static override type() {
			return type;
		}
		func(material: Material, texture: Texture): void {
			(material as MeshStandardMaterial)[mapName] = texture;
			material.needsUpdate = true;
		}
	};
}

export class setMaterialMap extends setMaterialTextureFactory({type: 'setMaterialMap', mapName: 'map'}) {}
export class setMaterialAlphaMap extends setMaterialTextureFactory({
	type: 'setMaterialAlphaMap',
	mapName: 'alphaMap',
}) {}
export class setMaterialAOMap extends setMaterialTextureFactory({type: 'setMaterialAOMap', mapName: 'aoMap'}) {}
export class setMaterialDisplacementMap extends setMaterialTextureFactory({
	type: 'setMaterialDisplacementMap',
	mapName: 'displacementMap',
}) {}
export class setMaterialEnvMap extends setMaterialTextureFactory({type: 'setMaterialEnvMap', mapName: 'envMap'}) {}
export class setMaterialEmissiveMap extends setMaterialTextureFactory({
	type: 'setMaterialEmissiveMap',
	mapName: 'emissiveMap',
}) {}
export class setMaterialMetalnessMap extends setMaterialTextureFactory({
	type: 'setMaterialMetalnessMap',
	mapName: 'metalnessMap',
}) {}
export class setMaterialRoughnessMap extends setMaterialTextureFactory({
	type: 'setMaterialRoughnessMap',
	mapName: 'roughnessMap',
}) {}

//
//
// SET MAT FLOAT VALUE
//
//
export class setMaterialOpacity extends NamedFunction3<[Material, number, number]> {
	static override type() {
		return 'setMaterialOpacity';
	}
	func(material: Material, opacity: number, lerp: number): void {
		material.opacity = lerp * opacity + (1 - lerp) * material.opacity;
	}
}
//
//
// SET MAT UNIFORM
//
//
export class setMaterialUniformNumber extends NamedFunction6<[Material, string, number, number, boolean, boolean]> {
	static override type() {
		return 'setMaterialUniformNumber';
	}
	func(
		material: Material,
		uniformName: string,
		value: number,
		lerp: number,
		addPrefix: boolean,
		printWarnings: boolean
	): void {
		const uniforms = MaterialUserDataUniforms.getUniforms(material);
		if (!uniforms) {
			if (printWarnings) {
				console.warn(`uniforms not found`, material);
			}
			return;
		}
		uniformName = _addParamUniformNamePrefix(uniformName, addPrefix);
		const uniform = uniforms[uniformName];
		if (!uniform) {
			if (printWarnings) {
				console.warn(`uniform '${uniformName}' not found`, material, uniforms);
			}
			return;
		}
		if (lerp == 1) {
			uniform.value = value;
		} else {
			uniform.value = lerp * value + (1 - lerp) * uniform.value;
		}
	}
}
type VectorColorUniform = Color | Vector2 | Vector3 | Vector4;
export class setMaterialUniformVectorColor extends NamedFunction6<
	[Material, string, VectorColorUniform, number, boolean, boolean]
> {
	static override type() {
		return 'setMaterialUniformVectorColor';
	}
	func(
		material: Material,
		uniformName: string,
		value: VectorColorUniform,
		lerp: number,
		addPrefix: boolean,
		printWarnings: boolean
	): void {
		const uniforms = MaterialUserDataUniforms.getUniforms(material);
		if (!uniforms) {
			if (printWarnings) {
				console.warn(`uniforms not found`, material);
			}
			return;
		}
		uniformName = _addParamUniformNamePrefix(uniformName, addPrefix);
		const uniform = uniforms[uniformName];
		if (!uniform) {
			if (printWarnings) {
				console.warn(`uniform '${uniformName}' not found`, material, uniforms);
			}
			return;
		}
		if (lerp >= 1) {
			uniform.value.copy(value);
		} else {
			uniform.value.lerp(value, lerp);
		}
	}
}

export class setMaterialUniformTexture extends NamedFunction5<[Material, string, Texture, boolean, boolean]> {
	static override type() {
		return 'setMaterialUniformTexture';
	}
	func(material: Material, uniformName: string, value: Texture, addPrefix: boolean, printWarnings: boolean): void {
		const uniforms = MaterialUserDataUniforms.getUniforms(material);
		if (!uniforms) {
			if (printWarnings) {
				console.warn(`uniforms not found`, material);
			}
			return;
		}
		uniformName = _addTextureUniformNamePrefix(uniformName, addPrefix);
		const uniform = uniforms[uniformName];
		if (!uniform) {
			if (printWarnings) {
				console.warn(`uniform '${uniformName}' not found`, material, uniforms);
			}
			return;
		}
		uniform.value = value;
	}
}
