import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SubdivisionModifier} from '../../../../modules/three/examples/jsm/modifiers/SubdivisionModifier';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';

interface SubdivideSopParams extends DefaultOperationParams {
	subdivisions: number;
}

export class SubdivideSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: SubdivideSopParams = {
		subdivisions: 1,
	};
	static type(): Readonly<'subdivide'> {
		return 'subdivide';
	}

	cook(input_contents: CoreGroup[], params: SubdivideSopParams) {
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
