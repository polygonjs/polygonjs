import {Object3D, Vector2} from 'three';
import {CoreObject} from '../geometry/Object';
export enum ParticlesAttribute {
	PARTICLES_NODE_ID = 'particles_nodeId',
	MATERIAL_NODE_ID = 'particles_materialNodeId',
	DATA_TYPE = 'particles_dataType',
	AUTO_TEXTURE_SIZE = 'particles_autoTexturesSize',
	MAX_TEXTURE_SIZE = 'particles_maxTexturesSize',
	TEXTURE_SIZE = 'particles_texturesSize',
	PRE_ROLL_FRAMES_COUNT = 'particles_preRollFramesCount',
}

export class CoreParticlesBaseAttribute {
	protected static _setVector2(object: Object3D, attribName: ParticlesAttribute, value: Vector2) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getVector2(object: Object3D, attribName: ParticlesAttribute, target: Vector2) {
		CoreObject.attribValue(object, attribName, 0, target);
	}
	protected static _setNumber(object: Object3D, attribName: ParticlesAttribute, value: number) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _setBoolean(object: Object3D, attribName: ParticlesAttribute, value: boolean) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getNumber(object: Object3D, attribName: ParticlesAttribute, defaultValue: number): number {
		const val = CoreObject.attribValue(object, attribName, 0) as number | undefined;
		if (val == null) {
			return defaultValue;
		}
		return val;
	}
	protected static _getBoolean(object: Object3D, attribName: ParticlesAttribute, defaultValue: boolean): boolean {
		const val = CoreObject.attribValue(object, attribName, 0) as boolean | undefined;
		if (val == null) {
			return defaultValue;
		}
		return val;
	}
	// protected static _setString(object: Object3D, attribName: ParticlesAttribute, value: string) {
	// 	CoreObject.addAttribute(object, attribName, value);
	// }
	// protected static _getString(object: Object3D, attribName: ParticlesAttribute): string | undefined {
	// 	return CoreObject.attribValue(object, attribName, 0) as string | undefined;
	// }
}

export class CoreParticlesAttribute extends CoreParticlesBaseAttribute {
	static setParticlesNodeId(object: Object3D, value: number) {
		this._setNumber(object, ParticlesAttribute.PARTICLES_NODE_ID, value);
	}
	static getMaterialNodeId(object: Object3D): number {
		return this._getNumber(object, ParticlesAttribute.MATERIAL_NODE_ID, -1) as number;
	}
	static setMaterialNodeId(object: Object3D, value: number) {
		this._setNumber(object, ParticlesAttribute.MATERIAL_NODE_ID, value);
	}
	static getParticlesNodeId(object: Object3D): number {
		return this._getNumber(object, ParticlesAttribute.PARTICLES_NODE_ID, -1) as number;
	}

	static setDataType(object: Object3D, value: number) {
		this._setNumber(object, ParticlesAttribute.DATA_TYPE, value);
	}
	static getDataType(object: Object3D) {
		return this._getNumber(object, ParticlesAttribute.DATA_TYPE, 0);
	}
	static setAutoTextureSize(object: Object3D, value: boolean) {
		this._setBoolean(object, ParticlesAttribute.AUTO_TEXTURE_SIZE, value);
	}
	static getAutoTextureSize(object: Object3D) {
		return this._getBoolean(object, ParticlesAttribute.AUTO_TEXTURE_SIZE, true);
	}
	static setMaxTextureSize(object: Object3D, value: Vector2) {
		this._setVector2(object, ParticlesAttribute.MAX_TEXTURE_SIZE, value);
	}
	static getMaxTextureSize(object: Object3D, target: Vector2) {
		return this._getVector2(object, ParticlesAttribute.MAX_TEXTURE_SIZE, target);
	}
	static setTextureSize(object: Object3D, value: Vector2) {
		this._setVector2(object, ParticlesAttribute.TEXTURE_SIZE, value);
	}
	static getTextureSize(object: Object3D, target: Vector2) {
		return this._getVector2(object, ParticlesAttribute.TEXTURE_SIZE, target);
	}
	static setPreRollFramesCount(object: Object3D, value: number) {
		this._setNumber(object, ParticlesAttribute.PRE_ROLL_FRAMES_COUNT, value);
	}
	static getPreRollFramesCount(object: Object3D) {
		return this._getNumber(object, ParticlesAttribute.PRE_ROLL_FRAMES_COUNT, 0);
	}
}
