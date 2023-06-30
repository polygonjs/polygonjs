import {CoreObject} from '../geometry/Object';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {Vector3} from 'three';

export enum SoftBodyIdAttribute {
	SOLVER_NODE = 'SoftBodyIdAttribute_node',
	EMBED_HIGH_RES_NODE = 'SoftBodyIdAttribute_embedHighResNode',
	EPHEMERAL_ID = 'SoftBodyIdAttribute_ephemeralId',
}
export enum SoftBodyCommonAttribute {
	// GRAVITY = 'SoftBodyAttribute_gravity',
	// SUB_STEPS = 'SoftBodyAttribute_subSteps', // substep is handled by the js/stepSimulation node
	// EDGE_COMPLIANCE = 'SoftBodyAttribute_edgeCompliance',
	// VOLUME_COMPLIANCED = 'SoftBodyAttribute_volumeCompliance',
	HIGH_RES_SKINNING_LOOKUP_SPACING = 'SoftBodyAttribute_highResSkinningLookupSpacing',
	HIGH_RES_SKINNING_LOOKUP_PADDING = 'SoftBodyAttribute_highResSkinningLookupPadding',
}

type SoftBodyAttribute = SoftBodyCommonAttribute | SoftBodyIdAttribute;

export class CoreSoftBodyBaseAttribute {
	protected static _setVector3(object: ObjectContent<CoreObjectType>, attribName: SoftBodyAttribute, value: Vector3) {
		CoreObject.addAttribute(object, attribName, value);
	}
	protected static _getVector3(
		object: ObjectContent<CoreObjectType>,
		attribName: SoftBodyAttribute,
		target: Vector3
	) {
		CoreObject.attribValue(object, attribName, 0, target);
	}
	protected static _setNumber(object: ObjectContent<CoreObjectType>, attribName: SoftBodyAttribute, value: number) {
		CoreObject.addAttribute(object, attribName, value);
	}

	protected static _getNumber(
		object: ObjectContent<CoreObjectType>,
		attribName: SoftBodyAttribute,
		defaultValue: number
	): number {
		const val = CoreObject.attribValue(object, attribName, 0) as number | undefined;
		if (val == null) {
			return defaultValue;
		}
		return val;
	}
}

export class CoreSoftBodyAttribute extends CoreSoftBodyBaseAttribute {
	static setTetEmbedHighResNodeId(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, SoftBodyIdAttribute.EMBED_HIGH_RES_NODE, value);
	}
	static getTetEmbedHighResNodeId(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, SoftBodyIdAttribute.EMBED_HIGH_RES_NODE, -1);
	}
	// static setGravity(object: ObjectContent<CoreObjectType>, value: Vector3) {
	// 	this._setVector3(object, SoftBodyCommonAttribute.GRAVITY, value);
	// }
	// static getGravity(object: ObjectContent<CoreObjectType>, value: Vector3) {
	// 	return this._getVector3(object, SoftBodyCommonAttribute.GRAVITY, value);
	// }

	// static setEdgeCompliance(object: ObjectContent<CoreObjectType>, value: number) {
	// 	this._setNumber(object, SoftBodyCommonAttribute.EDGE_COMPLIANCE, value);
	// }
	// static getEdgeCompliance(object: ObjectContent<CoreObjectType>) {
	// 	return this._getNumber(object, SoftBodyCommonAttribute.EDGE_COMPLIANCE, 100);
	// }
	// static setVolumeCompliance(object: ObjectContent<CoreObjectType>, value: number) {
	// 	this._setNumber(object, SoftBodyCommonAttribute.VOLUME_COMPLIANCED, value);
	// }
	// static getVolumeCompliance(object: ObjectContent<CoreObjectType>) {
	// 	return this._getNumber(object, SoftBodyCommonAttribute.VOLUME_COMPLIANCED, 0);
	// }
	static setHighResSkinningLookupSpacing(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, SoftBodyCommonAttribute.HIGH_RES_SKINNING_LOOKUP_SPACING, value);
	}
	static getHighResSkinningLookupSpacing(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, SoftBodyCommonAttribute.HIGH_RES_SKINNING_LOOKUP_SPACING, 100);
	}
	static setHighResSkinningLookupPadding(object: ObjectContent<CoreObjectType>, value: number) {
		this._setNumber(object, SoftBodyCommonAttribute.HIGH_RES_SKINNING_LOOKUP_PADDING, value);
	}
	static getHighResSkinningLookupPadding(object: ObjectContent<CoreObjectType>) {
		return this._getNumber(object, SoftBodyCommonAttribute.HIGH_RES_SKINNING_LOOKUP_PADDING, 100);
	}
}
