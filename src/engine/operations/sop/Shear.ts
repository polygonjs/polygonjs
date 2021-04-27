import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {DefaultOperationParams} from '../_Base';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Mesh} from 'three/src/objects/Mesh';
import {Object3D} from 'three/src/core/Object3D';
import {Matrix4} from 'three/src/math/Matrix4';
import {TypeAssert} from '../../poly/Assert';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {Plane} from 'three/src/math/Plane';

export enum ShearMode {
	MATRIX = 'matrix',
	AXIS = 'axis',
}
export const SHEAR_MODES: ShearMode[] = [ShearMode.MATRIX, ShearMode.AXIS];

interface ShearSopParams extends DefaultOperationParams {
	mode: number;
	matrixAmount: Vector3;
	planeAxis: Vector3;
	axis: Vector3;
	axisAmount: number;
}

export class ShearSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ShearSopParams = {
		mode: SHEAR_MODES.indexOf(ShearMode.AXIS),
		matrixAmount: new Vector3(0, 0, 0),
		planeAxis: new Vector3(0, 0, 1),
		axis: new Vector3(0, 1, 0),
		axisAmount: 0,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'shear'> {
		return 'shear';
	}

	private _m4 = new Matrix4();
	cook(input_contents: CoreGroup[], params: ShearSopParams) {
		const objects = input_contents[0].objects();

		this._applyShear(objects, params);

		return input_contents[0];
	}

	private _applyShear(objects: Object3D[], params: ShearSopParams) {
		const mode = SHEAR_MODES[params.mode];
		switch (mode) {
			case ShearMode.MATRIX: {
				return this._applyMatrixShear(objects, params);
			}
			case ShearMode.AXIS: {
				return this._applyAxisShear(objects, params);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _applyMatrixShear(objects: Object3D[], params: ShearSopParams) {
		(this._m4 as any).makeShear(params.matrixAmount.x, params.matrixAmount.y, params.matrixAmount.z);
		for (let object of objects) {
			const mesh = object as Mesh;
			const geometry = mesh.geometry;
			if (geometry) {
				geometry.applyMatrix4(this._m4);
			}
		}
	}

	private _axisNormalized = new Vector3();
	private _boxCenter = new Vector3();
	private _pointPos = new Vector3();
	private _axisPlane = new Plane();
	private _pointOnPlane = new Vector3();
	private _delta = new Vector3();
	private _deltaNormalized = new Vector3();
	private _offset = new Vector3();
	private _applyAxisShear(objects: Object3D[], params: ShearSopParams) {
		this._axisNormalized.copy(params.axis);
		this._axisNormalized.normalize();
		for (let object of objects) {
			const mesh = object as Mesh;
			const geometry = mesh.geometry;
			if (geometry) {
				geometry.computeBoundingBox();
				const box = geometry.boundingBox;
				if (box) {
					box.getCenter(this._boxCenter);
					this._axisPlane.setFromNormalAndCoplanarPoint(params.planeAxis, this._boxCenter);
					const coreGeo = new CoreGeometry(geometry);
					const points = coreGeo.points();
					for (let point of points) {
						point.getPosition(this._pointPos);
						this._axisPlane.projectPoint(this._pointPos, this._pointOnPlane);
						this._delta.copy(this._pointOnPlane).sub(this._pointPos);
						const distToPlane = this._delta.length();
						this._deltaNormalized.copy(this._delta).normalize();

						this._offset.copy(this._axisNormalized).multiplyScalar(params.axisAmount * distToPlane);
						if (this._delta.dot(params.planeAxis) > 0) {
							this._offset.multiplyScalar(-1);
						}

						this._pointPos.add(this._offset);
						point.setPosition(this._pointPos);
					}
				}
			}
		}
	}
}
