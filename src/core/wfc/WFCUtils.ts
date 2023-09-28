import {CoreObjectType, ObjectContent, isObject3D} from '../geometry/ObjectContent';
import {QuadObject} from '../geometry/modules/quad/QuadObject';
import {QuadPrimitive} from '../geometry/modules/quad/QuadPrimitive';
import {CoreWFCTileAttribute, CoreWFCRuleAttribute, WFCQuadAttribute} from './WFCAttributes';

export function filterTileObjects(objects: ObjectContent<CoreObjectType>[]) {
	return objects.filter((object) => CoreWFCTileAttribute.getIsTile(object)).filter(isObject3D);
}
export function filterRuleObjects(objects: ObjectContent<CoreObjectType>[]) {
	return objects.filter((object) => CoreWFCRuleAttribute.getIsConnection(object));
}

export function isQuadNodeSolveAllowed(quadObject: QuadObject, index: number): boolean {
	const hasSolveAllowedAttribute = QuadPrimitive.hasAttribute(quadObject, WFCQuadAttribute.SOLVE_ALLOWED);
	if (!hasSolveAllowedAttribute) {
		// if the solveAllowed attribute is not found,
		// the quadNode is considered solveAllowed==true
		return true;
	}

	const solveAllowed: boolean | undefined = QuadPrimitive.attribValue(
		quadObject,
		index,
		WFCQuadAttribute.SOLVE_ALLOWED
	) as boolean | undefined;
	if (solveAllowed == null) {
		return true;
	}
	return solveAllowed;
}
export function quadPrimitiveFloorIndex(quadObject: QuadObject, index: number): number {
	const floorIndex = QuadPrimitive.attribValue(quadObject, index, WFCQuadAttribute.FLOOR_INDEX) as number | undefined;
	if (floorIndex == null) {
		return 0;
	}
	return floorIndex;
}
export function quadId(quadObject: QuadObject, index: number): number {
	const quadId = QuadPrimitive.attribValue(quadObject, index, WFCQuadAttribute.QUAD_ID) as number | undefined;
	if (quadId == null) {
		return -1;
	}
	return quadId;
}
