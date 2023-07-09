import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {isBooleanTrue} from '../../../core/Type';
import {populateAdjacency3, POPULATE_ADJACENCY_DEFAULT} from '../../../core/geometry/operation/Adjacency';
import {SopType} from '../../poly/registers/nodes/types/Sop';

interface AdjacencySopParams extends DefaultOperationParams {
	applyToChildren: boolean;
	adjacencyCountName: string;
	adjacencyBaseName: string;
}

export class AdjacencySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AdjacencySopParams = {
		applyToChildren: false,
		...POPULATE_ADJACENCY_DEFAULT,
	};
	static override type(): Readonly<SopType.ADJACENCY> {
		return SopType.ADJACENCY;
	}

	override cook(inputCoreGroups: CoreGroup[], params: AdjacencySopParams) {
		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.threejsObjects();
		for (let object of objects) {
			if (isBooleanTrue(params.applyToChildren)) {
				object.traverse((child) => {
					populateAdjacency3(child, params);
				});
			} else {
				populateAdjacency3(object, params);
			}
		}

		return coreGroup;
	}
}
