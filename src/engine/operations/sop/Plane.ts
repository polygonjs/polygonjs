import {BaseSopOperation} from './_Base';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {CoreTransform} from '../../../core/Transform';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface PlaneSopParams extends DefaultOperationParams {
	size: Vector2;
	useSegmentsCount: boolean;
	stepSize: number;
	segments: Vector2;
	direction: Vector3;
	center: Vector3;
}
const DEFAULT_UP = new Vector3(0, 0, 1);
const ROTATE_START = new Vector3(0, 0, 1);
const ROTATE_END = new Vector3(0, 1, 0);

export class PlaneSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PlaneSopParams = {
		size: new Vector2(1, 1),
		useSegmentsCount: false,
		stepSize: 1,
		segments: new Vector2(1, 1),
		direction: new Vector3(0, 1, 0),
		center: new Vector3(0, 0, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'plane'> {
		return 'plane';
	}

	private _coreTransform = new CoreTransform();

	override cook(input_contents: CoreGroup[], params: PlaneSopParams) {
		const core_group = input_contents[0];
		if (core_group) {
			return this._cook_with_input(core_group, params);
		} else {
			return this._cook_without_input(params);
		}
	}
	private _cook_without_input(params: PlaneSopParams) {
		const geometry = this._create_plane(params.size, params);

		// convert to buffer geo, as some render problems can occur otherwise
		// geometry = BufferGeometryUtils.mergeBufferGeometries([geometry])
		// console.log(geometry, geometry.isBufferGeometry)
		this._coreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);

		const matrix = this._coreTransform.translationMatrix(params.center);
		geometry.applyMatrix4(matrix);

		return this.createCoreGroupFromGeometry(geometry);
	}
	private _size = new Vector3();
	private _center = new Vector3();
	private _cook_with_input(core_group: CoreGroup, params: PlaneSopParams) {
		const bbox = core_group.boundingBox();
		bbox.getSize(this._size);
		bbox.getCenter(this._center);

		// TODO: rotate the input geo to get the accurate bbox
		const size2d = new Vector2(this._size.x, this._size.z);
		const geometry = this._create_plane(size2d, params);

		this._coreTransform.rotateGeometry(geometry, ROTATE_START, ROTATE_END);

		const matrix = this._coreTransform.translationMatrix(this._center);
		geometry.applyMatrix4(matrix);

		return this.createCoreGroupFromGeometry(geometry);
	}

	private _segmentsCount = new Vector2(1, 1);
	private _create_plane(size: Vector2, params: PlaneSopParams) {
		size = size.clone();
		if (isBooleanTrue(params.useSegmentsCount)) {
			this._segmentsCount.x = Math.floor(params.segments.x);
			this._segmentsCount.y = Math.floor(params.segments.y);
		} else {
			if (params.stepSize > 0) {
				this._segmentsCount.x = Math.floor(size.x / params.stepSize);
				this._segmentsCount.y = Math.floor(size.y / params.stepSize);
				size.x = this._segmentsCount.x * params.stepSize;
				size.y = this._segmentsCount.y * params.stepSize;
			}
		}
		return new PlaneBufferGeometry(size.x, size.y, this._segmentsCount.x, this._segmentsCount.y);
	}
}
