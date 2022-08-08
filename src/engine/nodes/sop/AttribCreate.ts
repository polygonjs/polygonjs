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
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypeAssert} from '../../poly/Assert';
import {BufferGeometry} from 'three';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';

type VectorComponent = 'x' | 'y' | 'z' | 'w';
const COMPONENT_NAMES: Array<VectorComponent> = ['x', 'y', 'z', 'w'];

type ValueArrayByName = Map<string, number[]>;
interface ArraysByGeoUuid {
	X: ValueArrayByName;
	Y: ValueArrayByName;
	Z: ValueArrayByName;
	W: ValueArrayByName;
}

import {AttribCreateSopOperation} from '../../operations/sop/AttribCreate';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
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
		return 'attribCreate';
	}

	private _arraysByGeoUuid: ArraysByGeoUuid = {
		X: new Map(),
		Y: new Map(),
		Z: new Map(),
		W: new Map(),
	};

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
			case AttribClass.VERTEX:
				await this._addPointAttribute(attribType, coreGroup);
				return this.setCoreGroup(coreGroup);
			case AttribClass.OBJECT:
				await this._addObjectAttribute(attribType, coreGroup);
				return this.setCoreGroup(coreGroup);
			case AttribClass.CORE_GROUP:
				await this._addCoreGroupAttribute(attribType, coreGroup);
				return this.setCoreGroup(coreGroup);
		}
		TypeAssert.unreachable(attribClass);
	}

	private async _addPointAttribute(attribType: AttribType, coreGroup: CoreGroup) {
		const coreObjects = coreGroup.coreObjects();
		switch (attribType) {
			case AttribType.NUMERIC: {
				for (let i = 0; i < coreObjects.length; i++) {
					await this._addNumericAttributeToPoints(coreObjects[i]);
				}
				return;
			}
			case AttribType.STRING: {
				for (let i = 0; i < coreObjects.length; i++) {
					await this._addStringAttributeToPoints(coreObjects[i]);
				}
				return;
			}
		}
		TypeAssert.unreachable(attribType);
	}
	private async _addObjectAttribute(attribType: AttribType, coreGroup: CoreGroup) {
		const coreObjects = coreGroup.coreObjectsFromGroup(this.pv.group);

		// add attrib if non existent
		const attribName = this.pv.name;
		const allCoreObjects = coreGroup.coreObjects();
		const defaultValue = AttribCreateSopOperation.defaultAttribValue(this.pv);
		if (defaultValue != null) {
			for (let coreObject of allCoreObjects) {
				if (!coreObject.hasAttrib(attribName)) {
					coreObject.setAttribValue(attribName, defaultValue);
				}
			}
		}

		switch (attribType) {
			case AttribType.NUMERIC:
				await this._addNumericAttributeToObject(coreObjects);
				return;
			case AttribType.STRING:
				await this._addStringAttributeToObject(coreObjects);
				return;
		}
		TypeAssert.unreachable(attribType);
	}
	private async _addCoreGroupAttribute(attribType: AttribType, coreGroup: CoreGroup) {
		switch (attribType) {
			case AttribType.NUMERIC:
				await this._addNumericAttributeToCoreGroup(coreGroup);
				return;
			case AttribType.STRING:
				await this._addStringAttributeToCoreGroup(coreGroup);
				return;
		}
		TypeAssert.unreachable(attribType);
	}

	private async _addNumericAttributeToPoints(coreObject: CoreObject) {
		const coreGeometry = coreObject.coreGeometry();
		if (!coreGeometry) {
			return;
		}
		const points = coreObject.pointsFromGroup(this.pv.group);
		const attribName = CoreAttribute.remapName(this.pv.name);

		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];

		if (param.hasExpression()) {
			if (!coreGeometry.hasAttrib(attribName)) {
				coreGeometry.addNumericAttrib(attribName, this.pv.size, param.value);
			}

			const geometry = coreGeometry.geometry();
			const attrib = geometry.getAttribute(attribName);
			attrib.needsUpdate = true;
			const array = attrib.array as number[];
			if (this.pv.size == 1) {
				if (this.p.value1.expressionController) {
					await this.p.value1.expressionController.computeExpressionForPoints(points, (point, value) => {
						array[point.index() * this.pv.size + 0] = value;
					});
				}
			} else {
				const vparam = [this.p.value2, this.p.value3, this.p.value4][this.pv.size - 2];
				const params = vparam.components;
				const tmpArrays = new Array(params.length);

				const arraysByGeometryUuid = [
					this._arraysByGeoUuid.X,
					this._arraysByGeoUuid.Y,
					this._arraysByGeoUuid.Z,
					this._arraysByGeoUuid.W,
				];

				for (let i = 0; i < params.length; i++) {
					const componentParam = params[i];
					if (componentParam.hasExpression() && componentParam.expressionController) {
						tmpArrays[i] = this._initArrayIfRequired(geometry, arraysByGeometryUuid[i], points.length);
						await componentParam.expressionController.computeExpressionForPoints(points, (point, value) => {
							// array[point.index()*this.pv.size+i] = value
							tmpArrays[i][point.index()] = value;
						});
					} else {
						const value = componentParam.value;
						for (let point of points) {
							array[point.index() * this.pv.size + i] = value;
						}
					}
				}
				// commit the tmp values
				for (let j = 0; j < tmpArrays.length; j++) {
					const tmpArray = tmpArrays[j];
					if (tmpArray != null) {
						for (let i = 0; i < tmpArray.length; i++) {
							const newVal = tmpArray[i];
							if (newVal != null) {
								array[i * this.pv.size + j] = newVal;
							}
						}
					}
				}
			}
		} else {
			// no need to do work here, as this will be done in the operation
		}
	}

	private async _addNumericAttributeToObject(coreObjects: CoreObject[]) {
		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];
		const attribName = this.pv.name;
		if (param.hasExpression()) {
			if (this.pv.size == 1) {
				if (this.p.value1.expressionController) {
					await this.p.value1.expressionController.computeExpressionForObjects(
						coreObjects,
						(coreObject, value) => {
							coreObject.setAttribValue(attribName, value);
						}
					);
				}
			} else {
				const vparam = [this.p.value2, this.p.value3, this.p.value4][this.pv.size - 2];
				let params = vparam.components;
				let valuesByCoreObjectIndex: Map<number, Vector2 | Vector3 | Vector4> = new Map();
				// for (let component_param of params) {
				// 	values.push(component_param.value);
				// }
				const initVector = this._vectorByAttribSize(this.pv.size);
				if (initVector) {
					for (let coreObject of coreObjects) {
						valuesByCoreObjectIndex.set(coreObject.index(), initVector.clone());
					}
					for (let componentIndex = 0; componentIndex < params.length; componentIndex++) {
						const component_param = params[componentIndex];
						const component_name = COMPONENT_NAMES[componentIndex];
						if (component_param.hasExpression() && component_param.expressionController) {
							await component_param.expressionController.computeExpressionForObjects(
								coreObjects,
								(coreObject, value) => {
									const vector = valuesByCoreObjectIndex.get(coreObject.index()) as Vector4;
									vector[component_name] = value;
								}
							);
						} else {
							for (let coreObject of coreObjects) {
								const vector = valuesByCoreObjectIndex.get(coreObject.index()) as Vector4;
								vector[component_name] = component_param.value;
							}
						}
					}
					for (let i = 0; i < coreObjects.length; i++) {
						const coreObject = coreObjects[i];
						const value = valuesByCoreObjectIndex.get(coreObject.index());
						if (value != null) {
							coreObject.setAttribValue(attribName, value);
						}
					}
				}
			}
		} else {
			// no need to do work here, as this will be done in the operation
		}
	}
	private async _addNumericAttributeToCoreGroup(coreGroup: CoreGroup) {
		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];
		const attribName = this.pv.name;
		if (param.hasExpression()) {
			if (this.pv.size == 1) {
				if (this.p.value1.expressionController) {
					await this.p.value1.expressionController.computeExpressionForCoreGroup(
						coreGroup,
						(coreGroup, value) => {
							coreGroup.setAttribValue(attribName, value);
						}
					);
				}
			} else {
				const vparam = [this.p.value2, this.p.value3, this.p.value4][this.pv.size - 2];
				let params = vparam.components;
				let valuesByCoreObjectIndex: Map<number, Vector2 | Vector3 | Vector4> = new Map();
				// for (let component_param of params) {
				// 	values.push(component_param.value);
				// }
				const initVector = this._vectorByAttribSize(this.pv.size);
				if (initVector) {
					// for (let coreObject of coreObjects) {
					valuesByCoreObjectIndex.set(coreGroup.index(), initVector.clone());
					// }
					for (let componentIndex = 0; componentIndex < params.length; componentIndex++) {
						const component_param = params[componentIndex];
						const component_name = COMPONENT_NAMES[componentIndex];
						if (component_param.hasExpression() && component_param.expressionController) {
							await component_param.expressionController.computeExpressionForCoreGroup(
								coreGroup,
								(coreGroup, value) => {
									const vector = valuesByCoreObjectIndex.get(coreGroup.index()) as Vector4;
									vector[component_name] = value;
								}
							);
						} else {
							// for (let coreObject of coreObjects) {
							const vector = valuesByCoreObjectIndex.get(coreGroup.index()) as Vector4;
							vector[component_name] = component_param.value;
							// }
						}
					}
					// for (let i = 0; i < coreObjects.length; i++) {
					// const coreObject = coreObjects[i];
					const value = valuesByCoreObjectIndex.get(coreGroup.index());
					if (value != null) {
						coreGroup.setAttribValue(attribName, value);
					}
					// }
				}
			}
		} else {
			// no need to do work here, as this will be done in the operation
		}
	}

	private async _addStringAttributeToPoints(coreObject: CoreObject) {
		const coreGeometry = coreObject.coreGeometry();
		if (!coreGeometry) {
			return;
		}
		const points = coreObject.pointsFromGroup(this.pv.group);
		const param = this.p.string;
		const attribName = this.pv.name;

		let stringValues: string[] = new Array(points.length);
		if (param.hasExpression() && param.expressionController) {
			// if a group is given, we prefill the existing stringValues
			if (this._hasGroup()) {
				// create attrib if non existent

				if (!coreGeometry.hasAttrib(attribName)) {
					const tmpIndexData = CoreAttribute.arrayToIndexedArrays(['']);
					coreGeometry.setIndexedAttribute(attribName, tmpIndexData['values'], tmpIndexData['indices']);
				}
				const allPoints = coreObject.points();
				stringValues = stringValues.length != allPoints.length ? new Array(allPoints.length) : stringValues;
				for (let point of allPoints) {
					let currentValue = point.stringAttribValue(attribName);
					if (currentValue == null) {
						currentValue = '';
					}
					stringValues[point.index()] = currentValue;
				}
			}

			await param.expressionController.computeExpressionForPoints(points, (point, value) => {
				stringValues[point.index()] = value;
			});
		} else {
			// no need to do work here, as this will be done in the operation
		}

		const indexData = CoreAttribute.arrayToIndexedArrays(stringValues);
		const geometry = coreObject.coreGeometry();
		if (geometry) {
			geometry.setIndexedAttribute(attribName, indexData['values'], indexData['indices']);
		}
	}

	private async _addStringAttributeToObject(coreObjects: CoreObject[]) {
		const param = this.p.string;
		const attribName = this.pv.name;
		if (param.hasExpression() && param.expressionController) {
			await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value) => {
				coreObject.setAttribValue(attribName, value);
			});
		} else {
			// no need to do work here, as this will be done in the operation
		}
	}
	private async _addStringAttributeToCoreGroup(coreGroup: CoreGroup) {
		const param = this.p.string;
		const attribName = this.pv.name;
		if (param.hasExpression() && param.expressionController) {
			await param.expressionController.computeExpressionForCoreGroup(coreGroup, (coreGroup, value) => {
				coreGroup.setAttribValue(attribName, value);
			});
		} else {
			// no need to do work here, as this will be done in the operation
		}
	}

	private _initArrayIfRequired(
		geometry: BufferGeometry,
		arraysByGeometryUuid: ValueArrayByName,
		points_count: number
	) {
		const uuid = geometry.uuid;
		const currentArray = arraysByGeometryUuid.get(uuid);
		if (currentArray) {
			// only create new array if we need more point, or as soon as the length is different?
			if (currentArray.length < points_count) {
				arraysByGeometryUuid.set(uuid, new Array(points_count));
			}
		} else {
			arraysByGeometryUuid.set(uuid, new Array(points_count));
		}
		return arraysByGeometryUuid.get(uuid);
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
	//
	//
	// INTERNAL UTILS
	//
	//
	private _hasGroup() {
		return this.pv.group.trim() != '';
	}
	private _vectorByAttribSize(size: number) {
		switch (size) {
			case 2:
				return new Vector2(0, 0);
			case 3:
				return new Vector3(0, 0, 0);
			case 4:
				return new Vector4(0, 0, 0, 0);
		}
	}
}
