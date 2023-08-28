import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {
	setObjectBoolean,
	getObjectBoolean,
	getObjectString,
	setObjectString,
	setObjectNumber,
} from '../geometry/AttributeUtils';

export enum WFCTileAttribute {
	// IS_TILE = 'WFCTileAttribute_isTile',
	TILE_ID = 'WFCTileAttribute_tileId',
	ROTATION_Y_ALLOWED = 'WFCTileAttribute_rotationYAllowed',
	IS_ERROR_TILE = 'WFCTileAttribute_isErrorTile',
	IS_UNRESOLVED_TILE = 'WFCTileAttribute_isUnresolvedTile',
	ENTROPY = 'WFCTileAttribute_entropy',
}
export enum WFCConnectionAttribute {
	// IS_CONNECTION = 'WFCTileAttribute_isConnection',
	ID0 = 'WFCTileAttribute_tileId0',
	ID1 = 'WFCTileAttribute_tileId1',
	SIDE0 = 'WFCTileAttribute_tileSide0',
	SIDE1 = 'WFCTileAttribute_tileSide1',
}

export class CoreWFCTileAttribute {
	// static setIsTile(object: ObjectContent<CoreObjectType>, value: boolean) {
	// 	setObjectBoolean(object, WFCTileAttribute.IS_TILE, value);
	// }
	static getIsTile(object: ObjectContent<CoreObjectType>) {
		return this.getTileId(object) != null; //getObjectBoolean(object, WFCTileAttribute.IS_TILE, false);
	}
	static setTileId(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, WFCTileAttribute.TILE_ID, value);
	}
	static getTileId(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, WFCTileAttribute.TILE_ID) as string;
	}
	static setRotationYAllowed(object: ObjectContent<CoreObjectType>, value: boolean) {
		setObjectBoolean(object, WFCTileAttribute.ROTATION_Y_ALLOWED, value);
	}
	static getRotationYAllowed(object: ObjectContent<CoreObjectType>) {
		return getObjectBoolean(object, WFCTileAttribute.ROTATION_Y_ALLOWED, false);
	}
	static setIsErrorTile(object: ObjectContent<CoreObjectType>, value: boolean) {
		setObjectBoolean(object, WFCTileAttribute.IS_ERROR_TILE, value);
	}
	static getIsErrorTile(object: ObjectContent<CoreObjectType>): boolean {
		return getObjectBoolean(object, WFCTileAttribute.IS_ERROR_TILE, false) as boolean;
	}
	static setIsUnresolvedTile(object: ObjectContent<CoreObjectType>, value: boolean) {
		setObjectBoolean(object, WFCTileAttribute.IS_UNRESOLVED_TILE, value);
	}
	static getIsUnresolvedTile(object: ObjectContent<CoreObjectType>): boolean {
		return getObjectBoolean(object, WFCTileAttribute.IS_UNRESOLVED_TILE, false) as boolean;
	}
	static setEntropy(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, WFCTileAttribute.ENTROPY, value);
	}
}
export class CoreWFCConnectionAttribute {
	// static setIsConnection(object: ObjectContent<CoreObjectType>, value: boolean) {
	// 	setObjectBoolean(object, WFCConnectionAttribute.IS_CONNECTION, value);
	// }
	static getIsConnection(object: ObjectContent<CoreObjectType>) {
		return this.getId0(object) && this.getId1(object) && this.getSide0(object) && this.getSide1(object); //getObjectBoolean(object, WFCConnectionAttribute.IS_CONNECTION, false);
	}
	static setId0(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, WFCConnectionAttribute.ID0, value);
	}
	static getId0(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, WFCConnectionAttribute.ID0) as string;
	}
	static setId1(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, WFCConnectionAttribute.ID1, value);
	}
	static getId1(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, WFCConnectionAttribute.ID1) as string;
	}
	static setSide0(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, WFCConnectionAttribute.SIDE0, value);
	}
	static getSide0(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, WFCConnectionAttribute.SIDE0) as string;
	}
	static setSide1(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, WFCConnectionAttribute.SIDE1, value);
	}
	static getSide1(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, WFCConnectionAttribute.SIDE1) as string;
	}
}
