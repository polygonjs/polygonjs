import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {
	setObjectBoolean,
	getObjectBoolean,
	getObjectString,
	setObjectString,
	setObjectNumber,
	getObjectNumber,
} from '../geometry/AttributeUtils';
import {WFCTileSide, WFC_ALL_HORIZONTAL_SIDES} from './WFCCommon';
import {TypeAssert} from '../../engine/poly/Assert';

export enum WFCQuadAttribute {
	QUAD_ID = 'quadId',
	FLOOR_INDEX = 'floorIndex',
	TILE_ID = 'tileId',
	SOLVE_ALLOWED = 'solveAllowed',
}

export enum WFCTileAttribute {
	// IS_TILE = 'WFCTileAttribute_isTile',
	TILE_ID = 'WFCTileAttribute_tileId',
	ROTATION_Y_ALLOWED = 'WFCTileAttribute_rotationYAllowed',
	WEIGHT = 'WFCTileAttribute_weight',
	IS_ERROR_TILE = 'WFCTileAttribute_isErrorTile',
	IS_UNRESOLVED_TILE = 'WFCTileAttribute_isUnresolvedTile',

	// sidename
	SIDE_NAME_S = 'WFCTileAttribute_sideNameS',
	SIDE_NAME_N = 'WFCTileAttribute_sideNameN',
	SIDE_NAME_W = 'WFCTileAttribute_sideNameW',
	SIDE_NAME_E = 'WFCTileAttribute_sideNameE',
	SIDE_NAME_H = 'WFCTileAttribute_sideNameAllHorizontalSides',
	SIDE_NAME_B = 'WFCTileAttribute_sideNameB',
	SIDE_NAME_T = 'WFCTileAttribute_sideNameT',

	// solver output
	ENTROPY = 'WFCTileAttribute_entropy',
	STEP = 'WFCTileAttribute_step',
}
export enum WFCConnectionAttribute {
	// IS_CONNECTION = 'WFCTileAttribute_isConnection',
	ID0 = 'WFCTileAttribute_tileId0',
	ID1 = 'WFCTileAttribute_tileId1',
	SIDE0 = 'WFCTileAttribute_tileSide0',
	SIDE1 = 'WFCTileAttribute_tileSide1',
}

type WFCTileSideAttribute =
	| WFCTileAttribute.SIDE_NAME_S
	| WFCTileAttribute.SIDE_NAME_N
	| WFCTileAttribute.SIDE_NAME_W
	| WFCTileAttribute.SIDE_NAME_E
	| WFCTileAttribute.SIDE_NAME_H
	| WFCTileAttribute.SIDE_NAME_B
	| WFCTileAttribute.SIDE_NAME_T;
function _sideNameAttribute(side: WFCTileSide): WFCTileSideAttribute {
	switch (side) {
		case 'n':
			return WFCTileAttribute.SIDE_NAME_N;
		case 's':
			return WFCTileAttribute.SIDE_NAME_S;
		case 'w':
			return WFCTileAttribute.SIDE_NAME_W;
		case 'e':
			return WFCTileAttribute.SIDE_NAME_E;
		case WFC_ALL_HORIZONTAL_SIDES:
			return WFCTileAttribute.SIDE_NAME_H;
		case 'b':
			return WFCTileAttribute.SIDE_NAME_B;
		case 't':
			return WFCTileAttribute.SIDE_NAME_T;
	}
	TypeAssert.unreachable(side);
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
	static setWeight(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, WFCTileAttribute.WEIGHT, value);
	}
	static getWeight(object: ObjectContent<CoreObjectType>) {
		return getObjectNumber(object, WFCTileAttribute.WEIGHT, 1);
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
	static getSideName(object: ObjectContent<CoreObjectType>, side: WFCTileSide): string | undefined {
		return getObjectString(object, _sideNameAttribute(side));
	}
	static setSideName(object: ObjectContent<CoreObjectType>, side: WFCTileSide, value: string) {
		setObjectString(object, _sideNameAttribute(side), value);
	}
}
export class CoreWFCRuleAttribute {
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
