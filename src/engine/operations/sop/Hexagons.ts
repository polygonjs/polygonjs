import {CoreGeometryOperationHexagon} from './../../../core/geometry/operation/Hexagon';
import {BaseSopOperation} from './_Base';
import {BufferGeometry, Vector2, Vector3, Quaternion, BoxGeometry} from 'three';
import {CoreTransform} from '../../../core/Transform';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ObjectType} from '../../../core/geometry/Constant';

interface HexagonsSopParams extends DefaultOperationParams {
	size: Vector2;
	hexagonRadius: number;
	direction: Vector3;
	pointsOnly: boolean;
}
const DEFAULT_UP = new Vector3(0, 0, 1);
// const ROTATE_END = new Vector3(0, 1, 0);
const q = new Quaternion();
const size = new Vector3();
const center = new Vector3();
// const inputObjectCenter = new Vector3();
export class HexagonsSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: HexagonsSopParams = {
		size: new Vector2(1, 1),
		hexagonRadius: 0.1,
		direction: new Vector3(0, 1, 0),
		pointsOnly: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'hexagons'> {
		return 'hexagons';
	}

	private _coreTransform = new CoreTransform();

	override cook(inputCoreGroups: CoreGroup[], params: HexagonsSopParams) {
		const coreGroup = inputCoreGroups[0];
		if (coreGroup) {
			return this._cookWithInput(coreGroup, params);
		} else {
			return this._cookWithoutInput(params);
		}
	}
	private _cookWithoutInput(params: HexagonsSopParams) {
		if (params.hexagonRadius > 0) {
			const geometry = this._createHexagons(params.size, params);

			this._coreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);

			return this.createCoreGroupFromObjects([this._createHexagonsObjects(geometry, params)]);
		} else {
			return this.createCoreGroupFromObjects([]);
		}
	}

	private _cookWithInput(coreGroup: CoreGroup, params: HexagonsSopParams) {
		const bboxPreRotation = coreGroup.boundingBox();
		bboxPreRotation.getCenter(center);

		// create box
		const bbox = coreGroup.boundingBox();
		size.copy(bbox.max).sub(bbox.min);
		center.copy(bbox.max).add(bbox.min).multiplyScalar(0.5);
		const boxGeometry = new BoxGeometry(size.x, size.y, size.z, 1, 1, 1);

		// rotate box
		function _applyInputQuaternion(_q: Quaternion) {
			boxGeometry.applyQuaternion(_q);
			boxGeometry.computeBoundingBox();
		}
		function _setInputRotation() {
			q.setFromUnitVectors(DEFAULT_UP, params.direction);
			_applyInputQuaternion(q);
		}
		// function _resetInputRotation() {
		// 	q.invert();
		// 	_applyInputQuaternion(q);
		// }
		_setInputRotation();
		const bboxPostRotation = boxGeometry.boundingBox!; //coreGroup.boundingBox(true);
		bboxPostRotation.getSize(size);
		// bboxPreRotation.getCenter(center); // debug
		// _resetInputRotation();

		const size2d = new Vector2(size.x, size.y);
		const geometry = this._createHexagons(size2d, params);

		this._coreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);
		geometry.translate(center.x, center.y, center.z);

		const object = this._createHexagonsObjects(geometry, params);
		return this.createCoreGroupFromObjects([object]);
	}

	private _createHexagonsObjects(geometry: BufferGeometry, params: HexagonsSopParams) {
		if (isBooleanTrue(params.pointsOnly)) {
			return this.createObject(geometry, ObjectType.POINTS);
		} else {
			return this.createObject(geometry, ObjectType.MESH);
		}
	}

	private _createHexagons(size: Vector2, params: HexagonsSopParams) {
		const operation = new CoreGeometryOperationHexagon(size, params.hexagonRadius, params.pointsOnly);
		const geometry = operation.process();
		return geometry;
	}
}
