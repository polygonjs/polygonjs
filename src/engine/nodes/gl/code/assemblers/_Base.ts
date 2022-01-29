import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Vector2} from 'three/src/math/Vector2';
import {LineType} from '../utils/LineType';
import {ShaderConfig} from '../configs/ShaderConfig';
import {VariableConfig} from '../configs/VariableConfig';
import {CodeBuilder} from '../utils/CodeBuilder';
import {BaseGlNodeType} from '../../_Base';
import {GlobalsGeometryHandler} from '../globals/Geometry';
import {TypedAssembler} from '../../../utils/shaders/BaseAssembler';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {OutputGlNode} from '../../Output';
// import {ParamType} from '../../../../poly/ParamType';
import {GlConnectionPoint, GlConnectionPointType} from '../../../utils/io/connections/Gl';
import {GlobalsGlNode} from '../../Globals';
import {AttributeGlNode} from '../../Attribute';
import {AssemblerControllerNode} from '../Controller';
import {GlobalsBaseController} from '../globals/_Base';
import {CustomMaterialName} from './materials/_BaseMaterial';
import {ShadersCollectionController} from '../utils/ShadersCollectionController';
import {IUniforms} from '../../../../../core/geometry/Material';
import {ParamGlNode} from '../../Param';
import {NodeContext} from '../../../../poly/NodeContext';
import {ShaderChunk} from 'three/src/renderers/shaders/ShaderChunk';
import {TypedNodeTraverser} from '../../../utils/shaders/NodeTraverser';
import {GlNodeFinder} from '../utils/NodeFinder';
import {VaryingWriteGlNode} from '../../VaryingWrite';

type StringArrayByShaderName = Map<ShaderName, string[]>;

interface ITemplateShader {
	vertexShader?: string;
	fragmentShader?: string;
	uniforms?: IUniforms;
}

const INSERT_DEFINE_AFTER_MAP: Map<ShaderName, string> = new Map([
	[ShaderName.VERTEX, '#include <common>'],
	[ShaderName.FRAGMENT, '#include <common>'],
]);
const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	[ShaderName.VERTEX, '#include <color_vertex>'],
	[ShaderName.FRAGMENT, 'vec4 diffuseColor = vec4( diffuse, opacity );'],
]);
const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([
	[ShaderName.VERTEX, ['#include <begin_vertex>', '#include <beginnormal_vertex>']],
	[ShaderName.FRAGMENT, []],
]);

const SPACED_LINES = 3;

export class BaseGlShaderAssembler extends TypedAssembler<NodeContext.GL> {
	protected _shaders_by_name: Map<ShaderName, string> = new Map();
	protected _lines: StringArrayByShaderName = new Map();
	protected _code_builder: CodeBuilder | undefined;
	private _param_config_owner: CodeBuilder | undefined;
	protected _root_nodes: BaseGlNodeType[] = [];
	protected _leaf_nodes: BaseGlNodeType[] = [];
	protected _material: ShaderMaterial | undefined;

	private _shader_configs: ShaderConfig[] | undefined;
	private _variable_configs: VariableConfig[] | undefined;

	private _uniforms_time_dependent: boolean = false;
	private _uniforms_resolution_dependent: boolean = false;

	constructor(protected _gl_parent_node: AssemblerControllerNode) {
		super();
	}

	protected _overriden_gl_parent_node: AssemblerControllerNode | undefined;
	setGlParentNode(gl_parent_node: AssemblerControllerNode) {
		this._overriden_gl_parent_node = gl_parent_node;
	}
	currentGlParentNode() {
		return this._overriden_gl_parent_node || this._gl_parent_node;
	}

	compile() {}

	// private get material() {
	// 	return (this._material = this._material || this._createMaterial());
	// }
	// async get_material(/*master_assembler?: BaseGlShaderAssembler*/) {
	// 	this._material = this._material || this._createMaterial();

	// 	await this._update_material(/*master_assembler*/);
	// 	return this._material;
	// }
	protected _template_shader_for_shader_name(shader_name: ShaderName): string | undefined {
		switch (shader_name) {
			case ShaderName.VERTEX:
				return this.templateShader()?.vertexShader;
			case ShaderName.FRAGMENT:
				return this.templateShader()?.fragmentShader;
		}
	}

	get globals_handler(): GlobalsBaseController | undefined {
		return this.currentGlParentNode().assemblerController?.globals_handler;
	}
	compileAllowed(): boolean {
		return this.currentGlParentNode().assemblerController?.globals_handler != null;
	}
	shaders_by_name() {
		return this._shaders_by_name;
	}

	// protected createMaterial(): ShaderMaterial | undefined {
	// 	return undefined;
	// }
	protected _build_lines() {
		for (let shader_name of this.shaderNames()) {
			const template = this._template_shader_for_shader_name(shader_name);
			if (template) {
				this._replace_template(template, shader_name);
			}
		}
	}

	// protected _build_lines_for_shader_name(shader_name: ShaderName){
	// 	const template = this._template_shader()
	// 	this._replace_template(template[`${shader_name}Shader`], shader_name)
	// }

	set_root_nodes(root_nodes: BaseGlNodeType[]) {
		this._root_nodes = root_nodes;
	}
	protected templateShader(): ITemplateShader | undefined {
		return undefined;
	}

	protected addUniforms(current_uniforms: IUniforms) {
		for (let param_config of this.param_configs()) {
			current_uniforms[param_config.uniform_name] = param_config.uniform;
		}

		if (this.uniformsTimeDependent()) {
			current_uniforms['time'] = {
				// type: '1f',
				value: this.currentGlParentNode().scene().time(),
			};
		}
		if (this.uniforms_resolution_dependent()) {
			current_uniforms['resolution'] = {
				value: new Vector2(1000, 1000),
			};
		}
	}

	//
	//
	// ROOT NODES AND SHADER NAMES
	//
	//
	rootNodesByShaderName(shaderName: ShaderName): BaseGlNodeType[] {
		// return this._root_nodes
		const list = [];
		for (let node of this._root_nodes) {
			switch (node.type()) {
				case OutputGlNode.type(): {
					list.push(node);
					break;
				}
				case ParamGlNode.type(): {
					list.push(node);
					break;
				}
				case AttributeGlNode.type(): {
					// TODO: typescript - gl - why is there a texture allocation controller in the base assembler?
					// const attrib_name = (node as AttributeGlNode).attribute_name;
					// const variable = this._texture_allocations_controller.variable(attrib_name);
					// if (variable) {
					// 	const allocation_shader_name = variable.allocation().shader_name();
					// 	if (allocation_shader_name == shader_name) {
					// 		list.push(node);
					// 	}
					// }
					// break;
				}
				case VaryingWriteGlNode.type(): {
					list.push(node);
					break;
				}
			}
		}
		return list;
	}
	leaf_nodes_by_shader_name(shader_name: ShaderName): BaseGlNodeType[] {
		const list = [];
		for (let node of this._leaf_nodes) {
			switch (node.type()) {
				case GlobalsGlNode.type(): {
					list.push(node);
					break;
				}
				case AttributeGlNode.type(): {
					// TODO: typescript - gl - why is there a texture allocation controller in the base assembler? AND especially since there is no way to assign it?
					// const attrib_name: string = (node as AttributeGlNode).attribute_name;
					// const variable = this._texture_allocations_controller.variable(attrib_name);
					// if (variable) {
					// 	const allocation_shader_name = variable.allocation().shader_name();
					// 	if (allocation_shader_name == shader_name) {
					// 		list.push(node);
					// 	}
					// }
					// break;
				}
			}
		}
		return list;
	}
	set_node_lines_globals(globals_node: GlobalsGlNode, shaders_collection_controller: ShadersCollectionController) {}
	set_node_lines_output(output_node: OutputGlNode, shaders_collection_controller: ShadersCollectionController) {}
	set_node_lines_attribute(
		attribute_node: AttributeGlNode,
		shaders_collection_controller: ShadersCollectionController
	) {}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	codeBuilder() {
		return (this._code_builder = this._code_builder || this._create_code_builder());
	}
	protected _resetCodeBuilder() {
		this._code_builder = undefined;
	}
	private _create_code_builder() {
		const nodeTraverser = new TypedNodeTraverser<NodeContext.GL>(
			this.currentGlParentNode(),
			this.shaderNames(),
			(rootNode, shaderName) => {
				return this.inputNamesForShaderName(rootNode, shaderName);
			}
		);
		return new CodeBuilder(
			nodeTraverser,
			(shaderName) => {
				return this.rootNodesByShaderName(shaderName);
			},
			this
		);
	}
	build_code_from_nodes(root_nodes: BaseGlNodeType[]) {
		const param_nodes = GlNodeFinder.findParamGeneratingNodes(this.currentGlParentNode());
		this.codeBuilder().buildFromNodes(root_nodes, param_nodes);
	}
	allow_new_param_configs() {
		this.codeBuilder().allow_new_param_configs();
	}
	disallow_new_param_configs() {
		this.codeBuilder().disallow_new_param_configs();
	}
	builder_param_configs() {
		return this.codeBuilder().param_configs();
	}
	builder_lines(shader_name: ShaderName, line_type: LineType) {
		return this.codeBuilder().lines(shader_name, line_type);
	}
	all_builder_lines() {
		return this.codeBuilder().all_lines();
	}
	param_configs() {
		const code_builder = this._param_config_owner || this.codeBuilder();
		return code_builder.param_configs();
	}
	set_param_configs_owner(param_config_owner: CodeBuilder) {
		this._param_config_owner = param_config_owner;
		if (this._param_config_owner) {
			this.codeBuilder().disallow_new_param_configs();
		} else {
			this.codeBuilder().allow_new_param_configs();
		}
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	static output_input_connection_points(): GlConnectionPoint<GlConnectionPointType>[] {
		return [
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			new GlConnectionPoint('normal', GlConnectionPointType.VEC3),
			new GlConnectionPoint('color', GlConnectionPointType.VEC3),
			new GlConnectionPoint('alpha', GlConnectionPointType.FLOAT),
			new GlConnectionPoint('uv', GlConnectionPointType.VEC2),
		];
	}
	add_output_inputs(output_child: OutputGlNode) {
		output_child.io.inputs.setNamedInputConnectionPoints(BaseGlShaderAssembler.output_input_connection_points());
	}
	static create_globals_node_output_connections() {
		// TODO: move this in material only, to use the enum GlobalsOutput
		return [
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			new GlConnectionPoint('normal', GlConnectionPointType.VEC3),
			new GlConnectionPoint('color', GlConnectionPointType.VEC3),
			new GlConnectionPoint('uv', GlConnectionPointType.VEC2),
			new GlConnectionPoint('mvPosition', GlConnectionPointType.VEC4),
			// Maybe I should not add worldPosition, worldNormal, I just now
			// as those could add computation overhead when always present in the shader.
			// But hopefully in the soon future, they will only be added when the code builder
			// adds lines based on connections, as opposed to the whole node
			new GlConnectionPoint('worldPosition', GlConnectionPointType.VEC4), // vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			new GlConnectionPoint('worldNormal', GlConnectionPointType.VEC3), // vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
			// new GlConnectionPoint('I', GlConnectionPointType.VEC3), // vec3 I = worldPosition.xyz - cameraPosition;
			new GlConnectionPoint('gl_Position', GlConnectionPointType.VEC4),
			new GlConnectionPoint('gl_FragCoord', GlConnectionPointType.VEC4),
			new GlConnectionPoint('cameraPosition', GlConnectionPointType.VEC3),
			new GlConnectionPoint('resolution', GlConnectionPointType.VEC2),
			new GlConnectionPoint('time', GlConnectionPointType.FLOAT),
		];
	}
	create_globals_node_output_connections() {
		return BaseGlShaderAssembler.create_globals_node_output_connections();
	}
	add_globals_outputs(globals_node: GlobalsGlNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints(this.create_globals_node_output_connections());
	}
	allow_attribute_exports() {
		return false;
	}

	//
	//
	// CONFIGS
	//
	//
	reset_configs() {
		this._reset_shader_configs();
		this._reset_variable_configs();
		this._resetUniformsTimeDependency();
		this._reset_uniforms_resolution_dependency();
	}
	shaderConfigs() {
		return (this._shader_configs = this._shader_configs || this.create_shader_configs());
	}
	set_shader_configs(shader_configs: ShaderConfig[]) {
		this._shader_configs = shader_configs;
	}
	shaderNames(): ShaderName[] {
		return this.shaderConfigs()?.map((sc) => sc.name()) || [];
	}
	protected _reset_shader_configs() {
		this._shader_configs = undefined;
	}
	create_shader_configs(): ShaderConfig[] {
		return [
			new ShaderConfig(ShaderName.VERTEX, ['position', 'normal', 'uv', VaryingWriteGlNode.INPUT_NAME], []),
			new ShaderConfig(ShaderName.FRAGMENT, ['color', 'alpha'], [ShaderName.VERTEX]),
		];
	}
	shader_config(name: string): ShaderConfig | undefined {
		return this.shaderConfigs()?.filter((sc) => {
			return sc.name() == name;
		})[0];
	}
	variable_configs() {
		return (this._variable_configs = this._variable_configs || this.create_variable_configs());
	}
	set_variable_configs(variable_configs: VariableConfig[]) {
		this._variable_configs = variable_configs;
	}
	variable_config(name: string) {
		return this.variable_configs().filter((vc) => {
			return vc.name() == name;
		})[0];
	}
	static create_variable_configs() {
		return [
			new VariableConfig('position', {
				default_from_attribute: true,
				// default: this.globals_handler().variable_config_default('position'),
				// required_definitions: this.globals_handler().variable_config_required_definitions('position'),
				prefix: 'vec3 transformed = ',
			}),
			new VariableConfig('normal', {
				default_from_attribute: true,
				prefix: 'vec3 objectNormal = ',
				postLines: ['#ifdef USE_TANGENT', '	vec3 objectTangent = vec3( tangent.xyz );', '#endif'],
			}),
			new VariableConfig('color', {
				prefix: 'diffuseColor.xyz = ',
			}),
			new VariableConfig('alpha', {
				prefix: 'diffuseColor.a = ',
			}),
			new VariableConfig('uv', {
				// default_from_attribute: true,
				prefix: 'vUv = ',
				if: GlobalsGeometryHandler.IF_RULE.uv,
			}),
		];
	}
	create_variable_configs(): VariableConfig[] {
		return BaseGlShaderAssembler.create_variable_configs();
	}
	protected _reset_variable_configs() {
		this._variable_configs = undefined;
		this.variable_configs();
	}
	inputNamesForShaderName(root_node: BaseGlNodeType, shader_name: ShaderName) {
		return this.shader_config(shader_name)?.input_names() || [];
	}

	// time dependency
	protected _resetUniformsTimeDependency() {
		this._uniforms_time_dependent = false;
	}
	setUniformsTimeDependent() {
		this._uniforms_time_dependent = true;
	}
	uniformsTimeDependent(): boolean {
		return this._uniforms_time_dependent;
	}
	// resolution dependency
	protected _reset_uniforms_resolution_dependency() {
		this._uniforms_resolution_dependent = false;
	}
	set_uniforms_resolution_dependent() {
		this._uniforms_resolution_dependent = true;
	}
	uniforms_resolution_dependent(): boolean {
		return this._uniforms_resolution_dependent;
	}

	//
	//
	// TEMPLATE HOOKS
	//
	//
	protected insert_define_after(shader_name: ShaderName): string | undefined {
		return INSERT_DEFINE_AFTER_MAP.get(shader_name);
	}
	protected insert_body_after(shader_name: ShaderName): string | undefined {
		return INSERT_BODY_AFTER_MAP.get(shader_name);
	}
	protected lines_to_remove(shader_name: ShaderName): string[] | undefined {
		return LINES_TO_REMOVE_MAP.get(shader_name);
	}

	//
	//
	// TEMPLATE CODE REPLACEMENT
	//
	//

	private _replace_template(template: string, shader_name: ShaderName) {
		const function_declaration = this.builder_lines(shader_name, LineType.FUNCTION_DECLARATION);
		const define = this.builder_lines(shader_name, LineType.DEFINE);
		// let all_define = function_declaration.concat(define);
		const body = this.builder_lines(shader_name, LineType.BODY);

		let template_lines = template.split('\n');
		// const scene = this.currentGlParentNode().scene;
		const new_lines = [
			// `#define FPS ${ThreeToGl.float(scene.time_controller.fps)}`,
			// `#define TIME_INCREMENT (1.0/${ThreeToGl.float(scene.time_controller.fps)})`,
			// `#define FRAME_RANGE_START ${ThreeToGl.float(scene.time_controller.frame_range[0])}`,
			// `#define FRAME_RANGE_END ${ThreeToGl.float(scene.time_controller.frame_range[1])}`,
		];

		const line_before_define = this.insert_define_after(shader_name);
		const line_before_body = this.insert_body_after(shader_name);
		const lines_to_remove = this.lines_to_remove(shader_name);
		let line_before_define_found = false;
		let lineBeforeBodyFoundOnPreviousLine = false;
		let lineBeforeBodyFound = false;

		for (let template_line of template_lines) {
			if (line_before_define_found == true) {
				if (function_declaration) {
					this._insertLines(new_lines, function_declaration);
				}
				if (define) {
					this._insertLines(new_lines, define);
				}
				line_before_define_found = false;
			}
			if (lineBeforeBodyFoundOnPreviousLine == true) {
				// this._insert_default_body_declarations(new_lines, shader_name)
				if (body) {
					this._insertLines(new_lines, body);
				}
				lineBeforeBodyFoundOnPreviousLine = false;
			}

			let line_remove_required = false;

			if (lines_to_remove) {
				for (let line_to_remove of lines_to_remove) {
					if (template_line.indexOf(line_to_remove) >= 0) {
						line_remove_required = true;
					}
				}
			}
			if (!line_remove_required) {
				new_lines.push(template_line);
			} else {
				new_lines.push('// removed:');
				new_lines.push(`//${template_line}`);
			}

			if (line_before_define && template_line.indexOf(line_before_define) >= 0) {
				line_before_define_found = true;
			}
			if (line_before_body && template_line.indexOf(line_before_body) >= 0) {
				lineBeforeBodyFoundOnPreviousLine = true;
				lineBeforeBodyFound = true;
			}

			// if(template_line.indexOf('// INSERT DEFINE') >= 0){
			// } else {
			// 	if(template_line.indexOf('// INSERT BODY') >= 0){
			// 		if(body.length > 0){
			// 			lodash_times(3, ()=>new_lines.push('	'))
			// 			body.forEach(body_line=>{
			// 				new_lines.push(body_line)
			// 			})
			// 			lodash_times(3, ()=>new_lines.push('	'))
			// 		}
			// 	} else {
			// 		if(template_line.indexOf('// TO REMOVE') < 0){
			// 			new_lines.push(template_line)
			// 		}
			// 	}
			// }
		}
		if (line_before_body) {
			if (!lineBeforeBodyFound) {
				console.warn(`line '${line_before_body}' was not found in shader '${shader_name}'`, template, this);
			} else {
				// console.log(`OK: line '${line_before_body}' was found in shader '${shader_name}'`, template, this);
			}
		}

		this._lines.set(shader_name, new_lines);
	}

	// protected _insert_default_body_declarations(new_lines, shader_name){
	// 	new_lines.push('float POLY_roughness = 1.0;')
	// }

	private _insertLines(newLines: string[], linesToAdd: string[]) {
		if (linesToAdd.length == 0) {
			return;
		}
		for (let i = 0; i < SPACED_LINES; i++) {
			newLines.push('');
		}
		for (let lineToAdd of linesToAdd) {
			newLines.push(lineToAdd);
		}
		for (let i = 0; i < SPACED_LINES; i++) {
			newLines.push('');
		}
	}

	_addFilterFragmentShaderCallback(callbackName: string, callback: (s: string) => string) {}
	_removeFilterFragmentShaderCallback(callbackName: string) {}

	getCustomMaterials(): Map<CustomMaterialName, ShaderMaterial> {
		return new Map<CustomMaterialName, ShaderMaterial>();
	}

	static expandShader(shader_string: string) {
		function parseIncludes(string: string) {
			var pattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
			function replace(match: string, include: string): string {
				var replace = ShaderChunk[include];

				if (replace === undefined) {
					throw new Error('Can not resolve #include <' + include + '>');
				}

				return parseIncludes(replace);
			}

			return string.replace(pattern, replace);
		}
		return parseIncludes(shader_string);
	}

	//
	//
	// GLTF EXPORT
	//
	//
	// static convert_material_to_gltf_supported(material: ShaderMaterial): Material{
	// 	const gltf_constructor = this.isPhysical() ? MeshPhysicalMaterial : MeshStandardMaterial
	// 	const options = {}
	// 	this._match_uniform('color', options, material, 'diffuse')
	// 	this._match_uniform('map', options, material)
	// 	this._match_uniform('envMap', options, material)
	// 	this._match_uniform('envMapIntensity', options, material)
	// 	this._match_uniform('metalness', options, material)
	// 	this._match_uniform('roughness', options, material)
	// 	const gltf_material = new gltf_constructor(options)
	// 	return gltf_material
	// }
	// static _match_uniform(name: string, options: object, material: ShaderMaterial, uniform_name?: string) {
	// 	uniform_name = uniform_name || name;
	// 	options[name] = material.uniforms[uniform_name].value;
	// }
}
