import {Object3D, Vector3, Matrix4} from 'three';
import {GetObjectPropertyJsNodeInputName, touchObjectProperties} from '../../core/reactivity/ObjectPropertyReactivity';
import {NamedFunction5, ObjectNamedFunction4} from './_Base';
import {CorePolarTransform, PolarTransformMatrixParams} from '../../core/PolarTransform';

const fullMatrix = new Matrix4();
const params: PolarTransformMatrixParams = {
	center: new Vector3(),
	longitude: 0,
	latitude: 0,
	depth: 0,
};
const PROPERTIES = [
	GetObjectPropertyJsNodeInputName.position,
	GetObjectPropertyJsNodeInputName.quaternion,
	GetObjectPropertyJsNodeInputName.matrix,
];
export class setObjectPolarTransform extends ObjectNamedFunction4<[Vector3, number, number, number]> {
	static override type() {
		return 'setObjectPolarTransform';
	}
	func(object3D: Object3D, center: Vector3, longitude: number, latitude: number, depth: number): void {
		params.center.copy(center);
		params.longitude = longitude;
		params.latitude = latitude;
		params.depth = depth;

		CorePolarTransform.matrix(params, fullMatrix);
		CorePolarTransform.applyMatrixToObject(object3D, fullMatrix);

		touchObjectProperties(object3D, PROPERTIES);
	}
}

export class polarTransform extends NamedFunction5<[Vector3, number, number, number, Matrix4]> {
	static override type() {
		return 'polarTransform';
	}
	func(center: Vector3, longitude: number, latitude: number, depth: number, target: Matrix4): Matrix4 {
		params.center.copy(center);
		params.longitude = longitude;
		params.latitude = latitude;
		params.depth = depth;

		CorePolarTransform.matrix(params, target);

		return target;
	}
}
