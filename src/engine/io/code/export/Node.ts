import lodash_sortBy from 'lodash/sortBy';
import {BaseNodeType} from '../../../nodes/_Base';
import {SceneCodeExporter} from './Scene';
import {NodesCodeExporter} from './Nodes';
import {CodeExporterDispatcher} from './Dispatcher';

interface PositionData {
	position_x_offset?: number;
}

export class NodeCodeExporter {
	_lines: string[] = [];
	constructor(protected _node: BaseNodeType) {}

	create(parent_var_name?: string): string[] {
		this.reset();

		if (!this.is_root()) {
			this.add_create(parent_var_name);
			this.add_name();
		}
		this.add_children();
		this.add_selection();

		this.add_comment();
		this.add_position({});
		this.add_input_clonable_state();
		this.add_flags();
		this.add_params();
		this.add_custom();

		// already called in create_node()
		// this._lines.push(`${this.var_name()}.lifecycle.set_creation_completed();`);

		return this._lines;
	}

	set_up(options: object = {}): string[] {
		this.reset();

		this.add_input();
		// this.add_position(options)
		// this.add_bypass_flag()
		// this.add_params()
		// this.add_children()
		// this.add_custom()
		// this.add_selection()

		return this._lines;
	}
	// children_and_selection(): string[]{
	// 	this.reset()
	// 	this.add_children()
	// 	this.add_selection()
	// }
	create_function_declare(parent_var_name = 'parent'): string[] {
		this._node.scene.nodes_controller.register_node_context_signature(this._node);

		const ls: string[] = [];
		ls.push(`function ${this.function_name()}(${parent_var_name}){`);
		this.create(parent_var_name).forEach((l) => {
			ls.push(`	${l}`);
		});
		ls.push(`	return ${this.var_name()}`);
		ls.push(`}`);
		return ls;
	}
	create_function_call(parent_var_name?: string): string {
		if (parent_var_name == null) {
			if (this._node.parent) {
				parent_var_name = CodeExporterDispatcher.dispatch_node(this._node.parent).var_name(); //.visit(CodeExporterVisitor).var_name()
			}
		}
		return `var ${this.var_name()} = ${this.function_name()}(${parent_var_name})`;
	}

	var_name(): string {
		if (this.is_root()) {
			const scene_exporter = new SceneCodeExporter(this._node.scene);
			return `${scene_exporter.var_name()}.root`;
		} else {
			// add a _ in front in case the name starts by a number
			// return `context._${this._node.full_path().replace(/\//g, '_').substr(1)}`;
			return this._node.name.replace(/\//g, '_');
		}
	}
	protected function_name(): string {
		return 'create_' + this.var_name().replace(/[^a-z0-9]/gim, '_');
	}

	private is_root() {
		return this._node.parent === null && this._node.graph_node_id == this._node.root.graph_node_id;
	}

	private reset() {
		this._lines = [];
	}

	protected add_create(parent_var_name?: string) {
		if (parent_var_name == null) {
			if (this._node.parent) {
				const parent_exporter = CodeExporterDispatcher.dispatch_node(this._node.parent);
				parent_var_name = parent_exporter.var_name();
			}
		}
		const create_node_line = `var ${this.var_name()} = ${parent_var_name}.createNode('${this._node.type}')`;
		this._lines.push(create_node_line);
	}

	protected add_name() {
		if (this._node.graph_node_id !== this._node.root.graph_node_id) {
			this._lines.push(`${this.var_name()}.set_name('${this._node.name}')`);
		}
	}

	protected add_input() {
		this._node.io.inputs.inputs().forEach((input, input_index) => {
			// const input = this._node.input(input_index);
			const input_connection = this._node.io.connections.input_connection(input_index);
			if (input && input_connection) {
				const output_index = input_connection.output_index;
				const input_exporter = CodeExporterDispatcher.dispatch_node(input);
				let line;
				if (this._node.io.inputs.has_named_inputs) {
					const input_connection_point_name = this._node.io.inputs.named_input_connection_points[input_index]
						.name;
					const output_name = input.io.outputs.named_output_connection_points[output_index].name;
					line = `${this.var_name()}.set_input('${input_connection_point_name}', ${input_exporter.var_name()}, '${output_name}')`;
				} else {
					line = `${this.var_name()}.set_input(${input_index}, ${input_exporter.var_name()})`;
				}
				this._lines.push(line);
			}
		});
	}
	protected add_comment() {
		if (this._node.parent) {
			// if not root
			let comment = this._node.ui_data.comment;
			if (comment) {
				comment = SceneCodeExporter.sanitize_string(comment);
				this._lines.push(`${this.var_name()}.ui_data.set_comment('${comment}')`);
			}
		}
	}
	protected add_position(options: PositionData = {}) {
		if (this._node.parent) {
			// if not root
			let x_offset;
			const pos = this._node.ui_data.position.clone();
			if ((x_offset = options['position_x_offset']) != null) {
				pos.x += x_offset;
			}
			this._lines.push(`${this.var_name()}.ui_data.set_position(${pos.x}, ${pos.y})`);
		}
	}

	protected add_params() {
		this._node.params.all.forEach((param) => {
			const param_exporter = CodeExporterDispatcher.dispatch_param(param);
			const param_lines: string[] = param_exporter.process();
			param_lines.forEach((param_line) => {
				this._lines.push(param_line);
			});
		});

		// to ensure that gl nodes have the spare params up to date
		this._lines.push(`${this.var_name()}.params._update_caches()`);
		// to ensure that gl nodes like the constant and attribute have their inputs/outputs updated
		this._lines.push(`${this.var_name()}.params.run_on_scene_load_hooks()`);
	}

	protected add_input_clonable_state() {
		if (this._node.io.inputs.override_cloned_state_allowed()) {
			const overriden = this._node.io.inputs.cloned_state_overriden();
			if (overriden) {
				this._lines.push(`${this.var_name()}.io.inputs.override_cloned_state(true)`);
			}
		}
	}
	protected add_flags() {
		this.add_bypass_flag();
		this.add_display_flag();
		this.add_optimize_flag();
	}
	protected add_bypass_flag() {
		if (this._node.flags?.has_bypass()) {
			if (this._node.flags.bypass?.active) {
				this._lines.push(`${this.var_name()}.flags.bypass.set(true)`);
			}
		}
	}
	protected add_display_flag() {
		if (this._node.flags?.has_display()) {
			const active = this._node.flags.display?.active;
			if (this._node.parent?.display_node_controller) {
				if (active) {
					this._lines.push(`${this.var_name()}.flags.display.set(true)`);
				}
			} else {
				this._lines.push(`${this.var_name()}.flags.display.set(${active})`);
			}
		}
	}
	protected add_optimize_flag() {
		if (this._node.flags?.has_optimize()) {
			const active = this._node.flags.optimize?.active;
			if (active) {
				this._lines.push(`${this.var_name()}.flags.optimize.set(true)`);
			}
		}
	}

	protected add_children() {
		const children = lodash_sortBy(this._node.children(), (child) => child.name);
		const nodes_exporter = new NodesCodeExporter(children);
		nodes_exporter.process(this.var_name()).forEach((child_line) => {
			this._lines.push(child_line);
		});
	}
	// protected add_children_function_declare(){
	// 	const nodes_exporter = new NodesExporter(this._node.children())
	// 	nodes_exporter.create_function_declare().forEach(child_line=>{
	// 		this._lines.push(child_line)
	// 	})
	// }
	// protected add_children_function_call(){
	// 	const nodes_exporter = new NodesExporter(this._node.children())
	// 	nodes_exporter.create_function_call().forEach(child_line=>{
	// 		this._lines.push(child_line)
	// 	})
	// }

	protected add_custom() {}

	protected add_selection() {
		if (this._node.children_controller?.selection != null) {
			for (let node of this._node.children_controller.selection.nodes()) {
				const node_exporter = CodeExporterDispatcher.dispatch_node(node);
				this._lines.push(`${this.var_name()}.children_controller.selection.add([${node_exporter.var_name()}])`);
			}
		}
	}
}
