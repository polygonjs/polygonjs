/**
 * Deletes an attribute from the geometry or object.
 *
 *
 */
// import {TypeAssert} from './../../poly/Assert';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribClassMenuEntries, AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {
	ENTITY_CLASS_FACTORY,
	// corePointClassFactory,
	// corePrimitiveClassFactory,
	// coreVertexClassFactory,
} from '../../../core/geometry/CoreObjectFactory';
import {filterObjectsFromCoreGroup} from '../../../core/geometry/Mask';
class AttribDeleteSopParamsConfig extends NodeParamsConfig {
	/** @param the group this applies to */
	group = ParamConfig.STRING('');
	/** @param attribute class (geometry or object) */
	class = ParamConfig.INTEGER(ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT), {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param attribute name to delete */
	name = ParamConfig.STRING('');
}
const ParamsConfig = new AttribDeleteSopParamsConfig();

export class AttribDeleteSopNode extends TypedSopNode<AttribDeleteSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ATTRIB_DELETE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = filterObjectsFromCoreGroup(coreGroup, this.pv);
		const attribClass = ATTRIBUTE_CLASSES[this.pv.class];
		const factory = ENTITY_CLASS_FACTORY[attribClass];
		if (factory) {
			for (const object of objects) {
				const entityClass = factory(object);
				const attribNames = entityClass.attributeNamesMatchingMask(object, this.pv.name);
				for (const attribName of attribNames) {
					entityClass.deleteAttribute(object, attribName);
				}
			}
		} else {
			const attribNames = coreGroup.attributeNamesMatchingMask(this.pv.name);
			for (const attribName of attribNames) {
				coreGroup.deleteAttribute(attribName);
			}
		}

		// const attribNames = this._attribNames(coreGroup, attribClass);
		// for (let attribName of attribNames) {
		// 	this._deleteAttrib(coreGroup, attribName, attribClass);
		// }

		this.setCoreGroup(coreGroup);
	}

	// private _attribNames(coreGroup: CoreGroup, attribClass: AttribClass): string[] {
	// 	switch (attribClass) {
	// 		case AttribClass.POINT:
	// 			return coreGroup.pointAttribNamesMatchingMask(this.pv.name);
	// 		case AttribClass.VERTEX: {
	// 			this.states.error.set('vertex attributes are not supported yet');
	// 			return [];
	// 		}
	// 		case AttribClass.PRIMITIVE: {
	// 			this.states.error.set('primitive attributes are not supported yet');
	// 			return [];
	// 		}
	// 		case AttribClass.OBJECT:
	// 			return coreGroup.objectAttribNamesMatchingMask(this.pv.name);
	// 		case AttribClass.CORE_GROUP:
	// 			return coreGroup.attribNamesMatchingMask(this.pv.name);
	// 	}
	// 	TypeAssert.unreachable(attribClass);
	// }
	// private _deleteAttrib(coreGroup: CoreGroup, attribName: string, attribClass: AttribClass) {
	// 	switch (attribClass) {
	// 		case AttribClass.POINT: {
	// 			return this._deletePointAttribute(coreGroup, attribName);
	// 		}
	// 		case AttribClass.VERTEX: {
	// 			return this._deleteVertexAttribute(coreGroup, attribName);
	// 		}
	// 		case AttribClass.PRIMITIVE: {
	// 			return this._deletePrimitiveAttribute(coreGroup, attribName);
	// 		}
	// 		case AttribClass.OBJECT: {
	// 			return this._deleteObjectAttribute(coreGroup, attribName);
	// 		}
	// 		case AttribClass.CORE_GROUP: {
	// 			return this._deleteCoreGroupAttribute(coreGroup, attribName);
	// 		}
	// 	}
	// 	TypeAssert.unreachable(attribClass);
	// }

	// private _deleteVertexAttribute(core_group: CoreGroup, attribName: string) {
	// 	const objects = core_group.allObjects();
	// 	for (let object of objects) {
	// 		object.traverse((child) => {
	// 			const coreVertexClass = coreVertexClassFactory(child);
	// 			coreVertexClass.deleteAttribute(child, attribName);
	// 		});
	// 	}
	// }
	// private _deletePointAttribute(core_group: CoreGroup, attribName: string) {
	// 	const objects = core_group.allObjects();
	// 	for (let object of objects) {
	// 		object.traverse((child) => {
	// 			const corePointClass = corePointClassFactory(child);
	// 			corePointClass.deleteAttribute(child, attribName);
	// 		});
	// 	}
	// }
	// private _deletePrimitiveAttribute(core_group: CoreGroup, attribName: string) {
	// 	const objects = core_group.allObjects();
	// 	for (let object of objects) {
	// 		object.traverse((child) => {
	// 			const corePrimitiveClass = corePrimitiveClassFactory(child);
	// 			corePrimitiveClass.deleteAttribute(child, attribName);
	// 		});
	// 	}
	// }
	// private _deleteObjectAttribute(coreGroup: CoreGroup, attribName: string) {
	// 	const coreObjects = coreGroup.allCoreObjects();
	// 	for (let coreObject of coreObjects) {
	// 		coreObject.deleteAttribute(attribName);
	// 	}
	// }
	// private _deleteCoreGroupAttribute(coreGroup: CoreGroup, attribName: string) {
	// 	coreGroup.deleteAttribute(attribName);
	// }
}
