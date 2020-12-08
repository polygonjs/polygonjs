import {TypedGlNode, BaseGlNodeType} from './_Base';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {NodeContext} from '../../poly/NodeContext';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {SubnetOutputGlNode} from './SubnetOutput';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';
import {ParamsInitData} from '../utils/io/IOController';

export class TypedSubnetGlNode<K extends NodeParamsConfig> extends TypedGlNode<K> {
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

	protected _expected_inputs_count() {
		const current_connections = this.io.connections.input_connections();
		return current_connections ? current_connections.length + 1 : 1;
	}

	protected _expected_input_types(): GlConnectionPointType[] {
		const types: GlConnectionPointType[] = [];

		const default_type = GlConnectionPointType.FLOAT;
		const current_connections = this.io.connections.input_connections();

		const expected_count = this._expected_inputs_count();
		for (let i = 0; i < expected_count; i++) {
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
		const types: GlConnectionPointType[] = [];
		const input_types = this._expected_input_types();
		for (let i = 0; i < input_types.length; i++) {
			types.push(input_types[i]);
		}
		return types;
	}
	protected _expected_input_name(index: number) {
		const connection = this.io.connections.input_connection(index);
		if (connection) {
			const name = connection.src_connection_point().name;
			return name;
		} else {
			return `in${index}`;
		}
	}
	protected _expected_output_name(index: number) {
		return this._expected_input_name(index);
	}

	//
	//
	// defines the outputs for the child subnet input
	//
	//
	child_expected_input_connection_point_types() {
		return this._expected_input_types();
	}
	child_expected_output_connection_point_types() {
		return this._expected_output_types();
	}
	child_expected_input_connection_point_name(index: number) {
		return this._expected_input_name(index);
	}
	child_expected_output_connection_point_name(index: number) {
		return this._expected_output_name(index);
	}

	//
	//
	// CHILDREN
	//
	//
	create_node<K extends keyof GlNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: ParamsInitData
	): GlNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as GlNodeChildrenMap[K];
	}
	createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
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

		subnet_output1.set_input(0, subnet_input1);

		subnet_input1.ui_data.set_position(-100, 0);
		subnet_output1.ui_data.set_position(+100, 0);
	}

	//
	//
	// set_lines
	//
	//
	set_lines_block_start(shaders_collection_controller: ShadersCollectionController, child_node: SubnetInputGlNode) {
		const body_lines: string[] = [];
		const connection_points = this.io.inputs.named_input_connection_points;
		for (let i = 0; i < connection_points.length; i++) {
			const connection_point = connection_points[i];
			const gl_type = connection_point.type;
			const out = this.gl_var_name(connection_point.name);
			const in_value = ThreeToGl.any(this.variable_for_input(connection_point.name));
			const body_line = `${gl_type} ${out} = ${in_value}`;
			body_lines.push(body_line);
		}
		const open_if_line = `if(true){`;
		body_lines.push(open_if_line);

		const connections = this.io.connections.input_connections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					const connection_point = connection.dest_connection_point();
					const in_value = ThreeToGl.any(this.variable_for_input(connection_point.name));
					const gl_type = connection_point.type;
					const out = child_node.gl_var_name(connection_point.name);
					const body_line = `	${gl_type} ${out} = ${in_value}`;
					body_lines.push(body_line);
				}
			}
		}

		shaders_collection_controller.add_body_lines(child_node, body_lines);
	}
	set_lines_block_end(shaders_collection_controller: ShadersCollectionController, child_node: SubnetOutputGlNode) {
		shaders_collection_controller.add_body_lines(child_node, ['}']);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {}
}

class SubnetGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetGlParamsConfig();

export class SubnetGlNode extends TypedSubnetGlNode<SubnetGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'subnet';
	}
}
