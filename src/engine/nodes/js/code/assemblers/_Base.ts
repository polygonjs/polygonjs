import {ShaderMaterial} from 'three';
import {LineType} from '../utils/LineType';
import {VariableConfig} from '../configs/VariableConfig';
import {JsCodeBuilder, CodeBuilderSetCodeLinesOptions} from '../utils/CodeBuilder';
import {BaseJsNodeType, TypedJsNode} from '../../_Base';
import {ShaderConfig} from '../configs/ShaderConfig';
// import {GlobalsGeometryHandler} from '../globals/Geometry';
import {TypedAssembler} from '../../../utils/shaders/BaseAssembler';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {OutputJsNode} from '../../Output';
// import {ParamType} from '../../../../poly/ParamType';
import {JsConnectionPoint, JsConnectionPointType} from '../../../utils/io/connections/Js';
import {GlobalsJsNode} from '../../Globals';
import {AttributeJsNode} from '../../Attribute';
import {AssemblerControllerNode} from '../Controller';
import {GlobalsJsBaseController} from '../globals/_Base';
import {JsLinesCollectionController} from '../utils/JsLinesCollectionController';
import {IUniforms} from '../../../../../core/geometry/Material';
// import {ParamJsNode} from '../../Param';
import {NodeContext} from '../../../../poly/NodeContext';
// import {ShaderChunk} from 'three';
import {TypedNodeTraverser} from '../../../utils/shaders/NodeTraverser';
import {JsNodeFinder} from '../utils/NodeFinder';
import {JsType} from '../../../../poly/registers/nodes/types/Js';
// import {VaryingWriteGlNode} from '../../VaryingWrite';
// import {SubnetOutputGlNode} from '../../SubnetOutput';
// import {GlobalsOutput} from './common/GlobalsOutput';
// import {JsParamConfig} from '../utils/JsParamConfig';
// import {ParamType} from '../../../../poly/ParamType';
import {BaseNamedFunction} from '../../../../functions/_Base';
// import {CoreString} from '../../../../../core/String';
import {RegisterableVariable} from './_BaseJsPersistedConfigUtils';
import {NamedFunctionMap} from '../../../../poly/registers/functions/All';
import {JsParamConfig} from '../utils/JsParamConfig';
import {ParamType} from '../../../../poly/ParamType';
import {ParamOptions} from '../../../../params/utils/OptionsController';

type StringArrayByJsFunctionName = Map<ShaderName, string[]>;

export interface FunctionData {
	functionBody: string;
	variableNames: string[];
	variablesByName: Record<string, RegisterableVariable>;
	functionNames: Array<keyof NamedFunctionMap>;
	functionsByName: Record<string, Function>;
	paramConfigs: JsParamConfig<ParamType>[];
	// paramConfigs: readonly JsParamConfig<ParamType>[];
}
interface ITemplateShader {
	vertexShader?: string;
	fragmentShader?: string;
	uniforms?: IUniforms;
}
export const INSERT_MEMBERS_AFTER = '// insert members';
export const INSERT_DEFINE_AFTER = '// insert defines';
export const INSERT_CONSTRUCTOR_AFTER = '// insert after constructor';
export const INSERT_BODY_AFTER = '// insert body';
// export const INSERT_TRIGGER_AFTER = '// insert trigger';
// export const INSERT_TRIGGERABLE_AFTER = '// insert triggerable';

const INSERT_MEMBER_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '#include <common>'],
	[ShaderName.FRAGMENT, INSERT_MEMBERS_AFTER],
]);
const INSERT_DEFINE_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '#include <common>'],
	[ShaderName.FRAGMENT, INSERT_DEFINE_AFTER],
]);
const INSERT_CONSTRUCTOR_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '#include <common>'],
	[ShaderName.FRAGMENT, INSERT_CONSTRUCTOR_AFTER],
]);
const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '#include <color_vertex>'],
	[ShaderName.FRAGMENT, INSERT_BODY_AFTER],
]);
// const INSERT_TRIGGER_AFTER_MAP: Map<ShaderName, string> = new Map([
// 	// [ShaderName.VERTEX, '#include <color_vertex>'],
// 	[ShaderName.FRAGMENT, INSERT_TRIGGER_AFTER],
// ]);
// const INSERT_TRIGGERABLE_AFTER_MAP: Map<ShaderName, string> = new Map([
// 	// [ShaderName.VERTEX, '#include <color_vertex>'],
// 	[ShaderName.FRAGMENT, INSERT_TRIGGERABLE_AFTER],
// ]);
const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([
	// [ShaderName.VERTEX, ['#include <begin_vertex>', '#include <beginnormal_vertex>']],
	[ShaderName.FRAGMENT, []],
]);

const SPACED_LINES = 3;

export abstract class BaseJsShaderAssembler extends TypedAssembler<NodeContext.JS> {
	protected _shaders_by_name: Map<ShaderName, string> = new Map();
	protected _lines: StringArrayByJsFunctionName = new Map();
	protected _codeBuilder: JsCodeBuilder | undefined;
	private _param_config_owner: JsCodeBuilder | undefined;
	protected _root_nodes: BaseJsNodeType[] = [];
	protected _leaf_nodes: BaseJsNodeType[] = [];
	protected _material: ShaderMaterial | undefined;

	private _shader_configs: ShaderConfig[] | undefined;
	private _variable_configs: VariableConfig[] | undefined;

	private _uniformsTimeDependent: boolean = false;
	private _uniformsResolutionDependent: boolean = false;
	private _computedVarNames: Set<string> = new Set();

	constructor(protected _gl_parent_node: AssemblerControllerNode<BaseJsShaderAssembler>) {
		super();
	}

	protected _overriden_gl_parent_node: AssemblerControllerNode<BaseJsShaderAssembler> | undefined;
	setGlParentNode(gl_parent_node: AssemblerControllerNode<BaseJsShaderAssembler>) {
		this._overriden_gl_parent_node = gl_parent_node;
	}
	currentGlParentNode() {
		return this._overriden_gl_parent_node || this._gl_parent_node;
	}
	abstract makeFunctionNodeDirtyOnChange(): boolean;
	addComputedVarName(varName: string) {
		if (!this.computedVariablesAllowed()) {
			return;
		}
		this._computedVarNames.add(varName);
	}
	registeredAsComputed(varName: string): boolean {
		return this._computedVarNames.has(varName);
	}
	computedVariablesAllowed(): boolean {
		return false;
	}

	abstract spareParamsOptions(): ParamOptions;

	compile() {}

	abstract defaultObject3DVariable(): string;
	abstract defaultObject3DMaterialVariable(): string;

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

	globalsHandler(): GlobalsJsBaseController | undefined {
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

	set_root_nodes(root_nodes: BaseJsNodeType[]) {
		this._root_nodes = root_nodes;
	}
	protected templateShader(): ITemplateShader | undefined {
		return undefined;
	}
	protected _reset() {
		this._resetRegisteredFunctions();
		this._resetRegisteredVariables();
		this._computedVarNames.clear();
	}

	updateFunction() {
		this._reset();
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
	rootNodesByShaderName(shaderName: ShaderName, rootNodes: BaseJsNodeType[]): BaseJsNodeType[] {
		// return this._root_nodes
		const list = [];
		for (let node of rootNodes) {
			switch (node.type()) {
				// case VaryingWriteGlNode.type():
				// case ParamGlNode.type():
				case JsType.PARAM:
				// case SubnetOutputGlNode.type():
				case JsType.OUTPUT: {
					list.push(node);
					break;
				}
				case JsType.OUTPUT_AREA_LIGHT: {
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
				case JsType.ATTRIBUTE: {
					list.push(node);
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
	setNodeLinesGlobals(globalsNode: GlobalsJsNode, linesController: JsLinesCollectionController) {}
	setNodeLinesOutput(outputNode: OutputJsNode, linesController: JsLinesCollectionController) {}
	setNodeLinesAttribute(attributeNode: AttributeJsNode, linesController: JsLinesCollectionController) {}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	codeBuilder() {
		return (this._codeBuilder = this._codeBuilder || this._createCodeBuilder());
	}

	private _createCodeBuilder() {
		const nodeTraverser = new TypedNodeTraverser<NodeContext.JS>(
			this.currentGlParentNode(),
			this.shaderNames(),
			(rootNode, shaderName) => {
				return this.inputNamesForShaderName(rootNode, shaderName);
			},
			{traverseChildren: true}
		);
		return new JsCodeBuilder(
			nodeTraverser,
			(shaderName, rootNodes) => {
				return this.rootNodesByShaderName(shaderName, rootNodes);
			},
			this
		);
	}
	protected buildCodeFromNodes(rootNodes: BaseJsNodeType[], codeBuilderOptions?: CodeBuilderSetCodeLinesOptions) {
		const paramNodes = JsNodeFinder.findParamGeneratingNodes(this.currentGlParentNode());
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
	set_param_configs_owner(param_config_owner: JsCodeBuilder) {
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
	static output_input_connection_points(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			// new JsConnectionPoint('position', JsConnectionPointType.VEC3),
			// new JsConnectionPoint('normal', JsConnectionPointType.VEC3),
			// new JsConnectionPoint('color', JsConnectionPointType.VEC3),
			// new JsConnectionPoint('alpha', JsConnectionPointType.FLOAT),
			// new JsConnectionPoint('uv', JsConnectionPointType.VEC2),
		];
	}
	add_output_inputs(output_child: OutputJsNode) {
		output_child.io.inputs.setNamedInputConnectionPoints(BaseJsShaderAssembler.output_input_connection_points());
	}
	static create_globals_node_output_connections() {
		// TODO: move this in material only, to use the enum GlobalsOutput
		return [
			// new JsConnectionPoint('position', JsConnectionPointType.VEC3),
			// new JsConnectionPoint('normal', JsConnectionPointType.VEC3),
			// new JsConnectionPoint('color', JsConnectionPointType.VEC3),
			// new JsConnectionPoint('uv', JsConnectionPointType.VEC2),
			// new JsConnectionPoint(GlobalsOutput.MV_POSITION, JsConnectionPointType.VEC4),
			// // Maybe I should not add worldPosition, worldNormal, I just now
			// // as those could add computation overhead when always present in the shader.
			// // But hopefully in the soon future, they will only be added when the code builder
			// // adds lines based on connections, as opposed to the whole node
			// new JsConnectionPoint('worldPosition', JsConnectionPointType.VEC4), // vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			// new JsConnectionPoint('worldNormal', JsConnectionPointType.VEC3), // vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
			// // new GlConnectionPoint('I', GlConnectionPointType.VEC3), // vec3 I = worldPosition.xyz - cameraPosition;
			// new JsConnectionPoint(GlobalsOutput.GL_POSITION, JsConnectionPointType.VEC4),
			// new JsConnectionPoint(GlobalsOutput.GL_FRAGCOORD, JsConnectionPointType.VEC4),
			// new JsConnectionPoint('cameraPosition', JsConnectionPointType.VEC3),
			// new JsConnectionPoint(GlobalsOutput.RESOLUTION, JsConnectionPointType.VEC2),
			// new JsConnectionPoint(GlobalsOutput.TIME, JsConnectionPointType.FLOAT),
		];
	}
	create_globals_node_output_connections() {
		return BaseJsShaderAssembler.create_globals_node_output_connections();
	}
	add_globals_outputs(globals_node: GlobalsJsNode) {
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
	resetConfigs() {
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
			// new ShaderConfig(ShaderName.VERTEX, ['position', 'normal', 'uv', VaryingWriteGlNode.INPUT_NAME], []),
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
			new VariableConfig('d', {
				// default_from_attribute: true,
				// default: this.globalsHandler().variable_config_default('position'),
				// required_definitions: this.globalsHandler().variable_config_required_definitions('position'),
				prefix: 'return ',
			}),
			// new VariableConfig('normal', {
			// 	default_from_attribute: true,
			// 	prefix: 'vec3 objectNormal = ',
			// 	postLines: ['#ifdef USE_TANGENT', '	vec3 objectTangent = vec3( tangent.xyz );', '#endif'],
			// }),
			// new VariableConfig('color', {
			// 	prefix: 'diffuseColor.xyz = ',
			// }),
			// new VariableConfig('alpha', {
			// 	prefix: 'diffuseColor.a = ',
			// }),
			// new VariableConfig('uv', {
			// 	// default_from_attribute: true,
			// 	prefix: 'vUv = ',
			// 	// if: GlobalsGeometryHandler.IF_RULE.uv,
			// }),
		];
	}
	create_variable_configs(): VariableConfig[] {
		return BaseJsShaderAssembler.create_variable_configs();
	}
	protected _reset_variable_configs() {
		this._variable_configs = undefined;
		this.variable_configs();
	}
	inputNamesForShaderName(rootNode: BaseJsNodeType, _: ShaderName) {
		return rootNode.io.inputs.namedInputConnectionPoints().map((c) => c.name()); //this.shader_config(shader_name)?.input_names() || [];
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
	protected insertMemberAfter(shaderName: ShaderName): string | undefined {
		return INSERT_MEMBER_AFTER_MAP.get(shaderName);
	}
	protected insertDefineAfter(shaderName: ShaderName): string | undefined {
		return INSERT_DEFINE_AFTER_MAP.get(shaderName);
	}
	protected insertConstructorAfter(shaderName: ShaderName): string | undefined {
		return INSERT_CONSTRUCTOR_AFTER_MAP.get(shaderName);
	}
	protected insertBodyAfter(shaderName: ShaderName): string | undefined {
		return INSERT_BODY_AFTER_MAP.get(shaderName);
	}
	// protected insertTriggerAfter(shaderName: ShaderName): string | undefined {
	// 	return INSERT_TRIGGER_AFTER_MAP.get(shaderName);
	// }
	// protected insertTriggerableAfter(shaderName: ShaderName): string | undefined {
	// 	return INSERT_TRIGGERABLE_AFTER_MAP.get(shaderName);
	// }
	protected linesToRemove(shaderName: ShaderName): string[] | undefined {
		return LINES_TO_REMOVE_MAP.get(shaderName);
	}

	//
	//
	// TEMPLATE CODE REPLACEMENT
	//
	//

	private _replaceTemplate(template: string, shaderName: ShaderName) {
		const memberLines = this.builder_lines(shaderName, LineType.MEMBER);
		const constructorLines = this.builder_lines(shaderName, LineType.CONSTRUCTOR);
		// const triggerLines = this.builder_lines(shaderName, LineType.TRIGGER);
		// const triggerableLines = this.builder_lines(shaderName, LineType.TRIGGERABLE);
		const defineLines = this.builder_lines(shaderName, LineType.DEFINE);
		// const define = this.builder_lines(shaderName, LineType.DEFINE);
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

		const lineBeforeMember = this.insertMemberAfter(shaderName);
		const lineBeforeDefine = this.insertDefineAfter(shaderName);
		const lineBeforeConstructor = this.insertConstructorAfter(shaderName);
		const lineBeforeBody = this.insertBodyAfter(shaderName);
		// const lineBeforeTrigger = this.insertTriggerAfter(shaderName);
		// const lineBeforeTriggerable = this.insertTriggerableAfter(shaderName);
		const linesToRemove = this.linesToRemove(shaderName);
		let lineBeforeMemberFound = false;
		let lineBeforeDefineFound = false;
		let lineBeforeConstructorFound = false;
		// let lineBeforeTriggerFound = false;
		// let lineBeforeTriggerableFound = false;
		let lineBeforeBodyFoundOnPreviousLine = false;
		let lineBeforeBodyFound = false;

		for (let templateLine of templateLines) {
			if (lineBeforeMemberFound == true) {
				if (memberLines) {
					this._insertLines(newLines, memberLines);
				}
				lineBeforeMemberFound = false;
			}
			if (lineBeforeDefineFound == true) {
				if (defineLines) {
					this._insertLines(newLines, defineLines);
				}
				lineBeforeDefineFound = false;
			}
			if (lineBeforeConstructorFound == true) {
				if (constructorLines) {
					this._insertLines(newLines, constructorLines);
				}
				lineBeforeConstructorFound = false;
			}
			// if (lineBeforeTriggerFound == true) {
			// 	if (triggerLines) {
			// 		this._insertLines(newLines, triggerLines);
			// 	}
			// 	lineBeforeTriggerFound = false;
			// }
			// if (lineBeforeTriggerableFound == true) {
			// 	if (triggerableLines) {
			// 		this._insertLines(newLines, triggerableLines);
			// 	}
			// 	lineBeforeTriggerableFound = false;
			// }
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
			if (lineBeforeConstructor && templateLine.indexOf(lineBeforeConstructor) >= 0) {
				lineBeforeConstructorFound = true;
			}
			// if (lineBeforeTrigger && templateLine.indexOf(lineBeforeTrigger) >= 0) {
			// 	lineBeforeTriggerFound = true;
			// }
			// if (lineBeforeTriggerable && templateLine.indexOf(lineBeforeTriggerable) >= 0) {
			// 	lineBeforeTriggerableFound = true;
			// }
			if (lineBeforeMember && templateLine.indexOf(lineBeforeMember) >= 0) {
				lineBeforeMemberFound = true;
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

	//
	//
	// REGISTERED VARIABLES
	//
	//
	private _registeredVariables: Map<string, RegisterableVariable> = new Map();
	private _registeredVariablesCountByNode: Map<BaseJsNodeType, number> = new Map();
	addVariable(node: BaseJsNodeType, variable: RegisterableVariable, varName?: string): string {
		// const nodeSanitizedPath = CoreString.sanitizeName(node.path());
		// const varFullName = `${nodeSanitizedPath}_${varName}`;
		const count = this._registeredVariablesCountByNode.get(node) || 0;
		this._registeredVariablesCountByNode.set(node, count + 1);
		const varFullName = varName ? varName : 'VAR_' + TypedJsNode.inputVarName(node, count == 0 ? '' : `_${count}`);
		this._registeredVariables.set(varFullName, variable);
		return varFullName;
	}
	traverseRegisteredVariables(callback: (variable: RegisterableVariable, varName: string) => void) {
		this._registeredVariables.forEach(callback);
	}
	protected _resetRegisteredVariables() {
		this._registeredVariables.clear();
		this._registeredVariablesCountByNode.clear();
	}
	//
	//
	// REGISTERED FUNCTIONS
	//
	//
	private _registeredFunctions: Map<string, BaseNamedFunction> = new Map();
	addFunction(node: BaseJsNodeType, namedFunction: BaseNamedFunction) {
		const existingFunctionName = this._registeredFunctions.get(namedFunction.type());
		if (existingFunctionName) {
			return;
		}

		this._registeredFunctions.set(namedFunction.type(), namedFunction);

		// let i=0
		// for(let _func of functions){
		// 	const functionName= this._nameByFunctions.get(_func)
		// 	if(!functionName){

		// 	}
		// }

		// const functionDefinitions = functions.map((f,i)=>{
		// 	const functionName=`${node.name()})_${i}`
		// 	return new FunctionJsDefinition(node, functionName, f)
		// })
		// this.addDefinitions(node, functionDefinitions);
	}
	traverseRegisteredFunctions(callback: (variable: BaseNamedFunction) => void) {
		this._registeredFunctions.forEach(callback);
	}
	protected _resetRegisteredFunctions() {
		this._registeredFunctions.clear();
		// this._nameByFunctions.clear();
	}
}
