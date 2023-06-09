/**
 * Update properties from the THREE OBJECT3D from the input
 *
 * @remarks
 * This can update properties such as name, visible, renderOrder.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ObjectPropertiesSopOperation} from '../../operations/sop/ObjectProperties';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/Type';
import {StringParam} from '../../params/String';
import {BooleanParam} from '../../params/Boolean';
import {IntegerParam} from '../../params/Integer';
import {FloatParam} from '../../params/Float';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {CoreMask} from '../../../core/geometry/Mask';
import {BaseCoreObject} from '../../../core/geometry/_BaseObject';
const DEFAULT = ObjectPropertiesSopOperation.DEFAULT_PARAMS;
class ObjectPropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param toggle on to apply recursively to children */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {
		separatorAfter: true,
	});

	/** @param toggle on to set a new name */
	tname = ParamConfig.BOOLEAN(DEFAULT.tname);
	/** @param new name */
	name = ParamConfig.STRING(DEFAULT.name, {
		visibleIf: {tname: true},
		separatorAfter: true,
		expression: {forEntities: true},
	});

	/** @param toggle on to set a new render order */
	trenderOrder = ParamConfig.BOOLEAN(DEFAULT.trenderOrder);
	/** @param render order */
	renderOrder = ParamConfig.INTEGER(DEFAULT.renderOrder, {
		visibleIf: {trenderOrder: true},
		range: [0, 10],
		rangeLocked: [false, false],
		separatorAfter: true,
		expression: {forEntities: true},
	});

	/** @param toggle on to allow to set frustrumCulled */
	tfrustumCulled = ParamConfig.BOOLEAN(DEFAULT.tfrustumCulled);
	/** @param sets frustrumCulled */
	frustumCulled = ParamConfig.BOOLEAN(DEFAULT.frustumCulled, {
		visibleIf: {tfrustumCulled: true},
		separatorAfter: true,
		expression: {forEntities: true},
	});

	/** @param toggle on to allow to set matrixAutoUpdate */
	tmatrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.tmatrixAutoUpdate);
	/** @param sets matrixAutoUpdate */
	matrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.matrixAutoUpdate, {
		visibleIf: {tmatrixAutoUpdate: true},
		separatorAfter: true,
		expression: {forEntities: true},
	});

	/** @param toggle on to allow to set visible */
	tvisible = ParamConfig.BOOLEAN(DEFAULT.tvisible);
	/** @param sets visible */
	visible = ParamConfig.BOOLEAN(DEFAULT.visible, {
		visibleIf: {tvisible: true},
		separatorAfter: true,
		expression: {forEntities: true},
	});

	/** @param toggle on to allow to set castShadow */
	tcastShadow = ParamConfig.BOOLEAN(DEFAULT.tcastShadow);
	/** @param sets castShadow */
	castShadow = ParamConfig.BOOLEAN(DEFAULT.castShadow, {
		visibleIf: {tcastShadow: true},
		separatorAfter: true,
		expression: {forEntities: true},
	});

	/** @param toggle on to allow to set receiveShadow */
	treceiveShadow = ParamConfig.BOOLEAN(DEFAULT.treceiveShadow);
	/** @param sets receiveShadow */
	receiveShadow = ParamConfig.BOOLEAN(DEFAULT.receiveShadow, {
		visibleIf: {treceiveShadow: true},
		expression: {forEntities: true},
	});
}
const ParamsConfig = new ObjectPropertiesSopParamsConfig();

export class ObjectPropertiesSopNode extends TypedSopNode<ObjectPropertiesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'objectProperties';
	}

	static override displayedInputNames(): string[] {
		return ['objects to change properties of'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(ObjectPropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ObjectPropertiesSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new ObjectPropertiesSopOperation(this.scene(), this.states);

		// first check that any param has an expression
		const paramWithExpression = this.params.all.find((param) => param.hasExpression());
		if (paramWithExpression) {
			const coreGroup = inputCoreGroups[0];
			await this._cookWithExpressions(coreGroup);
			this.setCoreGroup(coreGroup);
		} else {
			const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
			this.setCoreGroup(coreGroup);
		}
	}
	private async _cookWithExpressions(coreGroup: CoreGroup) {
		const selectedCoreObjects = CoreMask.filterCoreObjects(coreGroup, this.pv);
		await this._cookWithExpressionsForCoreObjects(selectedCoreObjects);
		// await this._cookWithExpressionsForCoreGroup(coreGroup);
		// if (isBooleanTrue(this.pv.applyToChildren)) {
		// 	const objects = coreGroup.allObjects();
		// 	for (let object of objects) {
		// 		if (isObject3D(object)) {
		// 			const subCoreGroup = CoreGroup._fromObjects(object.children);
		// 			await this._cookWithExpressionsForCoreGroup(subCoreGroup);
		// 		}
		// 	}
		// }
	}
	private async _cookWithExpressionsForCoreObjects<T extends CoreObjectType>(entities: BaseCoreObject<T>[]) {
		const p = this.p;

		async function applyStringParam(booleanParam: BooleanParam, valueParam: StringParam, property: 'name') {
			if (isBooleanTrue(booleanParam.value)) {
				if (valueParam.expressionController && valueParam.expressionController.entitiesDependent()) {
					await valueParam.expressionController.computeExpressionForObjects(
						entities,
						(entity, value: string) => {
							entity.object()[property] = value;
						}
					);
				} else {
					for (const entity of entities) {
						entity.object()[property] = valueParam.value;
					}
				}
			}
		}
		async function applyNumberParam(
			booleanParam: BooleanParam,
			valueParam: IntegerParam | FloatParam,
			property: 'renderOrder'
		) {
			if (isBooleanTrue(booleanParam.value)) {
				if (valueParam.expressionController && valueParam.expressionController.entitiesDependent()) {
					await valueParam.expressionController.computeExpressionForObjects(
						entities,
						(entity, value: number) => {
							entity.object()[property] = value;
						}
					);
				} else {
					for (const entity of entities) {
						entity.object()[property] = valueParam.value;
					}
				}
			}
		}
		async function applyBooleanParam(
			booleanParam: BooleanParam,
			valueParam: BooleanParam,
			property: 'frustumCulled' | 'matrixAutoUpdate' | 'visible' | 'castShadow' | 'receiveShadow'
		) {
			if (isBooleanTrue(booleanParam.value)) {
				if (valueParam.expressionController && valueParam.expressionController.entitiesDependent()) {
					await valueParam.expressionController.computeExpressionForObjects(
						entities,
						(entity, value: boolean) => {
							entity.object()[property] = value;
						}
					);
				} else {
					for (const entity of entities) {
						entity.object()[property] = valueParam.value;
					}
				}
			}
		}

		await Promise.all([
			applyStringParam(p.tname, p.name, 'name'),
			applyNumberParam(p.trenderOrder, p.renderOrder, 'renderOrder'),
			applyBooleanParam(p.tfrustumCulled, p.frustumCulled, 'frustumCulled'),
			applyBooleanParam(p.tmatrixAutoUpdate, p.matrixAutoUpdate, 'matrixAutoUpdate'),
			applyBooleanParam(p.tvisible, p.visible, 'visible'),
			applyBooleanParam(p.tcastShadow, p.castShadow, 'castShadow'),
			applyBooleanParam(p.treceiveShadow, p.receiveShadow, 'receiveShadow'),
		]);
	}
}
