/**
 * Adds properties for WFC tiles
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BooleanParam} from '../../params/Boolean';
import {StringParam} from '../../params/String';
import {BaseCoreObject} from '../../../core/geometry/entities/object/BaseCoreObject';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {isBooleanTrue} from '../../../core/Type';
import {filterCoreObjectsFromCoreGroup} from '../../../core/geometry/Mask';

class WFCTilePropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param addId */
	addId = ParamConfig.BOOLEAN(1);
	/** @param addId */
	id = ParamConfig.STRING('`$OS`-`@objnum`', {
		visibleIf: {addId: 1},
		expression: {forEntities: true},
	});
	/** @param addName */
	addName = ParamConfig.BOOLEAN(1, {
		visibleIf: {addId: 1},
	});
	/** @param allowedRotationY */
	allowedRotationY = ParamConfig.BOOLEAN(1, {
		expression: {forEntities: true},
	});
}
const ParamsConfig = new WFCTilePropertiesSopParamsConfig();

export class WFCTilePropertiesSopNode extends TypedSopNode<WFCTilePropertiesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_PROPERTIES;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const coreObjects = filterCoreObjectsFromCoreGroup(coreGroup, this.pv);
		// const coreObjects = coreGroup.allCoreObjects();

		const promises: Array<Promise<void>> = [];
		const {addName, addId} = this.pv;

		// for (const coreObject of coreObjects) {
		// 	CoreWFCTileAttribute.setIsTile(coreObject.object(), true);
		// }

		if (isBooleanTrue(addId)) {
			promises.push(
				this._computeStringParam(this.p.id, coreObjects, (object, value: string) => {
					if (addName) {
						// we also add the name to be easier to handle with a sop/deleteByName
						object.name = value;
					}
					CoreWFCTileAttribute.setTileId(object, value);
				})
			);
		}
		promises.push(
			this._computeBooleanParam(
				this.p.allowedRotationY,
				coreObjects,
				CoreWFCTileAttribute.setRotationYAllowed.bind(CoreWFCTileAttribute)
			)
		);
		await Promise.all(promises);

		this.setCoreGroup(coreGroup);
	}

	protected async _computeStringParam(
		param: StringParam,
		coreObjects: BaseCoreObject<CoreObjectType>[],
		applyMethod: (object: ObjectContent<CoreObjectType>, value: string) => void
	) {
		if (param.expressionController && param.expressionController.entitiesDependent()) {
			await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value: string) => {
				applyMethod(coreObject.object(), value);
			});
		} else {
			for (let coreObject of coreObjects) {
				applyMethod(coreObject.object(), param.value);
			}
		}
	}
	protected async _computeBooleanParam(
		param: BooleanParam,
		coreObjects: BaseCoreObject<CoreObjectType>[],
		applyMethod: (object: ObjectContent<CoreObjectType>, value: boolean) => void
	) {
		if (param.expressionController && param.expressionController.entitiesDependent()) {
			await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value) => {
				applyMethod(coreObject.object(), value);
			});
		} else {
			for (let coreObject of coreObjects) {
				applyMethod(coreObject.object(), param.value);
			}
		}
	}
}
