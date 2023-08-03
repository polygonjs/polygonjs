/**
 * Sets the layer of the input objects
 *
 * @remarks
 * This should be combined with the layer of a camera. This will allow some objects to be only visible via some cameras.
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreMask} from '../../../core/geometry/Mask';
class LayerSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param the layer that the objects will be assigned to */
	layer = ParamConfig.INTEGER(0, {
		range: [0, 31],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new LayerSopParamsConfig();

export class LayerSopNode extends TypedSopNode<LayerSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.LAYER;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const objects = CoreMask.filterThreejsObjects(coreGroup, {
			group: this.pv.group,
			applyToChildren: this.pv.group.trim().length == 0,
		});

		for (let object of objects) {
			object.layers.set(this.pv.layer);
		}

		this.setCoreGroup(coreGroup);
	}
}
