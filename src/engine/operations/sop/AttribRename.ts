import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {
	corePointClassFactory,
	coreVertexClassFactory,
	corePrimitiveClassFactory,
	coreObjectFactory,
} from '../../../core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {TypeAssert} from '../../poly/Assert';

interface AttribRenameSopParams extends DefaultOperationParams {
	class: number;
	oldName: string;
	newName: string;
}
const SPLIT_REGEX = /[ ,]+/g;
export class AttribRenameSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribRenameSopParams = {
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
		oldName: '',
		newName: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribRename'> {
		return 'attribRename';
	}
	override cook(inputCoreGroups: CoreGroup[], params: AttribRenameSopParams) {
		const coreGroup = inputCoreGroups[0];
		const oldNames = params.oldName.split(SPLIT_REGEX);
		const newNames = params.newName.split(SPLIT_REGEX);
		const minCount = Math.min(oldNames.length, newNames.length);
		const attribClass = ATTRIBUTE_CLASSES[params.class];
		const objects = coreGroup.allObjects();

		if (attribClass == AttribClass.CORE_GROUP) {
			for (let i = 0; i < minCount; i++) {
				coreGroup.renameAttrib(oldNames[i], newNames[i]);
			}
		} else {
			for (let i = 0; i < minCount; i++) {
				for (const object of objects) {
					this._renameAttribute(object, oldNames[i], newNames[i], attribClass);
				}
			}
		}
		return coreGroup;
	}
	private _renameAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		oldName: string,
		newName: string,
		attribClass: AttribClass
	) {
		switch (attribClass) {
			case AttribClass.POINT: {
				return this._renamePointAttributes(object, oldName, newName);
			}
			case AttribClass.VERTEX: {
				return this._renameVertexAttributes(object, oldName, newName);
			}
			case AttribClass.PRIMITIVE: {
				return this._renamePrimitiveAttributes(object, oldName, newName);
			}
			case AttribClass.OBJECT: {
				return this._renameObjectAttributes(object, oldName, newName);
			}
			case AttribClass.CORE_GROUP: {
				return; // this._renameCoreGroupAttributes(object, oldName, newName);
			}
		}
		TypeAssert.unreachable(attribClass);
	}
	private _renamePointAttributes<T extends CoreObjectType>(
		object: ObjectContent<T>,
		oldName: string,
		newName: string
	) {
		const corePointClass = corePointClassFactory(object);
		corePointClass.renameAttrib(object, oldName, newName);
	}
	private _renameVertexAttributes<T extends CoreObjectType>(
		object: ObjectContent<T>,
		oldName: string,
		newName: string
	) {
		const coreVertexClass = coreVertexClassFactory(object);
		coreVertexClass.renameAttrib(object, oldName, newName);
	}
	private _renamePrimitiveAttributes<T extends CoreObjectType>(
		object: ObjectContent<T>,
		oldName: string,
		newName: string
	) {
		const corePrimitiveClass = corePrimitiveClassFactory(object);
		corePrimitiveClass.renameAttrib(object, oldName, newName);
	}
	private _renameObjectAttributes<T extends CoreObjectType>(
		object: ObjectContent<T>,
		oldName: string,
		newName: string
	) {
		const coreObjectClass = coreObjectFactory(object);
		coreObjectClass.renameAttrib(object, oldName, newName);
	}
	// private _renameCoreGroupAttributes<T extends CoreObjectType>(
	// 	object: ObjectContent<T>,
	// 	oldName: string,
	// 	newName: string
	// ) {}
}
