import {Vector3, Box3} from 'three';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreEntity} from '../../../../../core/geometry/Entity';
import {CoreEntitySelectionState, updateSelectionState} from './GroupCommon';

const bbox = new Box3();
const tmpPosition = new Vector3();

export class GroupByBoundingObjectHelper {
	evalForEntities(
		allEntities: CoreEntity[],
		selectionStates: CoreEntitySelectionState,
		boundingCoreGroup: CoreGroup
	) {
		boundingCoreGroup.boundingBox(bbox);
		for (let entity of allEntities) {
			entity.position(tmpPosition);
			updateSelectionState(selectionStates, entity, bbox.containsPoint(tmpPosition));
		}
	}
}
