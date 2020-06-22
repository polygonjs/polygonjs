import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
class LayerSopParamsConfig extends NodeParamsConfig {
	layer = ParamConfig.INTEGER(0, {
		range: [0, 31],
		range_locked: [true, true],
	});
}
const ParamsConfig = new LayerSopParamsConfig();

export class LayerSopNode extends TypedSopNode<LayerSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'layer';
	}

	static displayed_input_names(): string[] {
		return ['objects to change layers of'];
	}
	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.layer]);
			});
		});
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		for (let object of core_group.objects()) {
			object.layers.set(this.pv.layer);
		}

		this.set_core_group(core_group);
	}
}
