import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';

enum ForceType {
	DIRECTIONAL = 'directional',
	RADIAL = 'radial',
	VORTEX = 'vortex',
}
const FORCE_TYPES: Array<ForceType> = [ForceType.DIRECTIONAL, ForceType.RADIAL, ForceType.VORTEX];
function visible_for_type(type: ForceType, options: VisibleIfParamOptions = {}): ParamOptions {
	options['type'] = FORCE_TYPES.indexOf(ForceType.DIRECTIONAL);
	return {visible_if: options};
}
function visible_for_directional(options: VisibleIfParamOptions = {}): ParamOptions {
	return visible_for_type(ForceType.DIRECTIONAL, options);
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ParamOptions, VisibleIfParamOptions} from '../../params/utils/OptionsController';
import {CoreGroup} from '../../../core/geometry/Group';
class PhysicsForceAttributesSopParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(FORCE_TYPES.indexOf(ForceType.DIRECTIONAL), {
		menu: {
			entries: FORCE_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	direction = ParamConfig.VECTOR3([0, -9.81, 0], {...visible_for_directional()});
}
const ParamsConfig = new PhysicsForceAttributesSopParamsConfig();

export class PhysicsForceAttributesSopNode extends TypedSopNode<PhysicsForceAttributesSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'physics_force_attributes';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		console.error('physics force cook');
		this.set_core_group(input_contents[0]);
	}
}
