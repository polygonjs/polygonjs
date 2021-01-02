import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {CoreGeometryUtilCircle} from '../../geometry/util/Circle';
import {ObjectType} from '../../geometry/Constant';
import {CoreTransform} from '../../Transform';
import {CircleBufferGeometry} from 'three/src/geometries/CircleBufferGeometry';

interface CircleSopParams extends DefaultOperationParams {
	radius: number;
	segments: number;
	open: boolean;
	arcAngle: number;
	direction: Vector3;
}
const DEFAULT_UP = new Vector3(0, 0, 1);

export class CircleSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: CircleSopParams = {
		radius: 1,
		segments: 12,
		open: true,
		arcAngle: 360,
		direction: new Vector3(0, 1, 0),
	};
	static type(): Readonly<'circle'> {
		return 'circle';
	}

	private _core_transform = new CoreTransform();
	cook(input_contents: CoreGroup[], params: CircleSopParams) {
		if (params.open) {
			return this._create_circle(params);
		} else {
			return this._create_disk(params);
		}
	}
	private _create_circle(params: CircleSopParams) {
		const geometry = CoreGeometryUtilCircle.create(params.radius, params.segments, params.arcAngle);

		this._core_transform.rotate_geometry(geometry, DEFAULT_UP, params.direction);

		return this.create_core_group_from_geometry(geometry, ObjectType.LINE_SEGMENTS);
	}

	private _create_disk(params: CircleSopParams) {
		const geometry = new CircleBufferGeometry(params.radius, params.segments);

		this._core_transform.rotate_geometry(geometry, DEFAULT_UP, params.direction);

		return this.create_core_group_from_geometry(geometry);
	}
}
