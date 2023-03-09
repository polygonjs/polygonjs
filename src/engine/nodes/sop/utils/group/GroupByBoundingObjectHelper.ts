import {Vector3, Box3} from 'three';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreEntity} from '../../../../../core/geometry/Entity';

const bbox = new Box3();
const tmpPosition = new Vector3();

export class GroupByBoundingObjectHelper {
	evalForEntities(allEntities: CoreEntity[], selectedIndices: Set<number>, boundingCoreGroup: CoreGroup) {
		boundingCoreGroup.boundingBox(bbox);
		for (let entity of allEntities) {
			entity.position(tmpPosition);
			if (bbox.containsPoint(tmpPosition)) {
				selectedIndices.add(entity.index());
			}
		}
	}
}
