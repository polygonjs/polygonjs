import {Vector3, Quaternion, Object3D, Matrix4, MathUtils} from 'three';

export interface PolarTransformMatrixParams {
	center: Vector3;
	longitude: number;
	latitude: number;
	depth: number;
}

const POLAR_TRANSFORM_AXIS_VERTICAL = new Vector3(0, 1, 0);
const POLAR_TRANSFORM_AXIS_HORIZONTAL = new Vector3(-1, 0, 0);

const centerMatrix = new Matrix4();
const longitudeMatrix = new Matrix4();
const latitudeMatrix = new Matrix4();
const depthMatrix = new Matrix4();
const decomposed = {
	t: new Vector3(),
	q: new Quaternion(),
	s: new Vector3(),
};

export class CorePolarTransform {
	static matrix(params: PolarTransformMatrixParams, target: Matrix4) {
		centerMatrix.identity();
		longitudeMatrix.identity();
		latitudeMatrix.identity();
		depthMatrix.identity();
		centerMatrix.makeTranslation(params.center.x, params.center.y, params.center.z);
		longitudeMatrix.makeRotationAxis(POLAR_TRANSFORM_AXIS_VERTICAL, MathUtils.degToRad(params.longitude));
		latitudeMatrix.makeRotationAxis(POLAR_TRANSFORM_AXIS_HORIZONTAL, MathUtils.degToRad(params.latitude));
		depthMatrix.makeTranslation(0, 0, params.depth);
		target.copy(centerMatrix).multiply(longitudeMatrix).multiply(latitudeMatrix).multiply(depthMatrix);
	}
	static applyMatrixToObject(object: Object3D, matrix: Matrix4) {
		matrix.decompose(decomposed.t, decomposed.q, decomposed.s);
		object.position.copy(decomposed.t);
		object.quaternion.copy(decomposed.q);
		object.scale.copy(decomposed.s);
		object.updateMatrix();
	}
}
