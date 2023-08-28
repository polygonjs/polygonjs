import {Group, Object3D} from 'three';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {CoreWFCConnectionAttribute} from './WFCAttributes';
import {WFCTileSide, WFCConnection} from './WFCCommon';

export function validConnectionObject(object: ObjectContent<CoreObjectType>) {
	const id0 = CoreWFCConnectionAttribute.getId0(object) as string | undefined;
	const id1 = CoreWFCConnectionAttribute.getId1(object) as string | undefined;
	const side0 = CoreWFCConnectionAttribute.getSide0(object) as WFCTileSide | undefined;
	const side1 = CoreWFCConnectionAttribute.getSide1(object) as WFCTileSide | undefined;
	return id0 != undefined && id1 != undefined && side0 != undefined && side1 != undefined;
}
export function wfcConnectionFromObject(object: ObjectContent<CoreObjectType>): WFCConnection {
	const connection: WFCConnection = {
		id0: CoreWFCConnectionAttribute.getId0(object),
		id1: CoreWFCConnectionAttribute.getId1(object),
		side0: CoreWFCConnectionAttribute.getSide0(object) as WFCTileSide,
		side1: CoreWFCConnectionAttribute.getSide1(object) as WFCTileSide,
	};
	return connection;
}
export function createConnectionObject(connection: WFCConnection): Object3D {
	const group = new Group();
	// CoreWFCConnectionAttribute.setIsConnection(group, true);
	CoreWFCConnectionAttribute.setId0(group, connection.id0);
	CoreWFCConnectionAttribute.setId1(group, connection.id1);
	CoreWFCConnectionAttribute.setSide0(group, connection.side0);
	CoreWFCConnectionAttribute.setSide1(group, connection.side1);
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
