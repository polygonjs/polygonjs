import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {ATTRIBUTE_CLASSES, AttribClass, AttribType, ATTRIBUTE_TYPES} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../../engine/poly/Assert';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {addPointAttribute} from './utils/attribCreate/AttribCreatePoint';
import {addVertexAttribute} from './utils/attribCreate/AttribCreateVertex';
import {addPrimitiveAttribute} from './utils/attribCreate/AttribCreatePrimitive';
import {addObjectAttributeWithoutExpression} from './utils/attribCreate/AttribCreateObject';
import {addCoreGroupAttribute} from './utils/attribCreate/AttribCreateCoreGroup';

export interface AttribCreateSopParams extends DefaultOperationParams {
	group: string;
	class: number;
	type: number;
	name: string;
	size: number;
	value1: number;
	value2: Vector2;
	value3: Vector3;
	value4: Vector4;
	string: string;
}

export class AttribCreateSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribCreateSopParams = {
		group: '',
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
		type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
		name: 'newAttrib',
		size: 1,
		value1: 0,
		value2: new Vector2(0, 0),
		value3: new Vector3(0, 0, 0),
		value4: new Vector4(0, 0, 0, 0),
		string: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribCreate'> {
		return 'attribCreate';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribCreateSopParams) {
		const coreGroup = inputCoreGroups[0];
		const attribName = params.name;
		if (attribName && attribName.trim() != '') {
			this._addAttribute(ATTRIBUTE_CLASSES[params.class], coreGroup, params);
		} else {
			this.states?.error.set('attribute name is not valid');
		}
		return coreGroup;
	}
	private _addAttribute(attribClass: AttribClass, coreGroup: CoreGroup, params: AttribCreateSopParams) {
		const attribType = ATTRIBUTE_TYPES[params.type];
		switch (attribClass) {
			case AttribClass.POINT:
				return addPointAttribute(attribType, coreGroup, params);
			case AttribClass.VERTEX:
				return addVertexAttribute(attribType, coreGroup, params);
			case AttribClass.PRIMITIVE:
				return addPrimitiveAttribute(attribType, coreGroup, params);
			case AttribClass.OBJECT:
				return addObjectAttributeWithoutExpression(attribType, coreGroup, params);
			case AttribClass.CORE_GROUP:
				return addCoreGroupAttribute(attribType, coreGroup, params);
		}
		TypeAssert.unreachable(attribClass);
	}
}
