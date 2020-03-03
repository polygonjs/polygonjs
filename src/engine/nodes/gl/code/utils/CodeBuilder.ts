import lodash_uniq from 'lodash/uniq';
import {BaseGlNodeType} from '../../_Base';
import {TypedNodeTraverser} from '../../../utils/shaders/NodeTraverser';
import {BaseNodeType} from '../../../_Base';
import {BaseGlShaderAssembler} from '../assemblers/_Base';
import {MapUtils} from '../../../../../core/MapUtils';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {GLDefinitionType, BaseGLDefinition} from '../../utils/GLDefinition';
import {TypedGLDefinitionCollection} from '../../utils/GLDefinitionCollection';
import {ParamConfigsController} from '../../../../nodes/utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './ShadersCollectionController';
import {CodeFormatter} from './CodeFormatter';

import {LineType} from './LineType';

export class CodeBuilder {
	_param_configs_controller: ParamConfigsController = new ParamConfigsController();
	_param_configs_set_allowed: boolean = true;

	private _shaders_collection_controller: ShadersCollectionController | undefined;
	_lines: Map<ShaderName, Map<LineType, string[]>> = new Map();
	_function_declared: Map<ShaderName, Map<string, boolean>> = new Map();

	constructor(private _assembler: BaseGlShaderAssembler, private _gl_parent_node: BaseNodeType) {}

	async build_from_nodes(root_nodes: BaseGlNodeType[]) {
		const node_traverser = new TypedNodeTraverser<BaseGlNodeType>(this._assembler, this._gl_parent_node);
		node_traverser.traverse(root_nodes);

		const nodes_by_shader_name: Map<ShaderName, BaseGlNodeType[]> = new Map();
		for (let shader_name of this.shader_names()) {
			nodes_by_shader_name.set(shader_name, node_traverser.nodes_for_shader_name(shader_name));
		}
		const sorted_nodes = node_traverser.sorted_nodes();
		for (let shader_name of this.shader_names()) {
			const root_nodes_for_shader = this._assembler.root_nodes_by_shader_name(shader_name);
			// const leaf_nodes_for_shader = this._assembler.leaf_nodes_by_shader_name(shader_name);

			// keep track of which nodes are both leaf and root, and do not use their code twice
			// as this may happen with an attribute node, when used as both import and export
			// TODO: that seems useless, as I surely should be able to filter duplicates if needed

			// ensure nodes are unique
			// const node_ids: Map<string, boolean> = new Map();
			// nodes_by_shader_name.forEach((nodes, shader_name) => {
			// 	for (let node of nodes) {
			// 		node_ids.set(node.graph_node_id, true);
			// 	}
			// });

			for (let root_node of root_nodes_for_shader) {
				// if(!both_leaf_and_root_nodes_by_id[root_node.graph_node_id()]){
				// if (!node_ids.get(root_node.graph_node_id)) {
				MapUtils.push_on_array_at_entry(nodes_by_shader_name, shader_name, root_node);
				// node_ids.set(root_node.graph_node_id, true);
				// }
				// }
			}
			// for (let leaf_node of leaf_nodes_for_shader) {
			// if(!both_leaf_and_root_nodes_by_id[leaf_node.graph_node_id()]){
			// if (!node_ids.get(leaf_node.graph_node_id)) {
			// MapUtils.unshift_on_array_at_entry(nodes_by_shader_name, shader_name, leaf_node);
			// }
			// }
			// }
		}

		// ensure nodes are not added if already present
		const sorted_node_ids: Map<string, boolean> = new Map();
		for (let node of sorted_nodes) {
			sorted_node_ids.set(node.graph_node_id, true);
		}

		for (let root_node of root_nodes) {
			if (!sorted_node_ids.get(root_node.graph_node_id)) {
				sorted_nodes.push(root_node);
				sorted_node_ids.set(root_node.graph_node_id, true);
			}
		}
		for (let node of sorted_nodes) {
			// node.set_assembler(this._assembler);
			node.reset_code();
		}
		for (let node of sorted_nodes) {
			await node.params.eval_all();
		}

		// const param_promises = sorted_nodes.map(node=>{
		// 	return node.eval_all_params()
		// })
		// await Promise.all(param_promises)

		this._shaders_collection_controller = new ShadersCollectionController(
			this.shader_names(),
			this.shader_names()[0]
		);
		this.reset();
		for (let shader_name of this.shader_names()) {
			const nodes = lodash_uniq(nodes_by_shader_name.get(shader_name));
			this._shaders_collection_controller.set_current_shader_name(shader_name);
			if (nodes) {
				for (let node of nodes) {
					// node.set_shader_name(shader_name);
					if (this._param_configs_set_allowed) {
						node.set_param_configs();
					}
					node.set_lines(this._shaders_collection_controller);
				}
			}
		}
		// fragment_nodes.forEach(node=>{
		// 	node.set_shader_name(ShaderName.FRAGMENT)
		// 	node.set_param_configs()
		// 	node.set_lines()
		// })
		if (this._param_configs_set_allowed) {
			this.set_param_configs(sorted_nodes);
		}
		this.set_code_lines(sorted_nodes);
	}

	disallow_new_param_configs() {
		this._param_configs_set_allowed = false;
	}
	allow_new_param_configs() {
		this._param_configs_set_allowed = true;
	}

	shader_names() {
		return this._assembler.shader_names;
	}

	private reset() {
		for (let shader_name of this.shader_names()) {
			const lines_map = new Map();
			// for (let line_type of LINE_TYPES) {
			// 	lines_map.set(line_type, []);
			// }
			this._lines.set(shader_name, lines_map);
			this._function_declared.set(shader_name, new Map());
		}
	}

	param_configs() {
		return this._param_configs_controller.list || [];
	}
	lines(shader_name: ShaderName, line_type: LineType) {
		return this._lines.get(shader_name)!.get(line_type);
	}
	all_lines() {
		return this._lines;
	}

	set_param_configs(nodes: BaseGlNodeType[]) {
		this._param_configs_controller.reset();
		for (let node of nodes) {
			const param_configs = node.param_configs();
			if (param_configs) {
				for (let param_config of param_configs) {
					this._param_configs_controller.push(param_config);
				}
			}
		}
	}

	set_code_lines(nodes: BaseGlNodeType[]) {
		for (let shader_name of this.shader_names()) {
			// nodes.forEach((node, i)=>{
			this.add_code_lines(nodes, shader_name);
			// })
		}
	}

	add_code_lines(nodes: BaseGlNodeType[], shader_name: ShaderName) {
		this.add_definitions(nodes, shader_name, GLDefinitionType.FUNCTION, LineType.FUNCTION_DECLARATION);
		this.add_definitions(nodes, shader_name, GLDefinitionType.UNIFORM, LineType.DEFINE);
		this.add_definitions(nodes, shader_name, GLDefinitionType.VARYING, LineType.DEFINE);
		this.add_definitions(nodes, shader_name, GLDefinitionType.ATTRIBUTE, LineType.DEFINE);

		this.add_code_line_for_nodes_and_line_type(nodes, shader_name, LineType.BODY);
	}

	private add_definitions(
		nodes: BaseGlNodeType[],
		shader_name: ShaderName,
		definition_type: GLDefinitionType,
		line_type: LineType
	) {
		if (!this._shaders_collection_controller) {
			return;
		}
		const definitions = [];
		for (let node of nodes) {
			let node_definitions = this._shaders_collection_controller.definitions(shader_name, node);
			if (node_definitions) {
				node_definitions = node_definitions.filter((d) => d.definition_type == definition_type);
				for (let definition of node_definitions) {
					definitions.push(definition);
				}
			}
		}

		if (definitions.length > 0) {
			const collection = new TypedGLDefinitionCollection<GLDefinitionType>(definitions);
			const uniq_definitions = collection.uniq();
			if (collection.errored) {
				// TODO: handle error
				throw `code builder error: ${collection.error_message}`;
			}

			const definitions_by_node_id: Map<string, BaseGLDefinition[]> = new Map();
			const node_ids: Map<string, boolean> = new Map();
			for (let definition of uniq_definitions) {
				const node_id = definition.node.graph_node_id;
				if (!node_ids.has(node_id)) {
					node_ids.set(node_id, true);
				}
				MapUtils.push_on_array_at_entry(definitions_by_node_id, node_id, definition);
			}
			const lines_for_shader = this._lines.get(shader_name)!;
			node_ids.forEach((boolean: boolean, node_id: string) => {
				const definitions = definitions_by_node_id.get(node_id);
				if (definitions) {
					const first_definition = definitions[0];

					if (first_definition) {
						const comment = CodeFormatter.node_comment(first_definition.node, line_type);
						MapUtils.push_on_array_at_entry(lines_for_shader, line_type, comment);

						for (let definition of definitions) {
							const line = CodeFormatter.line_wrap(definition.line, line_type);
							MapUtils.push_on_array_at_entry(lines_for_shader, line_type, line);
						}
						const separator = CodeFormatter.post_line_separator(line_type);
						MapUtils.push_on_array_at_entry(lines_for_shader, line_type, separator);
					}
				}
			});
		}
	}
	add_code_line_for_nodes_and_line_type(nodes: BaseGlNodeType[], shader_name: ShaderName, line_type: LineType) {
		nodes = nodes.filter((node) => {
			if (this._shaders_collection_controller) {
				const lines = this._shaders_collection_controller.body_lines(shader_name, node);
				return lines && lines.length > 0;
			}
		});

		var nodes_count = nodes.length;
		for (let i = 0; i < nodes_count; i++) {
			const is_last = i == nodes.length - 1;
			this.add_code_line_for_node_and_line_type(nodes[i], shader_name, line_type, is_last);
		}
	}
	add_code_line_for_node_and_line_type(
		node: BaseGlNodeType,
		shader_name: ShaderName,
		line_type: LineType,
		is_last: boolean
	): void {
		if (!this._shaders_collection_controller) {
			return;
		}
		const lines = this._shaders_collection_controller.body_lines(shader_name, node);

		if (lines && lines.length > 0) {
			const lines_for_shader = this._lines.get(shader_name)!;
			const comment = CodeFormatter.node_comment(node, line_type);
			MapUtils.push_on_array_at_entry(lines_for_shader, line_type, comment);
			lodash_uniq(lines).forEach((line) => {
				line = CodeFormatter.line_wrap(line, line_type);
				MapUtils.push_on_array_at_entry(lines_for_shader, line_type, line);
			});
			if (!(line_type == LineType.BODY && is_last)) {
				const separator = CodeFormatter.post_line_separator(line_type);
				MapUtils.push_on_array_at_entry(lines_for_shader, line_type, separator);
			}
		}
	}
}
