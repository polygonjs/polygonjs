import {TypedEventNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {VisibleIfParamOptions, ParamOptions} from '../../params/utils/OptionsController';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {RaycastCPUController} from './utils/raycast/CPUController';
import {RaycastGPUController} from './utils/raycast/GPUController';

enum RaycastMode {
	CPU = 'cpu',
	GPU = 'gpu',
}
const RAYCAST_MODES: Array<RaycastMode> = [RaycastMode.CPU, RaycastMode.GPU];
function visible_for_cpu(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
	return {visible_if: options};
}
function visible_for_gpu(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.GPU);
	return {visible_if: options};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class RaycastParamsConfig extends NodeParamsConfig {
	// override_camera = ParamConfig.BOOLEAN(1);
	// camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
	// 	node_selection: {
	// 		context: NodeContext.OBJ,
	// 	},
	// 	dependent_on_found_node: false,
	// })
	mode = ParamConfig.INTEGER(RAYCAST_MODES.indexOf(RaycastMode.CPU), {
		menu: {
			entries: RAYCAST_MODES.map((name, value) => {
				return {
					name,
					value,
				};
			}),
		},
	});
	//
	//
	// COMMON
	//
	//
	mouse = ParamConfig.VECTOR2([0, 0], {cook: false});

	//
	//
	// GPU
	//
	//
	material = ParamConfig.OPERATOR_PATH('/MAT/mesh_basic_builder1', {
		node_selection: {
			context: NodeContext.MAT,
		},
		dependent_on_found_node: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastGPUController.PARAM_CALLBACK_update_material(node as RaycastEventNode);
		},
		...visible_for_gpu(),
	});
	pixel_value = ParamConfig.VECTOR4([0, 0, 0, 0], {
		cook: false,
		...visible_for_gpu(),
	});

	//
	//
	// CPU
	//
	//
	target = ParamConfig.OPERATOR_PATH('/geo1', {
		node_selection: {
			context: NodeContext.OBJ,
		},
		dependent_on_found_node: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
		...visible_for_cpu(),
	});
	traverse_children = ParamConfig.BOOLEAN(0, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
		...visible_for_cpu(),
	});
	sep = ParamConfig.SEPARATOR(null, {
		...visible_for_cpu(),
	});

	position = ParamConfig.VECTOR3([0, 0, 0], {cook: false, ...visible_for_cpu()});
	geo_attribute = ParamConfig.BOOLEAN(0, visible_for_cpu());
	geo_attribute_name = ParamConfig.STRING('id', {
		cook: false,
		...visible_for_cpu({geo_attribute: 1}),
	});
	geo_attribute_value = ParamConfig.FLOAT(0, {
		cook: false,
		...visible_for_cpu({geo_attribute: 1}),
	});
}
const ParamsConfig = new RaycastParamsConfig();

export class RaycastEventNode extends TypedEventNode<RaycastParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'raycast';
	}

	public readonly cpu_controller: RaycastCPUController = new RaycastCPUController(this);
	public readonly gpu_controller: RaycastGPUController = new RaycastGPUController(this);

	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.inputs.set_named_input_connection_points([
			new TypedNamedConnectionPoint('trigger', ConnectionPointType.BOOL),
		]);
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint('hit', ConnectionPointType.BOOL),
			new TypedNamedConnectionPoint('no_hit', ConnectionPointType.BOOL),
		]);
	}

	process_event(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpu_controller.process_event(context);
		} else {
			this.gpu_controller.process_event(context);
		}
	}
}
