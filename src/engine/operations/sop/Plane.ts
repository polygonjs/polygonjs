import {BaseSopOperation} from './_Base';
import {BufferGeometry, Vector2, Vector3, PlaneGeometry, Quaternion, BoxGeometry, Box3} from 'three';
import {CoreTransform} from '../../../core/Transform';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ObjectType} from '../../../core/geometry/Constant';
const tmpBox = new Box3();
const tmpBoxPreRotation = new Box3();
const tmpSize = new Vector3();
const tmpCenter = new Vector3();
const DEFAULT_UP = new Vector3(0, 0, 1);
const q = new Quaternion();
// const size = new Vector3();
// const center = new Vector3();
interface PlaneSopParams extends DefaultOperationParams {
	size: Vector2;
	useSegmentsCount: boolean;
	stepSize: number;
	segments: Vector2;
	direction: Vector3;
	center: Vector3;
	asLines: boolean;
}

export class PlaneSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PlaneSopParams = {
		size: new Vector2(1, 1),
		useSegmentsCount: false,
		stepSize: 1,
		segments: new Vector2(1, 1),
		direction: new Vector3(0, 1, 0),
		center: new Vector3(0, 0, 0),
		asLines: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'plane'> {
		return 'plane';
	}

	private _coreTransform = new CoreTransform();

	override cook(inputCoreGroups: CoreGroup[], params: PlaneSopParams) {
		const coreGroup = inputCoreGroups[0];
		if (coreGroup) {
			return this._cookWithInput(coreGroup, params);
		} else {
			return this._cookWithoutInput(params);
		}
	}
	private _cookWithoutInput(params: PlaneSopParams) {
		const geometry = this._createPlane(params.size, params);

		// convert to buffer geo, as some render problems can occur otherwise
		// geometry = BufferGeometryUtils.mergeBufferGeometries([geometry])
		// console.log(geometry, geometry.isBufferGeometry)
		this._coreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);

		const matrix = this._coreTransform.translationMatrix(params.center);
		geometry.applyMatrix4(matrix);

		const object = this._createPlaneObject(geometry, params);
		return this.createCoreGroupFromObjects([object]);
	}

	private _cookWithInput(coreGroup: CoreGroup, params: PlaneSopParams) {
		coreGroup.boundingBox(tmpBoxPreRotation);
		tmpBoxPreRotation.getCenter(tmpCenter);

		// create box
		coreGroup.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);
		tmpBox.getCenter(tmpCenter);
		const boxGeometry = new BoxGeometry(tmpSize.x, tmpSize.y, tmpSize.z, 1, 1, 1);

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
		bboxPostRotation.getSize(tmpSize);
		// bboxPreRotation.getCenter(center); // debug
		// _resetInputRotation();

		const size2d = new Vector2(tmpSize.x, tmpSize.y);
		const geometry = this._createPlane(size2d, params);

		this._coreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);
		geometry.translate(tmpCenter.x, tmpCenter.y, tmpCenter.z);

		const object = this._createPlaneObject(geometry, params);
		return this.createCoreGroupFromObjects([object]);
	}

	private _createPlaneObject(geometry: BufferGeometry, params: PlaneSopParams) {
		return BaseSopOperation.createObject(geometry, params.asLines ? ObjectType.LINE_SEGMENTS : ObjectType.MESH);
	}

	private _segmentsCount = new Vector2(1, 1);
	private _createPlane(size: Vector2, params: PlaneSopParams) {
		size = size.clone();
		if (isBooleanTrue(params.useSegmentsCount)) {
			this._segmentsCount.x = Math.floor(params.segments.x);
			this._segmentsCount.y = Math.floor(params.segments.y);
		} else {
			if (params.stepSize > 0) {
				size.x = Math.max(size.x, params.stepSize);
				size.y = Math.max(size.y, params.stepSize);
				this._segmentsCount.x = Math.floor(size.x / params.stepSize);
				this._segmentsCount.y = Math.floor(size.y / params.stepSize);
				size.x = this._segmentsCount.x * params.stepSize;
				size.y = this._segmentsCount.y * params.stepSize;
			}
		}
		const geometry = new PlaneGeometry(size.x, size.y, this._segmentsCount.x, this._segmentsCount.y);
		if (isBooleanTrue(params.asLines)) {
			const gridX = Math.floor(this._segmentsCount.x);
			const gridY = Math.floor(this._segmentsCount.y);

			const gridX1 = gridX + 1;
			// const gridY1 = gridY + 1;
			const indices: number[] = [];
			for (let iy = 0; iy < gridY; iy++) {
				for (let ix = 0; ix < gridX; ix++) {
					const a = ix + gridX1 * iy;
					const b = ix + gridX1 * (iy + 1);
					const d = ix + 1 + gridX1 * iy;

					indices.push(a, b);
					indices.push(a, d);
					const lastX = ix == gridX - 1;
					const lastY = iy == gridY - 1;
					if (lastX || lastY) {
						const c = ix + 1 + gridX1 * (iy + 1);
						if (lastX) {
							indices.push(d, c);
						}
						if (lastY) {
							indices.push(b, c);
						}
					}
				}
			}
			geometry.setIndex(indices);
		}
		return geometry;
	}
}
