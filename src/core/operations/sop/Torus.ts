import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {TorusBufferGeometry} from 'three/src/geometries/TorusBufferGeometry';
import {Vector3} from 'three/src/math/Vector3';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface TorusSopParams extends DefaultOperationParams {
	radius: number;
	radiusTube: number;
	segmentsRadial: number;
	segmentsTube: number;
	center: Vector3;
}

export class TorusSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TorusSopParams = {
		radius: 1,
		radiusTube: 1,
		segmentsRadial: 20,
		segmentsTube: 12,
		center: new Vector3(0, 0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'torus'> {
		return 'torus';
	}

	cook(input_contents: CoreGroup[], params: TorusSopParams) {
		const radius = params.radius;
		const radiusTube = params.radiusTube;
		const segmentsRadial = params.segmentsRadial;
		const segmentsTube = params.segmentsTube;

		const geometry = new TorusBufferGeometry(radius, radiusTube, segmentsRadial, segmentsTube);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return this.create_core_group_from_geometry(geometry);
	}
}
