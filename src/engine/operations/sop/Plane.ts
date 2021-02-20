import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {CoreTransform} from '../../../core/Transform';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';

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
	static readonly DEFAULT_PARAMS: PlaneSopParams = {
		size: new Vector2(1, 1),
		useSegmentsCount: false,
		stepSize: 1,
		segments: new Vector2(1, 1),
		direction: new Vector3(0, 1, 0),
		center: new Vector3(0, 0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static type(): Readonly<'plane'> {
		return 'plane';
	}

	private _core_transform = new CoreTransform();

	cook(input_contents: CoreGroup[], params: PlaneSopParams) {
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
		this._core_transform.rotate_geometry(geometry, DEFAULT_UP, params.direction);

		const matrix = this._core_transform.translation_matrix(params.center);
		geometry.applyMatrix4(matrix);

		return this.create_core_group_from_geometry(geometry);
	}
	private _cook_with_input(core_group: CoreGroup, params: PlaneSopParams) {
		const bbox = core_group.boundingBox();
		const size = new Vector3();
		bbox.getSize(size);
		const center = new Vector3();
		bbox.getCenter(center);

		// TODO: rotate the input geo to get the accurate bbox
		const size2d = new Vector2(size.x, size.z);
		const geometry = this._create_plane(size2d, params);

		this._core_transform.rotate_geometry(geometry, ROTATE_START, ROTATE_END);

		const matrix = this._core_transform.translation_matrix(center);
		geometry.applyMatrix4(matrix);

		return this.create_core_group_from_geometry(geometry);
	}

	private _create_plane(size: Vector2, params: PlaneSopParams) {
		let segments_count = new Vector2(1, 1);
		size = size.clone();
		if (isBooleanTrue(params.useSegmentsCount)) {
			segments_count.x = Math.floor(params.segments.x);
			segments_count.y = Math.floor(params.segments.y);
		} else {
			if (params.stepSize > 0) {
				segments_count.x = Math.floor(size.x / params.stepSize);
				segments_count.y = Math.floor(size.y / params.stepSize);
				size.x = segments_count.x * params.stepSize;
				size.y = segments_count.y * params.stepSize;
			}
		}
		return new PlaneBufferGeometry(size.x, size.y, segments_count.x, segments_count.y);
	}
}
