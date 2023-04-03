import {Object3D, Vector3, Matrix4} from 'three';
import {GetObjectPropertyJsNodeInputName, touchObjectProperties} from '../../core/reactivity/ObjectPropertyReactivity';
import {ObjectNamedFunction4} from './_Base';
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
		// const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		// const updateMatrix = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateMatrix, context);

		CorePolarTransform.matrix(params, fullMatrix);
		CorePolarTransform.applyMatrixToObject(object3D, fullMatrix);

		touchObjectProperties(object3D, PROPERTIES);
	}
}