import {TypedGlNode, BaseGlNodeType} from './_Base';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionsController} from './utils/ConnectionsController';
import {NodeContext} from '../../poly/NodeContext';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
class IfGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new IfGlParamsConfig();

export class IfGlNode extends TypedGlNode<IfGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'if';
	}

	protected _children_controller_context = NodeContext.GL;

	public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	initialize_node() {
		this.gl_connections_controller.initialize_node();

		this.gl_connections_controller.set_input_name_function(this._expected_input_name.bind(this));
		this.gl_connections_controller.set_output_name_function(this._expected_output_name.bind(this));
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));

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
					const type = this.gl_connections_controller.connection_point_type_from_connection(connection);
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
		// TODO: that should be from the subnet output
		const types: GlConnectionPointType[] = [];
		const input_types = this._expected_input_types();
		for (let i = 1; i < input_types.length - 1; i++) {
			types.push(input_types[i]);
		}
		return types;
	}
	protected _expected_input_name(index: number) {
		if (index == 0) {
			return 'condition';
		} else {
			const connection = this.io.connections.input_connection(index);
			if (connection) {
				const name = this.gl_connections_controller.connection_point_name_from_connection(connection);
				return name;
			} else {
				return `in${index}`;
			}
		}
	}
	protected _expected_output_name(index: number) {
		return this._expected_input_name(index + 1);
	}
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

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		// const definitions = [];
		// const gl_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		// const var_name = this.uniform_name();
		// definitions.push(new UniformGLDefinition(this, gl_type, var_name));
		// shaders_collection_controller.add_definitions(this, definitions);
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

		subnet_input1.ui_data.set_position(0, -100);
		subnet_output1.ui_data.set_position(0, +100);
	}
}
