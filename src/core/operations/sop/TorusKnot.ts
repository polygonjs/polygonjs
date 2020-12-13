import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {TorusKnotBufferGeometry} from 'three/src/geometries/TorusKnotBufferGeometry';
import {Vector3} from 'three/src/math/Vector3';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface TorusKnotSopParams extends DefaultOperationParams {
	radius: number;
	radius_tube: number;
	segments_radial: number;
	segments_tube: number;
	p: number;
	q: number;
	center: Vector3;
}

export class TorusKnotSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TorusKnotSopParams = {
		radius: 1,
		radius_tube: 1,
		segments_radial: 64,
		segments_tube: 8,
		p: 2,
		q: 3,
		center: new Vector3(0, 0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'torus_knot'> {
		return 'torus_knot';
	}

	cook(input_contents: CoreGroup[], params: TorusKnotSopParams) {
		const radius = params.radius;
		const radius_tube = params.radius_tube;
		const segments_radial = params.segments_radial;
		const segments_tube = params.segments_tube;
		const p = params.p;
		const q = params.q;

		const geometry = new TorusKnotBufferGeometry(radius, radius_tube, segments_radial, segments_tube, p, q);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return this.create_core_group_from_geometry(geometry);
	}
}
