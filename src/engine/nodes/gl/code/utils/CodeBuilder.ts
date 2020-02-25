// import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import lodash_uniq from 'lodash/uniq';
import {BaseGlNodeType} from '../../_Base';
// import {Output} from '../../Output'
import {TypedNodeTraverser} from '../../../utils/shaders/NodeTraverser';
// import {DefinitionVarying} from '../Definition/Varying'
// import {DefinitionAttribute} from '../Definition/Attribute'
// import {DefinitionVaryingCollection} from '../Definition/VaryingCollection'
// import {DefinitionAttributeCollection} from '../Definition/AttributeCollection'
// import {Definition} from '../../Definition/_Module';
// import {BaseShaderAssembler} from './Assembler/_Base'
import {BaseNodeType} from '../../../_Base';
import {BaseGlShaderAssembler} from '../assemblers/_Base';
import {MapUtils} from 'src/core/MapUtils';
import {ShaderName} from 'src/engine/nodes/utils/shaders/ShaderName';
import {GLDefinitionType, BaseGLDefinition} from '../../utils/GLDefinition';
import {TypedGLDefinitionCollection} from '../../utils/GLDefinitionCollection';
import {ParamConfigsController} from 'src/engine/nodes/utils/code/controllers/ParamConfigsController';

// interface NumberByString {
// 	[propName: string]: number
// }
// interface StringByString {
// 	[propName: string]: number
// }
// type BooleanByString = Map<string, boolean>;
// type StringArrayByString = Map<string, string[]>;
// interface StringArrayByStringByString {
// 	[propName: string]: StringArrayByString
// }

// interface BaseNodeGlArrayByString {
// 	[propName: string]: BaseNodeGl[]
// }
// interface StringArrayByString {
// 	[propName: string]: string[]
// }

// export enum ShaderType {
// 	BASIC = 'basic',
// 	LAMBERT = 'lambert',
// 	STANDARD = 'standard',
// 	POINTS = 'points',
// 	LINE = 'line',
// }

export enum LineType {
	FUNCTION_DECLARATION = 'function_declaration',
	DEFINE = 'define',
	BODY = 'body',
}
// export const SHADER_TYPES = [
// 	ShaderType.BASIC,
// 	ShaderType.LAMBERT,
// 	ShaderType.STANDARD,
// 	ShaderType.POINTS,
// 	// ShaderType.LINE
// ];
// export const MESH_SHADER_TYPES = [ShaderType.BASIC, ShaderType.LAMBERT, ShaderType.STANDARD];
// export const SHADER_NAMES = [ShaderName.VERTEX, ShaderName.FRAGMENT]
// export const LINE_TYPES = [LineType.FUNCTION_DECLARATION, LineType.DEFINE, LineType.BODY];

// export const TEMPLATE_SHADERS_BY_SHADER_TYPE = {
// 	[ShaderType.BASIC]: ShaderLib.basic,
// 	[ShaderType.LAMBERT]: ShaderLib.lambert,
// 	[ShaderType.STANDARD]: ShaderLib.standard,
// 	[ShaderType.POINTS]: ShaderLib.points,
// 	[ShaderType.LINE]: ShaderLib.dashed,
// };

const LINE_SUFFIXES = {
	[LineType.FUNCTION_DECLARATION]: '',
	[LineType.DEFINE]: ';',
	[LineType.BODY]: ';',
};

const LINE_PREFIXES = {
	[LineType.FUNCTION_DECLARATION]: '',
	[LineType.DEFINE]: '',
	[LineType.BODY]: '	',
};

export class CodeBuilder {
	// _param_configs: ParamConfig<ParamType>[] = [];
	_param_configs_controller: ParamConfigsController = new ParamConfigsController();
	_param_configs_set_allowed: boolean = true;

	_lines: Map<ShaderName, Map<LineType, string[]>> = new Map();
	_function_declared: Map<ShaderName, Map<string, boolean>> = new Map();

	constructor(private _assembler: BaseGlShaderAssembler, private _gl_parent_node: BaseNodeType) {}

	async build_from_nodes(root_nodes: BaseGlNodeType[]) {
		this.reset();

		const node_traverser = new TypedNodeTraverser<BaseGlNodeType>(this._assembler, this._gl_parent_node);
		node_traverser.traverse(root_nodes);

		const nodes_by_shader_name: Map<ShaderName, BaseGlNodeType[]> = new Map();
		for (let shader_name of this.shader_names()) {
			nodes_by_shader_name.set(shader_name, node_traverser.nodes_for_shader_name(shader_name));
			// nodes.push(this._output)
			// POLY.log(shader_name, nodes_by_shader_name[shader_name].map(n=>n.name()).sort())
		}
		// POLY.log("nodes_by_shader_name", this._assembler.shaders_by_name(), nodes_by_shader_name)
		// const vertex_nodes = node_traverser.nodes_for_shader_name(ShaderName.VERTEX)
		// const fragment_nodes = node_traverser.nodes_for_shader_name(ShaderName.FRAGMENT)
		const sorted_nodes = node_traverser.sorted_nodes();
		for (let shader_name of this.shader_names()) {
			const root_nodes_for_shader = this._assembler.root_nodes_by_shader_name(shader_name);
			const leaf_nodes_for_shader = this._assembler.leaf_nodes_by_shader_name(shader_name);

			// keep track of which nodes are both leaf and root, and do not use their code twice
			// as this may happen with an attribute node, when used as both import and export

			// ensure nodes are unique
			const node_ids: Map<string, boolean> = new Map();
			nodes_by_shader_name.forEach((nodes, shader_name) => {
				for (let node of nodes) {
					node_ids.set(node.graph_node_id, true);
				}
			});

			for (let root_node of root_nodes_for_shader) {
				// if(!both_leaf_and_root_nodes_by_id[root_node.graph_node_id()]){
				if (!node_ids.get(root_node.graph_node_id)) {
					MapUtils.push_on_array_at_entry(nodes_by_shader_name, shader_name, root_node);
					node_ids.set(root_node.graph_node_id, true);
				}
				// }
			}
			for (let leaf_node of leaf_nodes_for_shader) {
				// if(!both_leaf_and_root_nodes_by_id[leaf_node.graph_node_id()]){
				if (!node_ids.get(leaf_node.graph_node_id)) {
					MapUtils.unshift_on_array_at_entry(nodes_by_shader_name, shader_name, leaf_node);
				}
				// }
			}
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

		for (let shader_name of this.shader_names()) {
			const nodes = nodes_by_shader_name.get(shader_name);
			if (nodes) {
				for (let node of nodes) {
					node.set_shader_name(shader_name);
					if (this._param_configs_set_allowed) {
						node.set_param_configs();
					}
					node.set_lines();
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
		// this.add_function_declarations(nodes, shader_name)
		// this.add_code_line_for_nodes_and_line_type(nodes, shader_name, LineType.DEFINE)
		// const definition_types = [
		// 	Definition.Function,
		// 	Definition.Uniform,
		// 	Definition.Varying,
		// 	Definition.Attribute
		// ]

		this.add_definitions(nodes, shader_name, GLDefinitionType.FUNCTION, LineType.FUNCTION_DECLARATION);
		this.add_definitions(nodes, shader_name, GLDefinitionType.UNIFORM, LineType.DEFINE);
		this.add_definitions(nodes, shader_name, GLDefinitionType.VARYING, LineType.DEFINE);
		this.add_definitions(nodes, shader_name, GLDefinitionType.ATTRIBUTE, LineType.DEFINE);

		this.add_code_line_for_nodes_and_line_type(nodes, shader_name, LineType.BODY);
	}
	// add_function_declarations(nodes: BaseNodeGl[], shader_name: ShaderNames){
	// 	const line_type = LineType.FUNCTION_DECLARATION
	// 	nodes = nodes.filter(node=>{
	// 		const lines_count = node.lines(shader_name, line_type)
	// 		return lines_count.length > 0
	// 	})

	// 	nodes.forEach((node, i)=>{
	// 		const is_last = (i == (nodes.length-1))
	// 		const node_type = node.type()
	// 		let function_declared = this._is_function_declared(shader_name, node_type)
	// 		if(!function_declared){
	// 			function_declared = this.add_code_line_for_node_and_line_type(node, shader_name, line_type, is_last)
	// 			if(function_declared){
	// 				this._set_function_declared(shader_name, node_type)
	// 			}
	// 		}
	// 	})
	// }
	private add_definitions(
		nodes: BaseGlNodeType[],
		shader_name: ShaderName,
		definition_type: GLDefinitionType,
		line_type: LineType
	) {
		const definitions = [];
		for (let node of nodes) {
			let node_definitions = node.definitions(shader_name);
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
			node_ids.forEach((boolean, node_id: string) => {
				const definitions = definitions_by_node_id.get(node_id);
				if (definitions) {
					const first_definition = definitions[0];

					if (first_definition) {
						const comment = this.node_comment(first_definition.node, line_type);
						MapUtils.push_on_array_at_entry(lines_for_shader, line_type, comment);

						for (let definition of definitions) {
							const line = this.line_wrap(definition.line, line_type);
							MapUtils.push_on_array_at_entry(lines_for_shader, line_type, line);
						}
						const separator = this.post_line_separator(line_type);
						MapUtils.push_on_array_at_entry(lines_for_shader, line_type, separator);
					}
				}
			});
			// uniq_definitions.forEach(definition=>{
			// 	const line = this.line_wrap(definition.line(), line_type)

			// 	const comment = this.node_comment(definition.node(), line_type)
			// 	this._lines[shader_name][line_type].push(comment)
			// 	this._lines[shader_name][line_type].push(line)
			// 	const separator = this.post_line_separator(line_type)
			// 	this._lines[shader_name][line_type].push(separator)
			// })
			if (uniq_definitions.length > 0) {
			}
		}
	}
	add_code_line_for_nodes_and_line_type(nodes: BaseGlNodeType[], shader_name: ShaderName, line_type: LineType) {
		nodes = nodes.filter((node) => {
			const lines = node.lines(shader_name, line_type);
			return lines && lines.length > 0;
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
	): boolean {
		const lines = node.lines(shader_name, line_type);
		const lines_for_shader = this._lines.get(shader_name)!;

		if (lines && lines.length > 0) {
			const comment = this.node_comment(node, line_type);
			MapUtils.push_on_array_at_entry(lines_for_shader, line_type, comment);
			lodash_uniq(lines).forEach((line) => {
				line = this.line_wrap(line, line_type);
				MapUtils.push_on_array_at_entry(lines_for_shader, line_type, line);
			});
			if (!(line_type == LineType.BODY && is_last)) {
				const separator = this.post_line_separator(line_type);
				MapUtils.push_on_array_at_entry(lines_for_shader, line_type, separator);
			}
			return true;
		}
		return false;
	}

	private node_comment(node: BaseGlNodeType, line_type: LineType): string {
		let line = `// ${node.full_path()}`;
		if (line_type == LineType.BODY) {
			line = `	${line}`;
		}
		return line;
	}
	private line_wrap(line: string, line_type: LineType) {
		let add_suffix = true;
		if (line.indexOf('#if') == 0 || line.indexOf('#endif') == 0) {
			add_suffix = false;
		}
		if (add_suffix) {
			return `${LINE_PREFIXES[line_type]}${line}${LINE_SUFFIXES[line_type]}`;
		} else {
			return `${LINE_PREFIXES[line_type]}${line}`;
		}
	}
	private post_line_separator(line_type: LineType) {
		return line_type == LineType.BODY ? '	' : '';
	}

	// private _is_function_declared(shader_name: ShaderName, node_type: string): boolean {
	// 	return this._function_declared[shader_name][node_type] || false;
	// }
	// private _set_function_declared(shader_name: ShaderName, node_type: string) {
	// 	this._function_declared[shader_name][node_type] = true;
	// }
}
