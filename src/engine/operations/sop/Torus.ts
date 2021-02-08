import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TorusBufferGeometry} from 'three/src/geometries/TorusBufferGeometry';
import {Vector3} from 'three/src/math/Vector3';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CoreTransform} from '../../../core/Transform';

interface TorusSopParams extends DefaultOperationParams {
	radius: number;
	radiusTube: number;
	segmentsRadial: number;
	segmentsTube: number;
	direction: Vector3;
	center: Vector3;
}
const DEFAULT_UP = new Vector3(0, 0, 1);
export class TorusSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TorusSopParams = {
		radius: 1,
		radiusTube: 1,
		segmentsRadial: 20,
		segmentsTube: 12,
		direction: new Vector3(0, 1, 0),
		center: new Vector3(0, 0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'torus'> {
		return 'torus';
	}

	private _core_transform = new CoreTransform();
	cook(input_contents: CoreGroup[], params: TorusSopParams) {
		const radius = params.radius;
		const radiusTube = params.radiusTube;
		const segmentsRadial = params.segmentsRadial;
		const segmentsTube = params.segmentsTube;

		const geometry = new TorusBufferGeometry(radius, radiusTube, segmentsRadial, segmentsTube);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		this._core_transform.rotate_geometry(geometry, DEFAULT_UP, params.direction);
		return this.create_core_group_from_geometry(geometry);
	}
}
