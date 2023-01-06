import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry, Vector3, RingGeometry} from 'three';
// import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreTransform} from '../../../core/Transform';

const DEFAULT_UP = new Vector3(0, 0, 1);
// const q = new Quaternion();
// const size = new Vector3();
// const center = new Vector3();

interface RingSopParams extends DefaultOperationParams {
	innerRadius: number;
	outerRadius: number;
	thetaSegments: number;
	phiSegments: number;
	open: boolean;
	angleStart: number;
	angleLength: number;
	direction: Vector3;
	center: Vector3;
}

export class RingSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: RingSopParams = {
		innerRadius: 0.5,
		outerRadius: 1,
		thetaSegments: 32,
		phiSegments: 2,
		open: false,
		angleStart: 0,
		angleLength: 2 * Math.PI,
		direction: new Vector3(0, 1, 0),
		center: new Vector3(0, 0, 0),
	};
	// static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'ring'> {
		return 'ring';
	}
	private _coreTransform = new CoreTransform();
	override cook(inputCoreGroups: CoreGroup[], params: RingSopParams) {
		// const coreGroup = inputCoreGroups[0];
		// const object = coreGroup ? this._cookWithInput(coreGroup, params) : this._cookWithoutInput(params);
		const object = this._cookWithoutInput(params);
		if (this._node) {
			object.name = this._node.name();
		}
		return this.createCoreGroupFromObjects([object]);
	}
	private _cookWithoutInput(params: RingSopParams) {
		const geometry = this._createRequiredGeometry(params);
		this._coreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		const object = this._createRingObject(geometry, params);
		return object;
	}
	// private _cookWithInput(coreGroup: CoreGroup, params: RingSopParams) {
	// 	const bboxPreRotation = coreGroup.boundingBox();
	// 	bboxPreRotation.getCenter(center);

	// 	// create box
	// 	const bbox = coreGroup.boundingBox();
	// 	size.copy(bbox.max).sub(bbox.min);
	// 	center.copy(bbox.max).add(bbox.min).multiplyScalar(0.5);
	// 	const boxGeometry = new BoxGeometry(size.x, size.y, size.z, 1, 1, 1);

	// 	// rotate box
	// 	function _applyInputQuaternion(_q: Quaternion) {
	// 		boxGeometry.applyQuaternion(_q);
	// 		boxGeometry.computeBoundingBox();
	// 	}
	// 	function _setInputRotation() {
	// 		q.setFromUnitVectors(DEFAULT_UP, params.direction);
	// 		_applyInputQuaternion(q);
	// 	}
	// 	// function _resetInputRotation() {
	// 	// 	q.invert();
	// 	// 	_applyInputQuaternion(q);
	// 	// }
	// 	_setInputRotation();
	// 	const bboxPostRotation = boxGeometry.boundingBox!; //coreGroup.boundingBox(true);
	// 	bboxPostRotation.getSize(size);
	// 	// bboxPreRotation.getCenter(center); // debug
	// 	// _resetInputRotation();

	// 	const size2d = new Vector2(size.x, size.y);
	// 	const geometry = this._createRequiredGeometry(size2d, params);

	// 	this._coreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);
	// 	geometry.translate(center.x, center.y, center.z);

	// 	const object = this._createRingObject(geometry, params);
	// 	return object;
	// }
	private _createRingObject(geometry: BufferGeometry, params: RingSopParams) {
		return BaseSopOperation.createObject(geometry, params.asLines ? ObjectType.LINE_SEGMENTS : ObjectType.MESH);
	}

	private _createRequiredGeometry(params: RingSopParams) {
		return new RingGeometry(
			params.innerRadius,
			params.outerRadius,
			params.thetaSegments,
			params.phiSegments,
			params.open ? params.angleStart : 0,
			params.open ? params.angleLength : RingSopOperation.DEFAULT_PARAMS.angleLength
		);
	}
}
