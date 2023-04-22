/**
 * filters the content of an IFC
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Group, MathUtils, Object3D} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ParamOptionToAdd} from '../utils/params/ParamsController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {BooleanParam} from '../../params/Boolean';
import {ParamType} from '../../poly/ParamType';
import {IFCAttribute, getIFCModelCategories, ifcCategoryIds, ifcElementIds} from '../../../core/geometry/ifc/IFCUtils';
import type {SubsetConfig} from 'web-ifc-three/IFC/BaseDefinitions';
import {IFCLoaderHandler} from '../../../core/loader/geometry/IFC';
import {CoreObject} from '../../../core/geometry/Object';

class IFCFilterCategoriesSopParamsConfig extends NodeParamsConfig {
	/** @param get categories in the file */
	getCategories = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			IFCFilterCategoriesSopNode.PARAM_CALLBACK_getCategories(node as IFCFilterCategoriesSopNode);
		},
	});
}
const ParamsConfig = new IFCFilterCategoriesSopParamsConfig();

export class IFCFilterCategoriesSopNode extends TypedSopNode<IFCFilterCategoriesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'IFCFilterCategories';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];
		const inputObjects = inputCoreGroup.threejsObjects();
		const newObjects: Object3D[] = [];

		const ifcManager = IFCLoaderHandler.ifcManager();
		const tmpParent = new Group();
		for (const inputObject of inputObjects) {
			const modelId = CoreObject.attribValue(inputObject, IFCAttribute.MODEL_ID) as number;
			if (ifcManager != null && modelId != null) {
				const categoryNames = this.params.spare_names.filter((paramName) => {
					const param = this.params.get(paramName);
					return param != null && param instanceof BooleanParam && param.value == true;
				});
				const categoryIds = ifcCategoryIds(categoryNames);
				const elementIds = await ifcElementIds(ifcManager, modelId, categoryIds);
				const config: SubsetConfig = {
					modelID: modelId,
					scene: tmpParent,
					ids: elementIds,
					removePrevious: true,
					customID: MathUtils.generateUUID(),
				};
				const subset = ifcManager.createSubset(config);
				newObjects.push(subset);
			} else {
				this.states.error.set('missing ifcManager');
			}
		}

		this.setObjects(newObjects);
	}
	static PARAM_CALLBACK_getCategories(node: IFCFilterCategoriesSopNode) {
		node._paramCallbackGetCategories();
	}
	private async _paramCallbackGetCategories() {
		const inputNode = this.io.inputs.input(0);
		if (!inputNode) {
			return;
		}
		const container = await inputNode.compute();
		const coreContent = container.coreContent();
		if (!coreContent) {
			return;
		}
		const object = coreContent.threejsObjects()[0];
		const categoryNames = await getIFCModelCategories(object);
		if (!categoryNames) {
			return;
		}

		const currentCategoryValues: Record<string, boolean> = {};
		for (const categoryName of categoryNames) {
			if (this.params.has(categoryName)) {
				const param = this.params.get(categoryName);
				if (param && param instanceof BooleanParam) {
					currentCategoryValues[categoryName] = param.value;
				}
			}
		}
		// delete existing
		const existingSpareParams = this.params.spare_names;
		this.params.updateParams({namesToDelete: existingSpareParams});
		// add
		const toAdd: ParamOptionToAdd<ParamType.BOOLEAN>[] = categoryNames.map((categoryName) => {
			return {
				name: categoryName,
				type: ParamType.BOOLEAN,
				initValue: currentCategoryValues[categoryName] || false,
				rawInput: currentCategoryValues[categoryName] || false,
				options: {spare: true},
			};
		});
		this.params.updateParams({toAdd});
	}
}
