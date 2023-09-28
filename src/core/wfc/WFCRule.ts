import {Group, Object3D} from 'three';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {CoreWFCRuleAttribute} from './WFCAttributes';
import {WFCTileSide, WFCRule} from './WFCCommon';

export function validRuleObject(object: ObjectContent<CoreObjectType>) {
	const id0 = CoreWFCRuleAttribute.getId0(object) as string | undefined;
	const id1 = CoreWFCRuleAttribute.getId1(object) as string | undefined;
	const side0 = CoreWFCRuleAttribute.getSide0(object) as WFCTileSide | undefined;
	const side1 = CoreWFCRuleAttribute.getSide1(object) as WFCTileSide | undefined;
	return id0 != undefined && id1 != undefined && side0 != undefined && side1 != undefined;
}
export function wfcRuleFromObject(object: ObjectContent<CoreObjectType>): WFCRule {
	const connection: WFCRule = {
		id0: CoreWFCRuleAttribute.getId0(object),
		id1: CoreWFCRuleAttribute.getId1(object),
		side0: CoreWFCRuleAttribute.getSide0(object) as WFCTileSide,
		side1: CoreWFCRuleAttribute.getSide1(object) as WFCTileSide,
	};
	return connection;
}
export function createRuleObject(rule: WFCRule): Object3D {
	const group = new Group();
	// CoreWFCConnectionAttribute.setIsConnection(group, true);
	CoreWFCRuleAttribute.setId0(group, rule.id0);
	CoreWFCRuleAttribute.setId1(group, rule.id1);
	CoreWFCRuleAttribute.setSide0(group, rule.side0);
	CoreWFCRuleAttribute.setSide1(group, rule.side1);
	return group;
}
// export class WFCConnection {
// 	public readonly id0: string;
// 	public readonly id1: string;
// 	public readonly side0: WFCTileSide;
// 	public readonly side1: WFCTileSide;
// 	constructor(object: ObjectContent<CoreObjectType>) {
// 		this.id0 = CoreWFCConnectionAttribute.getId0(object);
// 		this.id1 = CoreWFCConnectionAttribute.getId1(object);
// 		this.side0 = CoreWFCConnectionAttribute.getSide0(object) as WFCTileSide;
// 		this.side1 = CoreWFCConnectionAttribute.getSide1(object) as WFCTileSide;
// 	}
// 	static validConnectionObject(object: ObjectContent<CoreObjectType>) {
// 		const id0 = CoreWFCConnectionAttribute.getId0(object) as string | undefined;
// 		const id1 = CoreWFCConnectionAttribute.getId1(object) as string | undefined;
// 		const side0 = CoreWFCConnectionAttribute.getSide0(object) as WFCTileSide | undefined;
// 		const side1 = CoreWFCConnectionAttribute.getSide1(object) as WFCTileSide | undefined;
// 		return id0 != undefined && id1 != undefined && side0 != undefined && side1 != undefined;
// 	}
// }
