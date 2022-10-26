import {ShaderMaterial} from 'three';
import {LineType} from '../utils/LineType';
import {ShaderConfig} from '../configs/ShaderConfig';
import {VariableConfig} from '../configs/VariableConfig';
import {CodeBuilder, CodeBuilderSetCodeLinesOptions} from '../utils/CodeBuilder';
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
import {ShadersCollectionController} from '../utils/ShadersCollectionController';
import {CustomMaterialName, IUniforms} from '../../../../../core/geometry/Material';
import {ParamGlNode} from '../../Param';
import {NodeContext} from '../../../../poly/NodeContext';
import {ShaderChunk} from 'three';
import {TypedNodeTraverser} from '../../../utils/shaders/NodeTraverser';
import {GlNodeFinder} from '../utils/NodeFinder';
import {VaryingWriteGlNode} from '../../VaryingWrite';
import {SubnetOutputGlNode} from '../../SubnetOutput';
import {GlobalsOutput} from './materials/common/GlobalOutput';

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
	protected _codeBuilder: CodeBuilder | undefined;
	private _param_config_owner: CodeBuilder | undefined;
	protected _root_nodes: BaseGlNodeType[] = [];
	protected _leaf_nodes: BaseGlNodeType[] = [];
	protected _material: ShaderMaterial | undefined;

	private _shader_configs: ShaderConfig[] | undefined;
	private _variable_configs: VariableConfig[] | undefined;

	private _uniformsTimeDependent: boolean = false;
	private _uniformsResolutionDependent: boolean = false;

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

	globalsHandler(): GlobalsBaseController | undefined {
		return this.currentGlParentNode().assemblerController()?.globalsHandler();
	}
	compileAllowed(): boolean {
		return this.currentGlParentNode().assemblerController()?.globalsHandler() != null;
	}
	shaders_by_name() {
		return this._shaders_by_name;
	}

	// protected createMaterial(): ShaderMaterial | undefined {
	// 	return undefined;
	// }
	protected _buildLines() {
		for (let shaderName of this.shaderNames()) {
			const template = this._template_shader_for_shader_name(shaderName);
			if (template) {
				this._replaceTemplate(template, shaderName);
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

	// protected addUniforms(uniforms: IUniforms) {

	// 	for (let param_config of this.param_configs()) {
	// 		uniforms[param_config.uniformName()] = param_config.uniform();
	// 	}

	// 	if (this.uniformsTimeDependent()) {
	// 		uniforms[UniformName.TIME] = uniforms[UniformName.TIME] || {
	// 			// type: '1f',
	// 			value: this.currentGlParentNode().scene().time(),
	// 		};
	// 	}
	// 	if (this.uniformsResolutionDependent()) {
	// 		uniforms[UniformName.RESOLUTION] = uniforms[UniformName.RESOLUTION] || {
	// 			value: new Vector2(1000, 1000),
	// 		};
	// 	}
	// }

	//
	//
	// ROOT NODES AND SHADER NAMES
	//
	//
	rootNodesByShaderName(shaderName: ShaderName, rootNodes: BaseGlNodeType[]): BaseGlNodeType[] {
		// return this._root_nodes
		const list = [];
		for (let node of rootNodes) {
			switch (node.type()) {
				case VaryingWriteGlNode.type():
				case ParamGlNode.type():
				case SubnetOutputGlNode.type():
				case OutputGlNode.type(): {
					list.push(node);
					break;
				}
				// case SubnetOutputGlNode.type(): {
				// 	list.push(node);
				// 	break;
				// }
				// case ParamGlNode.type(): {
				// 	list.push(node);
				// 	break;
				// }
				case AttributeGlNode.type(): {
					break;
				}
				// case VaryingWriteGlNode.type(): {
				// 	list.push(node);
				// 	break;
				// }
			}
		}
		return list;
	}
	// leafNodesByShaderName(shaderName: ShaderName): BaseGlNodeType[] {
	// 	const list = [];
	// 	for (let node of this._leaf_nodes) {
	// 		switch (node.type()) {
	// 			case GlobalsGlNode.type(): {
	// 				list.push(node);
	// 				break;
	// 			}
	// 			case AttributeGlNode.type(): {
	// 				break;
	// 			}
	// 		}
	// 	}
	// 	return list;
	// }
	set_node_lines_globals(globals_node: GlobalsGlNode, shaders_collection_controller: ShadersCollectionController) {}
	set_node_lines_output(output_node: OutputGlNode, shaders_collection_controller: ShadersCollectionController) {}
	setNodeLinesAttribute(
		attribute_node: AttributeGlNode,
		shaders_collection_controller: ShadersCollectionController
	) {}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	codeBuilder() {
		return (this._codeBuilder = this._codeBuilder || this._createCodeBuilder());
	}
	protected _resetCodeBuilder() {
		this._codeBuilder = undefined;
	}
	private _createCodeBuilder() {
		const nodeTraverser = new TypedNodeTraverser<NodeContext.GL>(
			this.currentGlParentNode(),
			this.shaderNames(),
			(rootNode, shaderName) => {
				return this.inputNamesForShaderName(rootNode, shaderName);
			}
		);
		return new CodeBuilder(
			nodeTraverser,
			(shaderName, rootNodes) => {
				return this.rootNodesByShaderName(shaderName, rootNodes);
			},
			this
		);
	}
	protected buildCodeFromNodes(rootNodes: BaseGlNodeType[], codeBuilderOptions?: CodeBuilderSetCodeLinesOptions) {
		const paramNodes = GlNodeFinder.findParamGeneratingNodes(this.currentGlParentNode());
		this.codeBuilder().buildFromNodes(rootNodes, paramNodes, codeBuilderOptions);
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
			new GlConnectionPoint(GlobalsOutput.MV_POSITION, GlConnectionPointType.VEC4),
			// Maybe I should not add worldPosition, worldNormal, I just now
			// as those could add computation overhead when always present in the shader.
			// But hopefully in the soon future, they will only be added when the code builder
			// adds lines based on connections, as opposed to the whole node
			new GlConnectionPoint('worldPosition', GlConnectionPointType.VEC4), // vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			new GlConnectionPoint('worldNormal', GlConnectionPointType.VEC3), // vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
			// new GlConnectionPoint('I', GlConnectionPointType.VEC3), // vec3 I = worldPosition.xyz - cameraPosition;
			new GlConnectionPoint(GlobalsOutput.GL_POSITION, GlConnectionPointType.VEC4),
			new GlConnectionPoint(GlobalsOutput.GL_FRAGCOORD, GlConnectionPointType.VEC4),
			new GlConnectionPoint('cameraPosition', GlConnectionPointType.VEC3),
			new GlConnectionPoint(GlobalsOutput.RESOLUTION, GlConnectionPointType.VEC2),
			new GlConnectionPoint(GlobalsOutput.TIME, GlConnectionPointType.FLOAT),
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
		this._resetUniformsResolutionDependency();
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
				// default: this.globalsHandler().variable_config_default('position'),
				// required_definitions: this.globalsHandler().variable_config_required_definitions('position'),
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
		this._uniformsTimeDependent = false;
	}
	setUniformsTimeDependent() {
		this._uniformsTimeDependent = true;
	}
	uniformsTimeDependent(): boolean {
		return this._uniformsTimeDependent;
	}
	// resolution dependency
	protected _resetUniformsResolutionDependency() {
		this._uniformsResolutionDependent = false;
	}
	setUniformsResolutionDependent() {
		this._uniformsResolutionDependent = true;
	}
	uniformsResolutionDependent(): boolean {
		return this._uniformsResolutionDependent;
	}
	protected _raymarchingLightsWorldCoordsDependent() {
		return false;
	}
	//
	//
	// TEMPLATE HOOKS
	//
	//
	protected insertDefineAfter(shaderName: ShaderName): string | undefined {
		return INSERT_DEFINE_AFTER_MAP.get(shaderName);
	}
	protected insertBodyAfter(shaderName: ShaderName): string | undefined {
		return INSERT_BODY_AFTER_MAP.get(shaderName);
	}
	protected linesToRemove(shaderName: ShaderName): string[] | undefined {
		return LINES_TO_REMOVE_MAP.get(shaderName);
	}

	//
	//
	// TEMPLATE CODE REPLACEMENT
	//
	//

	private _replaceTemplate(template: string, shaderName: ShaderName) {
		const functionDeclaration = this.builder_lines(shaderName, LineType.FUNCTION_DECLARATION);
		const define = this.builder_lines(shaderName, LineType.DEFINE);
		// let all_define = function_declaration.concat(define);
		const body = this.builder_lines(shaderName, LineType.BODY);

		let templateLines = template.split('\n');
		// const scene = this.currentGlParentNode().scene;
		const newLines: string[] = [
			// `#define FPS ${ThreeToGl.float(scene.time_controller.fps)}`,
			// `#define TIME_INCREMENT (1.0/${ThreeToGl.float(scene.time_controller.fps)})`,
			// `#define FRAME_RANGE_START ${ThreeToGl.float(scene.time_controller.frame_range[0])}`,
			// `#define FRAME_RANGE_END ${ThreeToGl.float(scene.time_controller.frame_range[1])}`,
		];

		const lineBeforeDefine = this.insertDefineAfter(shaderName);
		const lineBeforeBody = this.insertBodyAfter(shaderName);
		const linesToRemove = this.linesToRemove(shaderName);
		let lineBeforeDefineFound = false;
		let lineBeforeBodyFoundOnPreviousLine = false;
		let lineBeforeBodyFound = false;

		for (let templateLine of templateLines) {
			if (lineBeforeDefineFound == true) {
				if (functionDeclaration) {
					this._insertLines(newLines, functionDeclaration);
				}
				if (define) {
					this._insertLines(newLines, define);
				}
				lineBeforeDefineFound = false;
			}
			if (lineBeforeBodyFoundOnPreviousLine == true) {
				// this._insert_default_body_declarations(new_lines, shaderName)
				if (body) {
					this._insertLines(newLines, body);
				}
				lineBeforeBodyFoundOnPreviousLine = false;
			}

			let line_remove_required = false;

			if (linesToRemove) {
				for (let line_to_remove of linesToRemove) {
					if (templateLine.indexOf(line_to_remove) >= 0) {
						line_remove_required = true;
					}
				}
			}
			if (!line_remove_required) {
				newLines.push(templateLine);
			} else {
				newLines.push('// removed:');
				newLines.push(`//${templateLine}`);
			}

			if (lineBeforeDefine && templateLine.indexOf(lineBeforeDefine) >= 0) {
				lineBeforeDefineFound = true;
			}
			if (lineBeforeBody && templateLine.indexOf(lineBeforeBody) >= 0) {
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
		if (lineBeforeBody) {
			if (!lineBeforeBodyFound) {
				console.warn(`line '${lineBeforeBody}' was not found in shader '${shaderName}'`, template, this);
			} else {
				// console.log(`OK: line '${line_before_body}' was found in shader '${shader_name}'`, template, this);
			}
		}

		this._lines.set(shaderName, newLines);
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
