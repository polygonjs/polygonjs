import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SubdivisionModifier} from '../../../modules/three/examples/jsm/modifiers/SubdivisionModifier';
import {BufferGeometry} from 'three';
import {Mesh} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface SubdivideSopParams extends DefaultOperationParams {
	subdivisions: number;
}

export class SubdivideSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SubdivideSopParams = {
		subdivisions: 1,
	};
	static override type(): Readonly<'subdivide'> {
		return 'subdivide';
	}

	override cook(input_contents: CoreGroup[], params: SubdivideSopParams) {
		const core_group = input_contents[0];
		const modifier = new SubdivisionModifier(params.subdivisions);

		for (let object of core_group.objects()) {
			const geometry = (object as Mesh).geometry as BufferGeometry;
			if (geometry) {
				const subdivided_geometry = modifier.modify(geometry) as BufferGeometry;
				(object as Mesh).geometry = subdivided_geometry;
			}
		}

		return core_group;
	}
}
