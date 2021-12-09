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
const DEFAULT = ObjectPropertiesSopOperation.DEFAULT_PARAMS;
class ObjectPropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to apply recursively to children */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {separatorAfter: true});

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
	paramsConfig = ParamsConfig;
	static type() {
		return 'objectProperties';
	}

	static displayedInputNames(): string[] {
		return ['objects to change properties of'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(ObjectPropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ObjectPropertiesSopOperation | undefined;
	async cook(inputCoreGroups: CoreGroup[]) {
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
		await this._cookWithExpressionsForCoreGroup(coreGroup);
		if (isBooleanTrue(this.pv.applyToChildren)) {
			const objects = coreGroup.objects();
			for (let object of objects) {
				const subCoreGroup = CoreGroup._fromObjects(object.children);
				await this._cookWithExpressionsForCoreGroup(subCoreGroup);
			}
		}
	}
	private async _cookWithExpressionsForCoreGroup(coreGroup: CoreGroup) {
		const entities = coreGroup.coreObjects();
		const pv = this.pv;
		// name
		if (isBooleanTrue(pv.tname)) {
			if (this.p.name.expressionController) {
				this.p.name.expressionController.computeExpressionForObjects(entities, (entity, value: string) => {
					entity.object().name = value;
				});
			} else {
				entities.forEach((e) => (e.object().name = pv.name));
			}
		}
		// renderOrder
		if (isBooleanTrue(pv.trenderOrder)) {
			if (this.p.renderOrder.expressionController) {
				this.p.renderOrder.expressionController.computeExpressionForObjects(
					entities,
					(entity, value: number) => {
						entity.object().renderOrder = value;
					}
				);
			} else {
				entities.forEach((e) => (e.object().renderOrder = pv.renderOrder));
			}
		}
		// frustumCulled
		if (isBooleanTrue(pv.tfrustumCulled)) {
			if (this.p.frustumCulled.expressionController) {
				this.p.frustumCulled.expressionController.computeExpressionForObjects(
					entities,
					(entity, value: boolean) => {
						entity.object().frustumCulled = value;
					}
				);
			} else {
				entities.forEach((e) => (e.object().frustumCulled = pv.frustumCulled));
			}
		}
		// matrixAutoUpdate
		if (isBooleanTrue(pv.tmatrixAutoUpdate)) {
			if (this.p.matrixAutoUpdate.expressionController) {
				this.p.matrixAutoUpdate.expressionController.computeExpressionForObjects(
					entities,
					(entity, value: boolean) => {
						entity.object().matrixAutoUpdate = value;
					}
				);
			} else {
				entities.forEach((e) => (e.object().matrixAutoUpdate = pv.matrixAutoUpdate));
			}
		}
		// visible
		if (isBooleanTrue(pv.tvisible)) {
			if (this.p.visible.expressionController) {
				this.p.visible.expressionController.computeExpressionForObjects(entities, (entity, value: boolean) => {
					entity.object().visible = value;
				});
			} else {
				entities.forEach((e) => (e.object().visible = pv.visible));
			}
		}
		// castShadow
		if (isBooleanTrue(pv.tcastShadow)) {
			if (this.p.castShadow.expressionController) {
				this.p.castShadow.expressionController.computeExpressionForObjects(
					entities,
					(entity, value: boolean) => {
						entity.object().castShadow = value;
					}
				);
			} else {
				entities.forEach((e) => (e.object().castShadow = pv.castShadow));
			}
		}
		// receiveShadow
		if (isBooleanTrue(pv.treceiveShadow)) {
			if (this.p.receiveShadow.expressionController) {
				this.p.receiveShadow.expressionController.computeExpressionForObjects(
					entities,
					(entity, value: boolean) => {
						entity.object().receiveShadow = value;
					}
				);
			} else {
				entities.forEach((e) => (e.object().receiveShadow = pv.receiveShadow));
			}
		}
	}
}
