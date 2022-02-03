import {BaseGlShaderAssembler} from '../_Base';

import {ThreeToGl} from '../../../../../../core/ThreeToGl';
import {OutputGlNode} from '../../../Output';
import {AttributeGlNode} from '../../../Attribute';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {GlobalsGlNode} from '../../../Globals';
import {BaseGLDefinition, UniformGLDefinition, VaryingGLDefinition} from '../../../utils/GLDefinition';
import {GlConnectionPointType} from '../../../../utils/io/connections/Gl';
import {MapUtils} from '../../../../../../core/MapUtils';
import {MaterialWithCustomMaterials} from '../../../../../../core/geometry/Material';
import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
import {Material} from 'three/src/materials/Material';
import {GlNodeFinder} from '../../utils/NodeFinder';
import {BaseGlNodeType} from '../../../_Base';
import {assignOnBeforeCompileDataAndFunction, OnBeforeCompileData} from './OnBeforeCompile';
import {PolyDictionary} from '../../../../../../types/GlobalTypes';
import {IUniformTexture} from '../../../../utils/code/gl/Uniforms';

export enum CustomMaterialName {
	DISTANCE = 'customDistanceMaterial', // for point lights
	DEPTH = 'customDepthMaterial', // for spot lights and directional
	DEPTH_DOF = 'customDepthDOFMaterial', // for post/bokeh only (see in scene.)
}
// export type ShaderAssemblerRenderDerivated = {new (node: BaseNodeType): ShaderAssemblerRender};
// type ShaderAssemblerRenderDerivatedClass = new (...args: any[]) => ShaderAssemblerRender;
export type CustomAssemblerMap = Map<CustomMaterialName, typeof ShaderAssemblerMaterial>;

export enum GlobalsOutput {
	TIME = 'time',
	RESOLUTION = 'resolution',
	MV_POSITION = 'mvPosition',
	GL_POSITION = 'gl_Position',
	GL_FRAGCOORD = 'gl_FragCoord',
	GL_POINTCOORD = 'gl_PointCoord',
}
const FRAGMENT_GLOBALS_OUTPUT = [
	/*GlobalsOutput.GL_POSITION,*/ GlobalsOutput.GL_FRAGCOORD,
	GlobalsOutput.GL_POINTCOORD,
];
const COMPILE_CUSTOM_MATERIALS = true;

interface HandleGlobalsOutputOptions {
	globals_node: GlobalsGlNode;
	shaders_collection_controller: ShadersCollectionController;
	output_name: string;
	globals_shader_name: ShaderName;
	definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]>;
	body_lines: string[];
	var_name: string;
	shader_name: ShaderName;
	dependencies: ShaderName[];
	body_lines_by_shader_name: Map<ShaderName, string[]>;
}

type FragmentShaderFilterCallback = (s: string) => string;
type CustomAssemblerCallback = (a: ShaderAssemblerMaterial, assemblerName: CustomMaterialName) => void;

export class ShaderAssemblerMaterial extends BaseGlShaderAssembler {
	private _assemblersByCustomName: Map<CustomMaterialName, ShaderAssemblerMaterial> = new Map();

	createMaterial(): Material {
		return new Material();
	}

	customAssemblerClassByCustomName(): CustomAssemblerMap | undefined {
		return undefined;
	}
	traverseCustomAssemblers(callback: CustomAssemblerCallback) {
		this._assemblersByCustomName.forEach(callback);
	}

	protected _addCustomMaterials(material: Material) {
		const map = this.customAssemblerClassByCustomName();
		if (map) {
			map.forEach((assembler_class: typeof ShaderAssemblerMaterial, custom_name: CustomMaterialName) => {
				this._addCustomMaterial(material as MaterialWithCustomMaterials, custom_name, assembler_class);
			});
		}
	}
	private _addCustomMaterial(
		material: MaterialWithCustomMaterials,
		custom_name: CustomMaterialName,
		assembler_class: typeof ShaderAssemblerMaterial
	) {
		let customAssembler: ShaderAssemblerMaterial | undefined = this._assemblersByCustomName.get(custom_name);
		if (!customAssembler) {
			customAssembler = new assembler_class(this.currentGlParentNode());
			this._assemblersByCustomName.set(custom_name, customAssembler);
		}
		material.customMaterials = material.customMaterials || {};
		const mat = customAssembler.createMaterial();
		mat.name = custom_name;
		material.customMaterials[custom_name] = mat;
	}

	compileCustomMaterials(material: MaterialWithCustomMaterials) {
		const class_by_custom_name = this.customAssemblerClassByCustomName();
		if (class_by_custom_name) {
			class_by_custom_name.forEach(
				(assembler_class: typeof ShaderAssemblerMaterial, custom_name: CustomMaterialName) => {
					if (this._code_builder) {
						let assembler: ShaderAssemblerMaterial | undefined =
							this._assemblersByCustomName.get(custom_name);
						if (!assembler) {
							assembler = new assembler_class(this.currentGlParentNode());
							this._assemblersByCustomName.set(custom_name, assembler);
						}

						assembler._setAdditionalTextureUniforms(this._additionalTextureUniforms);
						assembler.set_root_nodes(this._root_nodes);
						assembler.set_param_configs_owner(this._code_builder);
						assembler.set_shader_configs(this.shaderConfigs());
						assembler.set_variable_configs(this.variable_configs());

						const custom_material = material.customMaterials[custom_name];
						if (custom_material) {
							// the custom material will use the fragment filtering from the parent assembler
							assembler.setFilterFragmentShaderMethodOwner(this);
							assembler.compileMaterial(custom_material);
							assembler.setFilterFragmentShaderMethodOwner(undefined);
						}
						// if (material) {
						// 	// add needsUpdate = true, as we always get the same material
						// 	// material.needsUpdate = true;
						// 	custom_materials_by_name.set(custom_name, material);
						// }
					}
				}
			);
		}

		// for (let custom_name of Object.keys(class_by_custom_name)) {
		// 	const assembler_class = class_by_custom_name[custom_name];
		// 	// const assembler = new assembler_class(this.currentGlParentNode())

		// }

		// return custom_materials_by_name;
	}

	private _filterFragmentShaderCallbacks: Map<string, FragmentShaderFilterCallback> = new Map();
	protected _resetFilterFragmentShaderCallbacks() {
		this._filterFragmentShaderCallbacks.clear();
	}
	override _addFilterFragmentShaderCallback(callbackName: string, callback: (s: string) => string) {
		this._filterFragmentShaderCallbacks.set(callbackName, callback);
	}
	override _removeFilterFragmentShaderCallback(callbackName: string) {
		this._filterFragmentShaderCallbacks.delete(callbackName);
	}
	private _filterFragmentShaderMethodOwner: ShaderAssemblerMaterial | undefined;
	setFilterFragmentShaderMethodOwner(owner: ShaderAssemblerMaterial | undefined) {
		this._filterFragmentShaderMethodOwner = owner;
	}
	filterFragmentShader(fragmentShader: string) {
		this._filterFragmentShaderCallbacks.forEach((callback, callbackName) => {
			fragmentShader = callback(fragmentShader);
		});
		return fragmentShader;
	}
	processFilterFragmentShader(fragmentShader: string) {
		if (this._filterFragmentShaderMethodOwner) {
			return this._filterFragmentShaderMethodOwner.filterFragmentShader(fragmentShader);
		} else {
			return this.filterFragmentShader(fragmentShader);
		}
	}
	private _onBeforeCompileData: OnBeforeCompileData | undefined;
	onBeforeCompileData() {
		return this._onBeforeCompileData;
	}
	// private _additionalUniformNames:string[]=[]
	// setAdditionalUniformNames(uniformNames:string[]){
	// 	this._additionalUniformNames = [...uniformNames]
	// }
	private _additionalTextureUniforms: PolyDictionary<IUniformTexture> = {};
	clearAdditionalTextureUniforms() {
		this._additionalTextureUniforms = {};
	}
	addAdditionalTextureUniforms(uniformName: string, uniform: IUniformTexture) {
		this._additionalTextureUniforms[uniformName] = uniform;
	}
	private _setAdditionalTextureUniforms(uniforms: PolyDictionary<IUniformTexture>) {
		this.clearAdditionalTextureUniforms();
		const uniformNames = Object.keys(uniforms);
		for (let uniformName of uniformNames) {
			this._additionalTextureUniforms[uniformName] = uniforms[uniformName];
		}
	}

	compileMaterial(material: Material) {
		// no need to compile if the globals handler has not been declared
		if (!this.compileAllowed()) {
			return;
		}
		const output_nodes: BaseGlNodeType[] = GlNodeFinder.findOutputNodes(this.currentGlParentNode());
		if (output_nodes.length == 0) {
			this.currentGlParentNode().states.error.set('one output node is required');
		}
		if (output_nodes.length > 1) {
			this.currentGlParentNode().states.error.set('only one output node allowed');
		}
		const varying_nodes = GlNodeFinder.findVaryingNodes(this.currentGlParentNode());
		const root_nodes = output_nodes.concat(varying_nodes);
		this.set_root_nodes(root_nodes);
		this._update_shaders();

		const scene = this.currentGlParentNode().scene();
		const vertexShader = this._shaders_by_name.get(ShaderName.VERTEX);
		const fragmentShader = this._shaders_by_name.get(ShaderName.FRAGMENT);
		if (vertexShader && fragmentShader) {
			const processedFragmentShader = this.processFilterFragmentShader(fragmentShader);
			this._onBeforeCompileData = {
				vertexShader,
				fragmentShader: processedFragmentShader,
				paramConfigs: this.param_configs(),
				additionalTextureUniforms: this._additionalTextureUniforms,
				timeDependent: this.uniformsTimeDependent(),
				resolutionDependent: this.uniformsResolutionDependent(),
			};
			assignOnBeforeCompileDataAndFunction(scene, material, this._onBeforeCompileData);
			// material.onBeforeCompile = createOnBeforeCompile(scene, material, this._onBeforeCompileData);
			material.needsUpdate = true;
			// const paramConfigsKey: string = this.param_configs()
			// 	.map((p) => JSON.stringify(p.toJSON()))
			// 	.join(',');
			const key = `${performance.now()}`; //`${vertexShader}:${fragmentShader}`; //:${paramConfigsKey}`;
			material.customProgramCacheKey = () => key;
		}

		// const material = await this._assembler.get_material();
		// if (material) {
		// this._shaders_by_name.set(ShaderName.VERTEX, this._template_shader!.vertexShader!);
		// this._shaders_by_name.set(ShaderName.FRAGMENT, this._template_shader!.fragmentShader!);

		// assign custom materials
		if (COMPILE_CUSTOM_MATERIALS) {
			if ((material as MaterialWithCustomMaterials).customMaterials) {
				this.compileCustomMaterials(material as MaterialWithCustomMaterials);
			}
		}
		// const custom_materials = await this.get_custom_materials();
		// const material_with_custom_materials = material as MaterialWithCustomMaterials;
		// material_with_custom_materials.custom_materials = {};
		// custom_materials.forEach((custom_material, shader_name) => {
		// 	material_with_custom_materials.custom_materials[shader_name] = custom_material;
		// });

		// material.needsUpdate = true;
		// }

		// this.createSpareParameters();
	}
	private _update_shaders() {
		this._shaders_by_name = new Map();
		this._lines = new Map();
		for (let shader_name of this.shaderNames()) {
			const template = this._template_shader_for_shader_name(shader_name);
			if (template) {
				this._lines.set(shader_name, template.split('\n'));
			}
		}
		if (this._root_nodes.length > 0) {
			// this._output_node.set_assembler(this)
			this.build_code_from_nodes(this._root_nodes);

			this._build_lines();
		}
		// this._material.uniforms = this.build_uniforms(template_shader)
		for (let shader_name of this.shaderNames()) {
			const lines = this._lines.get(shader_name);
			if (lines) {
				this._shaders_by_name.set(shader_name, lines.join('\n'));
			}
		}
	}

	shadow_assembler_class_by_custom_name() {
		return {};
	}

	add_output_body_line(
		output_node: OutputGlNode,
		shaders_collection_controller: ShadersCollectionController,
		input_name: string
	) {
		const input = output_node.io.inputs.named_input(input_name);
		const var_input = output_node.variableForInput(input_name);
		const variable_config = this.variable_config(input_name);

		let new_var: string | null = null;
		if (input) {
			new_var = ThreeToGl.vector3(var_input);
		} else {
			if (variable_config.default_from_attribute()) {
				const connection_point = output_node.io.inputs.namedInputConnectionPointsByName(input_name);
				if (connection_point) {
					const gl_type = connection_point.type();
					const attr_read = this.globalsHandler()?.readAttribute(
						output_node,
						gl_type,
						input_name,
						shaders_collection_controller
					);
					if (attr_read) {
						new_var = attr_read;
					}
				}
			} else {
				const variable_config_default = variable_config.default();
				if (variable_config_default) {
					new_var = variable_config_default;
				}
			}
			// const default_value = variable_config.default()
			// new_var = default_value
			// const definition_configs = variable_config.required_definitions() || []
			// for(let definition_config of definition_configs){
			// 	const definition = definition_config.create_definition(output_node)
			// 	output_node.addDefinitions([definition])
			// }
		}
		if (new_var) {
			const prefix = variable_config.prefix();
			const suffix = variable_config.suffix();
			const if_condition = variable_config.if_condition();
			if (if_condition) {
				shaders_collection_controller.addBodyLines(output_node, [`#if ${if_condition}`]);
			}
			shaders_collection_controller.addBodyLines(output_node, [`${prefix}${new_var}${suffix}`]);
			const postLines = variable_config.postLines();
			if (postLines) {
				shaders_collection_controller.addBodyLines(output_node, postLines);
			}
			if (if_condition) {
				shaders_collection_controller.addBodyLines(output_node, [`#endif`]);
			}
		}
	}

	override set_node_lines_output(
		output_node: OutputGlNode,
		shadersCollectionController: ShadersCollectionController
	) {
		// const body_lines = [];
		const shader_name = shadersCollectionController.currentShaderName();
		const input_names = this.shader_config(shader_name)?.input_names();
		if (input_names) {
			// shaders_collection_controller.set_body_lines([], shader_name);
			for (let input_name of input_names) {
				if (output_node.io.inputs.has_named_input(input_name)) {
					this.add_output_body_line(output_node, shadersCollectionController, input_name);
				}
			}
		}
	}
	override setNodeLinesAttribute(
		attribute_node: AttributeGlNode,
		shadersCollectionController: ShadersCollectionController
	) {
		const gl_type = attribute_node.glType();
		const new_var = this.globalsHandler()?.readAttribute(
			attribute_node,
			gl_type,
			attribute_node.attributeName(),
			shadersCollectionController
		);
		const var_name = attribute_node.glVarName(attribute_node.outputName());
		shadersCollectionController.addBodyLines(attribute_node, [`${gl_type} ${var_name} = ${new_var}`]);
	}

	handle_globals_output_name(options: HandleGlobalsOutputOptions) {
		switch (options.output_name) {
			case GlobalsOutput.TIME:
				this.handleTime(options);
				return;
			case GlobalsOutput.RESOLUTION:
				this.handle_resolution(options);
				return;
			case GlobalsOutput.MV_POSITION:
				this.handle_mvPosition(options);
				return;
			case GlobalsOutput.GL_POSITION:
				this.handle_gl_Position(options);
				return;
			case GlobalsOutput.GL_FRAGCOORD:
				this.handle_gl_FragCoord(options);
				return;
			case GlobalsOutput.GL_POINTCOORD:
				this.handle_gl_PointCoord(options);
				return;
			default:
				this.globalsHandler()?.handle_globals_node(
					options.globals_node,
					options.output_name,
					options.shaders_collection_controller
					// definitions_by_shader_name,
					// body_lines_by_shader_name,
					// body_lines,
					// dependencies,
					// shader_name
				);
		}
	}
	handleTime(options: HandleGlobalsOutputOptions) {
		const definition = new UniformGLDefinition(
			options.globals_node,
			GlConnectionPointType.FLOAT,
			options.output_name
		);
		if (options.globals_shader_name) {
			MapUtils.pushOnArrayAtEntry(options.definitions_by_shader_name, options.globals_shader_name, definition);
		}

		const body_line = `float ${options.var_name} = ${options.output_name}`;
		for (let dependency of options.dependencies) {
			MapUtils.pushOnArrayAtEntry(options.definitions_by_shader_name, dependency, definition);
			MapUtils.pushOnArrayAtEntry(options.body_lines_by_shader_name, dependency, body_line);
		}

		options.body_lines.push(body_line);
		this.setUniformsTimeDependent();
	}
	handle_resolution(options: HandleGlobalsOutputOptions) {
		// if (options.shader_name == ShaderName.FRAGMENT) {
		options.body_lines.push(`vec2 ${options.var_name} = resolution`);
		// }
		const definition = new UniformGLDefinition(
			options.globals_node,
			GlConnectionPointType.VEC2,
			options.output_name
		);
		if (options.globals_shader_name) {
			MapUtils.pushOnArrayAtEntry(options.definitions_by_shader_name, options.globals_shader_name, definition);
		}
		for (let dependency of options.dependencies) {
			MapUtils.pushOnArrayAtEntry(options.definitions_by_shader_name, dependency, definition);
		}

		this.setUniformsResolutionDependent();
	}
	handle_mvPosition(options: HandleGlobalsOutputOptions) {
		if (options.shader_name == ShaderName.FRAGMENT) {
			const globals_node = options.globals_node;
			const shaders_collection_controller = options.shaders_collection_controller;
			const definition = new VaryingGLDefinition(globals_node, GlConnectionPointType.VEC4, options.var_name);
			const vertex_body_line = `${options.var_name} = modelViewMatrix * vec4(position, 1.0)`;
			shaders_collection_controller.addDefinitions(globals_node, [definition], ShaderName.VERTEX);
			shaders_collection_controller.addBodyLines(globals_node, [vertex_body_line], ShaderName.VERTEX);
			shaders_collection_controller.addDefinitions(globals_node, [definition]);
		}
	}
	handle_gl_Position(options: HandleGlobalsOutputOptions) {
		if (options.shader_name == ShaderName.FRAGMENT) {
			const globals_node = options.globals_node;
			const shaders_collection_controller = options.shaders_collection_controller;
			const definition = new VaryingGLDefinition(globals_node, GlConnectionPointType.VEC4, options.var_name);
			const vertex_body_line = `${options.var_name} = projectionMatrix * modelViewMatrix * vec4(position, 1.0)`;
			// const fragment_body_line = `vec4 ${options.var_name} = gl_FragCoord`;
			shaders_collection_controller.addDefinitions(globals_node, [definition], ShaderName.VERTEX);
			shaders_collection_controller.addBodyLines(globals_node, [vertex_body_line], ShaderName.VERTEX);
			shaders_collection_controller.addDefinitions(globals_node, [definition]);
			// shaders_collection_controller.addBodyLines(globals_node, [fragment_body_line]);
		}
	}
	handle_gl_FragCoord(options: HandleGlobalsOutputOptions) {
		if (options.shader_name == ShaderName.FRAGMENT) {
			options.body_lines.push(`vec4 ${options.var_name} = gl_FragCoord`);
		}
	}
	handle_gl_PointCoord(options: HandleGlobalsOutputOptions) {
		if (options.shader_name == ShaderName.FRAGMENT) {
			options.body_lines.push(`vec2 ${options.var_name} = gl_PointCoord`);
		} else {
			options.body_lines.push(`vec2 ${options.var_name} = vec2(0.0, 0.0)`);
		}
	}

	override set_node_lines_globals(
		globals_node: GlobalsGlNode,
		shaders_collection_controller: ShadersCollectionController
	) {
		const body_lines: string[] = [];
		const shader_name = shaders_collection_controller.currentShaderName();
		const shader_config = this.shader_config(shader_name);
		if (!shader_config) {
			return;
		}
		const dependencies = shader_config.dependencies();
		const definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]> = new Map();
		const body_lines_by_shader_name: Map<ShaderName, string[]> = new Map();

		const used_output_names = this.used_output_names_for_shader(globals_node, shader_name);

		for (let output_name of used_output_names) {
			const var_name = globals_node.glVarName(output_name);
			const globals_shader_name = shaders_collection_controller.currentShaderName();

			const options: HandleGlobalsOutputOptions = {
				globals_node,
				shaders_collection_controller,
				output_name,
				globals_shader_name,
				definitions_by_shader_name,
				body_lines,
				var_name,
				shader_name,
				dependencies,
				body_lines_by_shader_name,
			};

			this.handle_globals_output_name(options);
		}
		definitions_by_shader_name.forEach((definitions, shader_name) => {
			shaders_collection_controller.addDefinitions(globals_node, definitions, shader_name);
		});
		body_lines_by_shader_name.forEach((body_lines, shader_name) => {
			shaders_collection_controller.addBodyLines(globals_node, body_lines, shader_name);
		});

		shaders_collection_controller.addBodyLines(globals_node, body_lines);
	}

	private used_output_names_for_shader(globals_node: GlobalsGlNode, shader_name: ShaderName) {
		const used_output_names = globals_node.io.outputs.used_output_names();
		const filtered_names: string[] = [];
		for (let name of used_output_names) {
			if (shader_name == ShaderName.VERTEX) {
				if (!FRAGMENT_GLOBALS_OUTPUT.includes(name as GlobalsOutput)) {
					filtered_names.push(name);
				}
			} else {
				filtered_names.push(name);
			}
		}
		return filtered_names;
	}
}
