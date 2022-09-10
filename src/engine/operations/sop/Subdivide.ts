import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {LoopSubdivision} from './utils/Subdivide/three-subdivide';
import {Mesh, BufferGeometry} from 'three';
import {mergeVertices} from '../../../modules/three/examples/jsm/utils/BufferGeometryUtils';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface SubdivideSopParams extends DefaultOperationParams {
	subdivisions: number;
	mergeVertices: boolean;
}

export class SubdivideSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SubdivideSopParams = {
		subdivisions: 1,
		mergeVertices: true,
	};
	static override type(): Readonly<'subdivide'> {
		return 'subdivide';
	}

	override cook(inputCoreGroups: CoreGroup[], params: SubdivideSopParams) {
		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.objects();
		for (let object of objects) {
			const geometry = (object as Mesh).geometry as BufferGeometry;
			if (geometry) {
				const subdividedGeometry = LoopSubdivision.modify(geometry, params.subdivisions, {}) as BufferGeometry;
				(object as Mesh).geometry = params.mergeVertices
					? mergeVertices(subdividedGeometry)
					: subdividedGeometry;
			}
		}

		return coreGroup;
	}
}
