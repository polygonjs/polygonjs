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
	params_config = ParamsConfig;
	static type() {
		return 'layer';
	}

	static displayedInputNames(): string[] {
		return ['objects to change layers of'];
	}
	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.layer]);
			});
		});
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		for (let object of core_group.objects()) {
			object.layers.set(this.pv.layer);
		}

		this.setCoreGroup(core_group);
	}
}
