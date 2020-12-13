import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {TorusBufferGeometry} from 'three/src/geometries/TorusBufferGeometry';
import {Vector3} from 'three/src/math/Vector3';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface TorusSopParams extends DefaultOperationParams {
	radius: number;
	radius_tube: number;
	segments_radial: number;
	segments_tube: number;
	center: Vector3;
}

export class TorusSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TorusSopParams = {
		radius: 1,
		radius_tube: 1,
		segments_radial: 20,
		segments_tube: 12,
		center: new Vector3(0, 0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'torus'> {
		return 'torus';
	}

	cook(input_contents: CoreGroup[], params: TorusSopParams) {
		const radius = params.radius;
		const radius_tube = params.radius_tube;
		const segments_radial = params.segments_radial;
		const segments_tube = params.segments_tube;

		const geometry = new TorusBufferGeometry(radius, radius_tube, segments_radial, segments_tube);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return this.create_core_group_from_geometry(geometry);
	}
}
