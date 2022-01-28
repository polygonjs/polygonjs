import {TypedJsNode, BaseJsNodeType} from './_Base';
import {LinesController} from './code/utils/LinesController';
import {JsConnectionPointType, BaseJsConnectionPoint} from '../utils/io/connections/Js';

const ATTRIBUTE_NODE_AVAILABLE_JS_TYPES = [
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.VEC2,
	JsConnectionPointType.VEC3,
	JsConnectionPointType.VEC4,
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttributeJsParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new AttributeJsParamsConfig();

export class AttributeJsNode extends TypedJsNode<AttributeJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribute';
	}
	static readonly INPUT_NAME = 'export';
	static readonly OUTPUT_NAME = 'val';

	// private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	override initializeNode() {
		// this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [
			ATTRIBUTE_NODE_AVAILABLE_JS_TYPES[this.pv.type],
		]);
		// this.params.add_on_scene_load_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		// this.params.set_post_create_params_hook(this._update_signature_if_required_bound);
		// this.addPostDirtyHook('_update_signature_if_required', this._update_signature_if_required_bound);
	}

	// inputless_params_names(): string[] {
	// 	return ['type'];
	// }

	inputName() {
		return AttributeJsNode.INPUT_NAME;
	}
	outputName() {
		return AttributeJsNode.OUTPUT_NAME;
	}

	override setLines(lines_controller: LinesController) {
		// if (lines_controller.shader_name) {
		this.function_node?.assembler_controller.assembler.set_node_lines_attribute(this, lines_controller);
		// }
	}

	attributeName(): string {
		return this.pv.name.trim();
	}
	glType() {
		return this.io.outputs.namedOutputConnectionPoints()[0].type();
	}
	setGlType(type: JsConnectionPointType) {
		this.p.type.set(ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.indexOf(type));
	}
	//
	//
	// Utility methods for SOP/ParticlesSystemGPU and Assembler/Particles
	//
	//
	connected_input_node(): BaseJsNodeType | null {
		return this.io.inputs.named_input(AttributeJsNode.INPUT_NAME) as BaseJsNodeType | null;
	}
	connected_input_connection_point(): BaseJsConnectionPoint | undefined {
		return this.io.inputs.named_input_connection_point(AttributeJsNode.INPUT_NAME);
	}

	output_connection_point(): BaseJsConnectionPoint | undefined {
		// if (this.io.inputs.hasNamedInputs()) {
		return this.io.outputs.namedOutputConnectionPointsByName(this.inputName());
		// }
	}

	isImporting(): boolean {
		return this.io.outputs.used_output_names().length > 0; // TODO: ensure that we can check that the connected outputs are part of the nodes retrived by the node traverser
	}
	// get is_exporting(): boolean {
	// 	// if (isBooleanTrue(this.pv.export_when_connected)) {
	// 	// 	const input_node = this.io.inputs.named_input(AttributeJsNode.INPUT_NAME);
	// 	// 	return input_node != null;
	// 	// } else {
	// 	// 	return false;
	// 	// }
	// }
	// private _set_mat_to_recompile_if_is_exporting() {
	// 	if (this.is_exporting) {
	// 		this._set_function_node_to_recompile();
	// 	}
	// }
}
