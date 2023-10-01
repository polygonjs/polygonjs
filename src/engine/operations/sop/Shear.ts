import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Mesh} from 'three';
import {Object3D} from 'three';
import {Matrix4} from 'three';
import {TypeAssert} from '../../poly/Assert';
import {Plane} from 'three';
import {BufferGeometry} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import { pointsFromObject } from '../../../core/geometry/entities/point/CorePointUtils';

export enum ShearMode {
	MATRIX = 'matrix',
	AXIS = 'axis',
}
export const SHEAR_MODES: ShearMode[] = [ShearMode.MATRIX, ShearMode.AXIS];

export enum ShearCenterMode {
	BBOX_CENTER = 'bbox center',
	BBOX_CENTER_OFFSET = 'bbox center offset',
	CUSTOM = 'custom',
}
export const SHEAR_CENTER_MODES: ShearCenterMode[] = [
	ShearCenterMode.BBOX_CENTER,
	ShearCenterMode.BBOX_CENTER_OFFSET,
	ShearCenterMode.CUSTOM,
];

interface ShearSopParams extends DefaultOperationParams {
	mode: number;
	// matrix mode
	xy: number;
	xz: number;
	yx: number;
	yz: number;
	zx: number;
	zy: number;
	// axis mode
	centerMode: number;
	centerOffset: Vector3;
	center: Vector3;
	planeAxis: Vector3;
	axis: Vector3;
	axisAmount: number;
}

export class ShearSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ShearSopParams = {
		mode: SHEAR_MODES.indexOf(ShearMode.AXIS),
		// matrix mode
		xy: 0,
		xz: 0,
		yx: 0,
		yz: 0,
		zx: 0,
		zy: 0,
		// axis mode
		centerMode: SHEAR_CENTER_MODES.indexOf(ShearCenterMode.BBOX_CENTER),
		centerOffset: new Vector3(0, 0, 0),
		center: new Vector3(0, 0, 0),
		planeAxis: new Vector3(0, 0, 1),
		axis: new Vector3(0, 1, 0),
		axisAmount: 0,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'shear'> {
		return 'shear';
	}

	private _m4 = new Matrix4();
	override cook(input_contents: CoreGroup[], params: ShearSopParams) {
		const objects = input_contents[0].threejsObjects();

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
		this._m4.makeShear(params.xy, params.xz, params.yx, params.yz, params.zx, params.zy);
		for (let object of objects) {
			const mesh = object as Mesh;
			const geometry = mesh.geometry;
			if (geometry) {
				geometry.applyMatrix4(this._m4);
			}
		}
	}

	private _axisNormalized = new Vector3();
	private _center = new Vector3();
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
				this._getAxisModeCenter(geometry, params);
				this._axisPlane.setFromNormalAndCoplanarPoint(params.planeAxis, this._center);
				const points = pointsFromObject(object)
				for (let point of points) {
					point.position(this._pointPos);
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

	private _getAxisModeCenter(geometry: BufferGeometry, params: ShearSopParams) {
		const mode = SHEAR_CENTER_MODES[params.centerMode];
		switch (mode) {
			case ShearCenterMode.BBOX_CENTER: {
				return this._getAxisModeCenterBbox(geometry, params);
			}
			case ShearCenterMode.BBOX_CENTER_OFFSET: {
				return this._getAxisModeCenterBboxOffset(geometry, params);
			}
			case ShearCenterMode.CUSTOM: {
				return this._getAxisModeCenterCustom(params);
			}
		}
		TypeAssert.unreachable(mode);
	}
	private _getAxisModeCenterBbox(geometry: BufferGeometry, params: ShearSopParams) {
		geometry.computeBoundingBox();
		const box = geometry.boundingBox;
		if (box) {
			box.getCenter(this._center);
		} else {
			this._center.set(0, 0, 0);
		}
	}
	private _getAxisModeCenterBboxOffset(geometry: BufferGeometry, params: ShearSopParams) {
		this._getAxisModeCenterBbox(geometry, params);
		this._center.add(params.centerOffset);
	}
	private _getAxisModeCenterCustom(params: ShearSopParams) {
		return this._center.copy(params.center);
	}
}
