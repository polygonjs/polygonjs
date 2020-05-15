import {TypedGlNode, BaseGlNodeType} from './_Base';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {NodeContext} from '../../poly/NodeContext';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {SubnetOutputGlNode} from './SubnetOutput';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {TypedNodeTraverser} from '../utils/shaders/NodeTraverser';
import {ShaderName} from '../utils/shaders/ShaderName';
import {CodeBuilder} from './code/utils/CodeBuilder';
import {LineType} from '../gl/code/utils/LineType';

const CONDITION_INPUT_NAME = 'condition';

class IfThenGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new IfThenGlParamsConfig();

export class IfThenGlNode extends TypedGlNode<IfThenGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'if_then';
	}

	protected _children_controller_context = NodeContext.GL;
	initialize_node() {
		this.children_controller?.set_output_node_find_method(() => {
			return this.nodes_by_type(SubnetOutputGlNode.type())[0];
		});

		this.io.connection_points.set_input_name_function(this._expected_input_name.bind(this));
		this.io.connection_points.set_output_name_function(this._expected_output_name.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));

		this.lifecycle.add_on_create_hook(this._on_create_bound);
	}

	private _expected_inputs_count() {
		const current_connections = this.io.connections.input_connections();
		return current_connections ? Math.max(current_connections.length + 1, 2) : 2;
	}

	protected _expected_input_types(): GlConnectionPointType[] {
		const types: GlConnectionPointType[] = [GlConnectionPointType.BOOL];

		const default_type = GlConnectionPointType.FLOAT;
		const current_connections = this.io.connections.input_connections();

		const expected_count = this._expected_inputs_count();
		for (let i = 1; i < expected_count; i++) {
			if (current_connections) {
				const connection = current_connections[i];
				if (connection) {
					const type = connection.src_connection_point().type;
					types.push(type);
				} else {
					types.push(default_type);
				}
			} else {
				types.push(default_type);
			}
		}
		return types;
	}

	protected _expected_output_types() {
		const found_node = this.children_controller?.output_node();
		// const found_node = this.nodes_by_type(SubnetOutputGlNode.type())[0];
		if (found_node) {
			const types: GlConnectionPointType[] = [];
			const output_node_connection_points = found_node.io.inputs.named_input_connection_points;
			for (let i = 0; i < output_node_connection_points.length - 1; i++) {
				types.push(output_node_connection_points[i].type);
			}
			return types;
		} else {
			return [];
		}
	}
	protected _expected_input_name(index: number) {
		if (index == 0) {
			return CONDITION_INPUT_NAME;
		} else {
			const connection = this.io.connections.input_connection(index);
			if (connection) {
				const name = connection.src_connection_point().name;
				return name;
			} else {
				return `in${index}`;
			}
		}
	}
	protected _expected_output_name(index: number) {
		const found_node = this.children_controller?.output_node();
		if (found_node) {
			return found_node.io.inputs.named_input_connection_points[index].name;
		} else {
			return [];
		}
	}

	//
	//
	// defines the outputs for the child subnet input
	//
	//
	child_subnet_input_expected_output_types() {
		const list: GlConnectionPointType[] = [];
		const types = this._expected_input_types();
		for (let i = 1; i < types.length - 1; i++) {
			list.push(types[i]);
		}
		return list;
	}
	child_subnet_input_expected_output_name(index: number) {
		return this._expected_input_name(index + 1);
	}

	//
	//
	// CHILDREN
	//
	//
	create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K] {
		return super.create_node(type) as GlNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GlNodeChildrenMap[K][];
	}

	private _on_create_bound = this._on_create.bind(this);
	private _on_create() {
		const subnet_input1 = this.create_node('subnet_input');
		const subnet_output1 = this.create_node('subnet_output');

		subnet_input1.ui_data.set_position(-100, 0);
		subnet_output1.ui_data.set_position(+100, 0);
	}

	//
	//
	// set_lines
	//
	//
	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];
		const condition_value = ThreeToGl.any(this.variable_for_input(CONDITION_INPUT_NAME));
		const open_if_line = `if(${condition_value}){`;
		const end_if_line = `}`;

		const connections = this.io.connections.output_connections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					const connection_point = connection.src_connection_point();
					const gl_type = connection_point.type;
					const out = this.gl_var_name(connection_point.name);
					const in_value = ThreeToGl.any(connection_point.init_value);
					const body_line = `${gl_type} ${out} = ${in_value}`;
					body_lines.push(body_line);
				}
			}
		}

		body_lines.push(open_if_line);

		const shader_name = ShaderName.FRAGMENT;
		const root_node: BaseGlNodeType = this.children_controller?.output_node() as BaseGlNodeType;
		if (root_node) {
			const node_traverser = new TypedNodeTraverser<NodeContext.GL>(this, [shader_name], (root_node) => {
				return root_node.io.inputs.named_input_connection_points.map((cp) => cp.name);
			});
			const code_builder = new CodeBuilder(node_traverser, (shader_name) => {
				return [root_node];
			});
			code_builder.build_from_nodes([root_node]);
			const builder_body_lines = code_builder.lines(shader_name, LineType.BODY);
			if (builder_body_lines) {
				for (let builder_line of builder_body_lines) {
					body_lines.push(builder_line);
				}
			}
		}

		body_lines.push(end_if_line);

		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
