import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {populateAdjacency3, POPULATE_ADJACENCY_DEFAULT} from '../../../core/geometry/operation/Adjacency';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {filterThreejsObjects} from '../../../core/geometry/Mask';

interface AdjacencySopParams extends DefaultOperationParams {
	group: string;
	adjacencyCountName: string;
	adjacencyBaseName: string;
}

export class AdjacencySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AdjacencySopParams = {
		group: '',
		...POPULATE_ADJACENCY_DEFAULT,
	};
	static override type(): Readonly<SopType.ADJACENCY> {
		return SopType.ADJACENCY;
	}

	override cook(inputCoreGroups: CoreGroup[], params: AdjacencySopParams) {
		const coreGroup = inputCoreGroups[0];

		const objects = filterThreejsObjects(coreGroup, params);
		for (let object of objects) {
			populateAdjacency3(object, params);
		}

		return coreGroup;
	}
}
