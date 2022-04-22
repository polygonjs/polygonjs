import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TorusKnotBufferGeometry} from 'three';
import {Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface TorusKnotSopParams extends DefaultOperationParams {
	radius: number;
	radiusTube: number;
	segmentsRadial: number;
	segmentsTube: number;
	p: number;
	q: number;
	center: Vector3;
}

export class TorusKnotSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TorusKnotSopParams = {
		radius: 1,
		radiusTube: 0.25,
		segmentsRadial: 128,
		segmentsTube: 8,
		p: 2,
		q: 3,
		center: new Vector3(0, 0, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'torusKnot'> {
		return 'torusKnot';
	}

	override cook(input_contents: CoreGroup[], params: TorusKnotSopParams) {
		const radius = params.radius;
		const radiusTube = params.radiusTube;
		const segmentsRadial = params.segmentsRadial;
		const segmentsTube = params.segmentsTube;
		const p = params.p;
		const q = params.q;

		const geometry = new TorusKnotBufferGeometry(radius, radiusTube, segmentsRadial, segmentsTube, p, q);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return this.createCoreGroupFromGeometry(geometry);
	}
}
