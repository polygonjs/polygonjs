import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
const THREE = {ShaderLib};
import lodash_uniq from 'lodash/uniq';
import lodash_includes from 'lodash/includes';
import {BaseNodeGl} from '../../_Base';
// import {Output} from '../../Output'
import {NodeTraverser} from './NodeTraverser';
import {ParamConfig} from '../Config/ParamConfig';
// import {DefinitionVarying} from '../Definition/Varying'
// import {DefinitionAttribute} from '../Definition/Attribute'
// import {DefinitionVaryingCollection} from '../Definition/VaryingCollection'
// import {DefinitionAttributeCollection} from '../Definition/AttributeCollection'
import {Definition} from '../../Definition/_Module';
// import {BaseShaderAssembler} from './Assembler/_Base'
import {BaseNodeType} from '../../../_Base';
import {BaseShaderAssembler} from '../_Base';
import {ParamType} from 'src/engine/poly/ParamType';

// interface NumberByString {
// 	[propName: string]: number
// }
// interface StringByString {
// 	[propName: string]: number
// }
type BooleanByString = Map<string, boolean>;
type BooleanByStringByString = Map<string, BooleanByString>;
type StringArrayByString = Map<string, string[]>;
type StringArrayByStringByString = Map<string, StringArrayByString>;
// interface StringArrayByStringByString {
// 	[propName: string]: StringArrayByString
// }

// interface BaseNodeGlArrayByString {
// 	[propName: string]: BaseNodeGl[]
// }
// interface StringArrayByString {
// 	[propName: string]: string[]
// }

export enum ShaderType {
	BASIC = 'basic',
	LAMBERT = 'lambert',
	STANDARD = 'standard',
	POINTS = 'points',
	LINE = 'line',
}
export enum ShaderName {
	VERTEX = 'vertex',
	FRAGMENT = 'fragment',
}
export enum LineType {
	FUNCTION_DECLARATION = 'function_declaration',
	DEFINE = 'define',
	BODY = 'body',
}
export const SHADER_TYPES = [
	ShaderType.BASIC,
	ShaderType.LAMBERT,
	ShaderType.STANDARD,
	ShaderType.POINTS,
	// ShaderType.LINE
];
export const MESH_SHADER_TYPES = [ShaderType.BASIC, ShaderType.LAMBERT, ShaderType.STANDARD];
// export const SHADER_NAMES = [ShaderName.VERTEX, ShaderName.FRAGMENT]
export const LINE_TYPES = [LineType.FUNCTION_DECLARATION, LineType.DEFINE, LineType.BODY];

export const TEMPLATE_SHADERS_BY_SHADER_TYPE = {
	[ShaderType.BASIC]: ShaderLib.basic,
	[ShaderType.LAMBERT]: ShaderLib.lambert,
	[ShaderType.STANDARD]: ShaderLib.standard,
	[ShaderType.POINTS]: ShaderLib.points,
	[ShaderType.LINE]: ShaderLib.dashed,
};

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
	_param_configs: ParamConfig<ParamType>[] = [];
	_lines: StringArrayByStringByString = new Map();
	_function_declared: BooleanByStringByString = new Map();
	_param_configs_set_allowed: boolean = true;

	constructor(private _assembler: BaseShaderAssembler, private _gl_parent_node: BaseNodeType) {}

	async build_from_nodes(root_nodes: BaseNodeGl[]) {
		this.reset();
		const node_traverser = new NodeTraverser(this._assembler, this._gl_parent_node);
		node_traverser.traverse(root_nodes);

		const nodes_by_shader_name: Map<string, BaseNodeType[]> = new Map();
		for (let shader_name of this.shader_names()) {
			nodes_by_shader_name[shader_name] = node_traverser.nodes_for_shader_name(shader_name);
			// nodes.push(this._output)
			// POLY.log(shader_name, nodes_by_shader_name[shader_name].map(n=>n.name()).sort())
			// console.log("nodes_by_shader_name", shader_name, nodes_by_shader_name[shader_name].map(n=>n.name()))
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

			// console.log

			// const root_nodes_by_id = {}
			// const leaf_nodes_by_id = {}
			// const both_leaf_and_root_nodes_by_id = {}
			// for(let node of root_nodes_for_shader){ root_nodes_by_id[node.graph_node_id()] = true	}
			// for(let node of leaf_nodes_for_shader){ leaf_nodes_by_id[node.graph_node_id()] = true	}
			// for(let node of root_nodes_for_shader){
			// 	if(leaf_nodes_by_id[node.graph_node_id()]){
			// 		both_leaf_and_root_nodes_by_id[node.graph_node_id()] = true
			// 	}
			// }

			// ensure nodes are unique
			const node_ids = {};
			for (let node of nodes_by_shader_name[shader_name]) {
				node_ids[node.graph_node_id()] = true;
			}

			for (let root_node of root_nodes_for_shader) {
				// if(!both_leaf_and_root_nodes_by_id[root_node.graph_node_id()]){
				if (!node_ids[root_node.graph_node_id()]) {
					nodes_by_shader_name[shader_name].push(root_node);
					node_ids[root_node.graph_node_id()] = true;
				}
				// }
			}
			// console.log("both_leaf_and_root_nodes_by_id", both_leaf_and_root_nodes_by_id)

			// console.log("leaf_nodes_for_shader", shader_name, leaf_nodes_for_shader.map(n=>n.name()))
			for (let leaf_node of leaf_nodes_for_shader) {
				// if(!both_leaf_and_root_nodes_by_id[leaf_node.graph_node_id()]){
				if (!node_ids[leaf_node.graph_node_id()]) {
					nodes_by_shader_name[shader_name].unshift(leaf_node);
				}
				// }
			}
		}

		// ensure nodes are not added if already present
		const sorted_node_ids = {};
		for (let node of sorted_nodes) {
			sorted_node_ids[node.graph_node_id()] = true;
		}

		for (let root_node of root_nodes) {
			if (!sorted_node_ids[root_node.graph_node_id()]) {
				sorted_nodes.push(root_node);
				sorted_node_ids[root_node.graph_node_id()] = true;
			}
		}
		for (let node of sorted_nodes) {
			node.set_assembler(this._assembler);
			node.reset_code();
		}
		for (let node of sorted_nodes) {
			await node.eval_all_params();
		}

		// console.log("HERE")
		// for(let shader_name of this.shader_names()){
		// 	console.log(shader_name, nodes_by_shader_name[shader_name].map(n=>n.name()))
		// }
		// if(window.debugme){
		// 	throw "a"
		// }

		// const param_promises = sorted_nodes.map(node=>{
		// 	return node.eval_all_params()
		// })
		// await Promise.all(param_promises)

		for (let shader_name of this.shader_names()) {
			for (let node of nodes_by_shader_name[shader_name]) {
				node.set_shader_name(shader_name);
				if (this._param_configs_set_allowed) {
					node.set_param_configs();
				}
				node.set_lines();
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
		return this._assembler.shader_names();
	}

	private reset() {
		for (let shader_name of this.shader_names()) {
			this._lines[shader_name] = {};
			this._function_declared[shader_name] = {};
			for (let line_type of LINE_TYPES) {
				this._lines[shader_name][line_type] = [];
			}
		}
	}

	param_configs() {
		return this._param_configs;
	}
	lines(shader_name: ShaderName, line_type: LineType): string[] {
		return this._lines[shader_name][line_type];
	}
	all_lines() {
		return this._lines;
	}

	set_param_configs(nodes: BaseNodeGl[]) {
		this._param_configs = [];
		for (let node of nodes) {
			for (let param_config of node.param_configs()) {
				this._param_configs.push(param_config);
			}
		}
	}

	set_code_lines(nodes: BaseNodeGl[]) {
		for (let shader_name of this.shader_names()) {
			// nodes.forEach((node, i)=>{
			this.add_code_lines(nodes, shader_name);
			// })
		}
	}

	add_code_lines(nodes: BaseNodeGl[], shader_name: string) {
		// this.add_function_declarations(nodes, shader_name)
		// this.add_code_line_for_nodes_and_line_type(nodes, shader_name, LineType.DEFINE)
		// const definition_types = [
		// 	Definition.Function,
		// 	Definition.Uniform,
		// 	Definition.Varying,
		// 	Definition.Attribute
		// ]
		this.add_definitions(nodes, shader_name, Definition.Function, LineType.FUNCTION_DECLARATION);
		this.add_definitions(nodes, shader_name, Definition.Uniform, LineType.DEFINE);
		this.add_definitions(nodes, shader_name, Definition.Varying, LineType.DEFINE);
		this.add_definitions(nodes, shader_name, Definition.Attribute, LineType.DEFINE);

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
	add_definitions(nodes: BaseNodeGl[], shader_name: string, definition_constructor, line_type: LineType.DEFINE) {
		const definitions = [];
		for (let node of nodes) {
			let node_definitions = node.definitions(shader_name);
			node_definitions = node_definitions.filter((d) => d.constructor == definition_constructor);
			for (let definition of node_definitions) {
				definitions.push(definition);
			}
		}
		if (definitions.length > 0) {
			const first_definition = definitions[0];
			const collection_constructor = first_definition.collection_constructor();
			const collection = new collection_constructor(definitions);
			const uniq_definitions = collection.uniq();
			if (collection.errored()) {
				// TODO: handle error
				throw `code builder error: ${collection.error_message()}`;
			}

			const definitions_by_node_id = {};
			const node_ids = [];
			for (let definition of uniq_definitions) {
				const node_id = definition.node().graph_node_id();
				if (!lodash_includes(node_ids, node_id)) {
					node_ids.push(node_id);
				}
				definitions_by_node_id[node_id] = definitions_by_node_id[node_id] || [];
				definitions_by_node_id[node_id].push(definition);
			}
			for (let node_id of node_ids) {
				const first_definition = definitions_by_node_id[node_id][0];

				const comment = this.node_comment(first_definition.node(), line_type);
				this._lines[shader_name][line_type].push(comment);

				for (let definition of definitions_by_node_id[node_id]) {
					const line = this.line_wrap(definition.line(), line_type);
					this._lines[shader_name][line_type].push(line);
				}
				const separator = this.post_line_separator(line_type);
				this._lines[shader_name][line_type].push(separator);
			}
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
	add_code_line_for_nodes_and_line_type(nodes: BaseNodeGl[], shader_name: string, line_type: LineType) {
		nodes = nodes.filter((node) => {
			const lines = node.lines(shader_name, line_type);
			return lines.length > 0;
		});

		var nodes_count = nodes.length;
		for (let i = 0; i < nodes_count; i++) {
			const is_last = i == nodes.length - 1;
			this.add_code_line_for_node_and_line_type(nodes[i], shader_name, line_type, is_last);
		}
	}
	add_code_line_for_node_and_line_type(
		node: BaseNodeGl,
		shader_name: string,
		line_type: LineType,
		is_last: boolean
	): boolean {
		const lines = node.lines(shader_name, line_type);

		if (lines.length > 0) {
			const comment = this.node_comment(node, line_type);
			this._lines[shader_name][line_type].push(comment);
			lodash_uniq(lines).forEach((line) => {
				line = this.line_wrap(line, line_type);
				this._lines[shader_name][line_type].push(line);
			});
			if (!(line_type == LineType.BODY && is_last)) {
				const separator = this.post_line_separator(line_type);
				this._lines[shader_name][line_type].push(separator);
			}
			return true;
		}
		return false;
	}

	private node_comment(node: BaseNodeGl, line_type: LineType): string {
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

	private _is_function_declared(shader_name: ShaderName, node_type: string): boolean {
		return this._function_declared[shader_name][node_type] || false;
	}
	private _set_function_declared(shader_name: ShaderName, node_type: string) {
		this._function_declared[shader_name][node_type] = true;
	}
}
