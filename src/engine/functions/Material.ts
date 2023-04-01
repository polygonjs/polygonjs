import {Object3D, Mesh, Color, Material, MeshBasicMaterial} from 'three';
import {CoreType} from '../../core/Type';
import {ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';

//
//
// UTILS
//
//
function setMaterialColor(material: Material, targetColor: Color, lerp: number) {
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
				setMaterialColor(mat, color, lerp);
			}
		} else {
			setMaterialColor(material, color, lerp);
		}
	}
}
