import {
	Object3D,
	Mesh,
	Color,
	Material,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Vector2,
	Vector3,
	Vector4,
} from 'three';
import {CoreType} from '../../core/Type';
import {MaterialUserDataUniforms} from '../nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {NamedFunction3, NamedFunction4, ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';

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
		if (CoreType.isArray(material)) {
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
// SET MAT
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
export class setMaterialUniformNumber extends NamedFunction4<[Material, string, number, number]> {
	static override type() {
		return 'setMaterialUniformNumber';
	}
	func(material: Material, uniformName: string, value: number, lerp: number): void {
		const uniforms = MaterialUserDataUniforms.getUniforms(material);
		if (!uniforms) {
			return;
		}
		const uniform = uniforms[uniformName];
		if (!uniform) {
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
export class setMaterialUniformVectorColor extends NamedFunction4<[Material, string, VectorColorUniform, number]> {
	static override type() {
		return 'setMaterialUniformVectorColor';
	}
	func(material: Material, uniformName: string, value: VectorColorUniform, lerp: number): void {
		const uniforms = MaterialUserDataUniforms.getUniforms(material);
		if (!uniforms) {
			return;
		}
		const uniform = uniforms[uniformName];
		if (!uniform) {
			return;
		}
		if (lerp == 1) {
			uniform.value.copy(value);
		} else {
			uniform.value.lerp(value, lerp);
		}
	}
}
