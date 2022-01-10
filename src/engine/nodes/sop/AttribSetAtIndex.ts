/**
 * Sets an attribute value for a specific point or object
 *
 * @remarks
 * While the same operation is possible using the sop/attribCreate
 * and its group parameter, this node is more performant.
 * Also, unlike the sop/attribCreate, it does not accept point specific variables such as @ptnum
 * in expressions.
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
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypeAssert} from '../../poly/Assert';

import {AttribSetAtIndexSopOperation} from '../../operations/sop/AttribSetAtIndex';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribSetAtIndexSopOperation.DEFAULT_PARAMS;
class AttribSetAtIndexSopParamsConfig extends NodeParamsConfig {
	/** @param the point or object index this applies to */
	index = ParamConfig.INTEGER(DEFAULT.index, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
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
		visibleIf: {type: AttribType.NUMERIC},
	});
	/** @param the value for a float attribute */
	value1 = ParamConfig.FLOAT(DEFAULT.value1, {
		visibleIf: {type: AttribType.NUMERIC, size: 1},
	});
	/** @param the value for a vector2 */
	value2 = ParamConfig.VECTOR2(DEFAULT.value2, {
		visibleIf: {type: AttribType.NUMERIC, size: 2},
	});
	/** @param the value for a vector3 */
	value3 = ParamConfig.VECTOR3(DEFAULT.value3, {
		visibleIf: {type: AttribType.NUMERIC, size: 3},
	});
	/** @param the value for a vector4 */
	value4 = ParamConfig.VECTOR4(DEFAULT.value4, {
		visibleIf: {type: AttribType.NUMERIC, size: 4},
	});
	/** @param the value for a string attribute */
	string = ParamConfig.STRING(DEFAULT.string, {
		visibleIf: {type: AttribType.STRING},
	});
}
const ParamsConfig = new AttribSetAtIndexSopParamsConfig();
export class AttribSetAtIndexSopNode extends TypedSopNode<AttribSetAtIndexSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'attribSetAtIndex';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribSetAtIndexSopOperation.INPUT_CLONED_STATE);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}

	private _operation: AttribSetAtIndexSopOperation | undefined;
	cook(inputCoreGroups: CoreGroup[]) {
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
			this._operation = this._operation || new AttribSetAtIndexSopOperation(this.scene(), this.states);
			const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
			this.setCoreGroup(coreGroup);
		}
	}
	private _addAttribute(attribClass: AttribClass, coreGroup: CoreGroup) {
		const attribType = ATTRIBUTE_TYPES[this.pv.type];
		switch (attribClass) {
			case AttribClass.VERTEX:
				this._addPointAttribute(attribType, coreGroup);
				return this.setCoreGroup(coreGroup);
			case AttribClass.OBJECT:
				this._addObjectAttribute(attribType, coreGroup);
				return this.setCoreGroup(coreGroup);
		}
		TypeAssert.unreachable(attribClass);
	}

	private _addPointAttribute(attribType: AttribType, coreGroup: CoreGroup) {
		const coreObjects = coreGroup.coreObjects();
		switch (attribType) {
			case AttribType.NUMERIC: {
				for (let i = 0; i < coreObjects.length; i++) {
					this._addNumericAttributeToPoints(coreObjects[i]);
				}
				return;
			}
			case AttribType.STRING: {
				for (let i = 0; i < coreObjects.length; i++) {
					this._addStringAttributeToPoints(coreObjects[i]);
				}
				return;
			}
		}
		TypeAssert.unreachable(attribType);
	}
	private _addObjectAttribute(attribType: AttribType, coreGroup: CoreGroup) {
		const allCoreObjects = coreGroup.coreObjects();

		// add attrib if non existent
		const attribName = this.pv.name;
		const defaultValue = AttribSetAtIndexSopOperation.defaultAttribValue(this.pv);
		if (defaultValue != null) {
			for (let coreObject of allCoreObjects) {
				if (!coreObject.hasAttrib(attribName)) {
					coreObject.setAttribValue(attribName, defaultValue);
				}
			}
		}

		const coreObject = allCoreObjects[this.pv.index];
		if (!coreObject) {
			return;
		}

		switch (attribType) {
			case AttribType.NUMERIC:
				this._addNumericAttributeToObject(coreObject);
				return;
			case AttribType.STRING:
				this._addStringAttributeToObject(coreObject);
				return;
		}
		TypeAssert.unreachable(attribType);
	}

	private _addNumericAttributeToPoints(coreObject: CoreObject) {
		const coreGeometry = coreObject.coreGeometry();
		if (!coreGeometry) {
			return;
		}
		const attribName = CoreAttribute.remapName(this.pv.name);
		if (!coreGeometry.hasAttrib(attribName)) {
			coreGeometry.addNumericAttrib(attribName, this.pv.size, 0);
		}
		const attrib = coreGeometry.geometry().attributes[attribName];
		const array = attrib.array as number[];
		const {index, size} = this.pv;
		switch (size) {
			case 1: {
				if (index < array.length) {
					array[index] = this.pv.value1;
					attrib.needsUpdate = true;
				}
				break;
			}
			case 2: {
				const i2 = index * 2;
				if (i2 < array.length) {
					this.pv.value2.toArray(array, i2);
					attrib.needsUpdate = true;
				}
				break;
			}
			case 3: {
				const i3 = index * 3;
				if (i3 < array.length) {
					this.pv.value3.toArray(array, i3);
					attrib.needsUpdate = true;
				}
				break;
			}
			case 4: {
				const i4 = index * 4;
				if (i4 < array.length) {
					this.pv.value4.toArray(array, i4);
					attrib.needsUpdate = true;
				}
				break;
			}
		}

		// const point = coreObject.points()[this.pv.index];

		// if (!point) {
		// 	return;
		// }

		// const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];
		// point.setAttribValue(attribName, param.value);
	}

	private _addNumericAttributeToObject(coreObject: CoreObject) {
		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];
		const attribName = this.pv.name;
		coreObject.setAttribValue(attribName, param.value);
	}

	private _addStringAttributeToPoints(coreObject: CoreObject) {
		const coreGeometry = coreObject.coreGeometry();
		if (!coreGeometry) {
			return;
		}
		const attribName = this.pv.name;
		if (!coreGeometry.hasAttrib(attribName)) {
			const tmpIndexData = CoreAttribute.arrayToIndexedArrays(['']);
			coreGeometry.setIndexedAttribute(attribName, tmpIndexData['values'], tmpIndexData['indices']);
		}

		const allPoints = coreObject.points();

		const param = this.p.string;

		const stringValues: string[] = new Array(allPoints.length);
		for (let point of allPoints) {
			let currentValue = point.stringAttribValue(attribName);
			if (currentValue == null) {
				currentValue = '';
			}
			stringValues[point.index()] = currentValue;
		}

		const indexPoint = allPoints[this.pv.index];
		if (indexPoint) {
			stringValues[indexPoint.index()] = param.value;
		}

		const indexData = CoreAttribute.arrayToIndexedArrays(stringValues);
		const geometry = coreObject.coreGeometry();
		if (geometry) {
			geometry.setIndexedAttribute(attribName, indexData['values'], indexData['indices']);
		}
	}

	private _addStringAttributeToObject(coreObject: CoreObject) {
		const param = this.p.string;
		const attribName = this.pv.name;
		coreObject.setAttribValue(attribName, param.value);
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
