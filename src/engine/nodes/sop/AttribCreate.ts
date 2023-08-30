/**
 * Creates an attribute on the geometry or object.
 *
 * @remarks
 * This allows you to create an attribute and define the following:
 * - the group this applies to
 * - the name
 * - the type (numeric or string)
 * - the size (float, vector2, vector3 or vector4)
 * - the class (geometry or object attribute)
 * - the value
 *
 * Note that you can also given an expression to set the value of the attribute, such as `sin(2*@P.z)`
 *
 */
import {TypedSopNode} from './_Base';
import {
	AttribClassMenuEntries,
	AttribTypeMenuEntries,
	AttribClass,
	AttribType,
	ATTRIBUTE_CLASSES,
	ATTRIBUTE_TYPES,
} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypeAssert} from '../../poly/Assert';
import {AttribCreateSopOperation} from '../../operations/sop/AttribCreate';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {addPointAttribute} from './utils/attribCreate/AttribCreatePoint';
import {addPrimitiveAttribute} from './utils/attribCreate/AttribCreatePrimitive';
import {addObjectAttribute} from './utils/attribCreate/AttribCreateObject';
import {addCoreGroupAttribute} from './utils/attribCreate/AttribCreateCoreGroup';

const DEFAULT = AttribCreateSopOperation.DEFAULT_PARAMS;
class AttribCreateSopParamsConfig extends NodeParamsConfig {
	/** @param the group this applies to */
	group = ParamConfig.STRING(DEFAULT.group);
	/** @param the attribute class (geometry or object) */
	class = ParamConfig.INTEGER(DEFAULT.class, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param the attribute type (numeric or string) */
	type = ParamConfig.INTEGER(DEFAULT.type, {
		menu: {
			entries: AttribTypeMenuEntries,
		},
	});
	/** @param the attribute name */
	name = ParamConfig.STRING(DEFAULT.name);
	/** @param the attribute size (1 for float, 2 for vector2, 3 for vector3, 4 for vector4) */
	size = ParamConfig.INTEGER(DEFAULT.size, {
		range: [1, 4],
		rangeLocked: [true, true],
		visibleIf: {type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC)},
	});
	/** @param the value for a float attribute */
	value1 = ParamConfig.FLOAT(DEFAULT.value1, {
		visibleIf: {type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), size: 1},
		expression: {forEntities: true},
	});
	/** @param the value for a vector2 */
	value2 = ParamConfig.VECTOR2(DEFAULT.value2, {
		visibleIf: {type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), size: 2},
		expression: {forEntities: true},
	});
	/** @param the value for a vector3 */
	value3 = ParamConfig.VECTOR3(DEFAULT.value3, {
		visibleIf: {type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), size: 3},
		expression: {forEntities: true},
	});
	/** @param the value for a vector4 */
	value4 = ParamConfig.VECTOR4(DEFAULT.value4, {
		visibleIf: {type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), size: 4},
		expression: {forEntities: true},
	});
	/** @param the value for a string attribute */
	string = ParamConfig.STRING(DEFAULT.string, {
		visibleIf: {type: ATTRIBUTE_TYPES.indexOf(AttribType.STRING)},
		expression: {forEntities: true},
	});
}
const ParamsConfig = new AttribCreateSopParamsConfig();
export class AttribCreateSopNode extends TypedSopNode<AttribCreateSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ATTRIB_CREATE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribCreateSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribCreateSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		// cannot yet convert to an operation, as expressions may be used in this node
		// but we can still use one when no expression is required
		const attribName = this.pv.name;

		if (this._isUsingExpression()) {
			if (attribName && attribName.trim() != '') {
				this._addAttribute(ATTRIBUTE_CLASSES[this.pv.class], inputCoreGroups[0]);
			} else {
				this.states.error.set('attribute name is not valid');
			}
		} else {
			this._operation = this._operation || new AttribCreateSopOperation(this.scene(), this.states);
			const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
			this.setCoreGroup(coreGroup);
		}
	}
	private async _addAttribute(attribClass: AttribClass, coreGroup: CoreGroup) {
		const attribType = ATTRIBUTE_TYPES[this.pv.type];
		switch (attribClass) {
			case AttribClass.POINT:
				await addPointAttribute(attribType, coreGroup, this.p);
				return this.setCoreGroup(coreGroup);
			case AttribClass.PRIMITIVE:
				await addPrimitiveAttribute(attribType, coreGroup, this.p);
				return this.setCoreGroup(coreGroup);
			case AttribClass.OBJECT:
				await addObjectAttribute(attribType, coreGroup, this.p, this.pv);
				return this.setCoreGroup(coreGroup);
			case AttribClass.CORE_GROUP:
				await addCoreGroupAttribute(attribType, coreGroup, this.p, this.pv);
				return this.setCoreGroup(coreGroup);
		}
		TypeAssert.unreachable(attribClass);
	}

	//
	//
	// CHECK IF EXPRESSION IS BEING USED, TO ALLOW EASY SWITCH TO OPERATION
	//
	//
	private _isUsingExpression(): boolean {
		const attribType = ATTRIBUTE_TYPES[this.pv.type];
		switch (attribType) {
			case AttribType.NUMERIC:
				const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];
				return param.hasExpression();
			case AttribType.STRING:
				return this.p.string.hasExpression();
		}
	}

	//
	//
	// API UTILS
	//
	//
	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}
	attribClass() {
		return ATTRIBUTE_CLASSES[this.pv.class];
	}
	setAttribType(type: AttribType) {
		this.p.type.set(ATTRIBUTE_TYPES.indexOf(type));
	}
	attribType() {
		return ATTRIBUTE_TYPES[this.pv.type];
	}
}
