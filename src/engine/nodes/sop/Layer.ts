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
class LayerSopParamsConfig extends NodeParamsConfig {
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
		return 'layer';
	}

	static override displayedInputNames(): string[] {
		return ['objects to change layers of'];
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		for (let object of core_group.threejsObjects()) {
			object.layers.set(this.pv.layer);
		}

		this.setCoreGroup(core_group);
	}
}
