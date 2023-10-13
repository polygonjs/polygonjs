/**
 * places the tiles on the quads
 *
 *
 */
import {Object3D} from 'three';
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {WFCBuilder} from '../../../core/wfc/WFCBuilder';
import {registerWFCBuilder} from '../../../core/wfc/WFCRegister';

class WFCBuilderSopParamsConfig extends NodeParamsConfig {
	/** @param tileHeight */
	tileHeight = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new WFCBuilderSopParamsConfig();

export class WFCBuilderSopNode extends TypedSopNode<WFCBuilderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_BUILDER;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const quadObjects = coreGroup0.quadObjects();

		if (quadObjects == null || quadObjects.length == 0) {
			this.states.error.set('no quad objects found');
			return;
		}

		const tileAndRuleObjects = coreGroup1.threejsObjects();

		const newObjects: Object3D[] = [];

		for (const quadObject of quadObjects) {
			const builder = new WFCBuilder({
				node: this,
				quadObject,
				tileAndRuleObjects,
				tileHeight: this.pv.tileHeight,
			});
			const group = builder.createObjects();
			if (group) {
				registerWFCBuilder(builder, group);
				newObjects.push(group);
			}
		}

		this.setObjects(newObjects);
	}
}
