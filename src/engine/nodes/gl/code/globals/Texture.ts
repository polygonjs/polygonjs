import {GlobalsBaseController} from './_Base';
import {GlobalsGlNode} from '../../Globals';
import {BaseGlNodeType} from '../../_Base';
// import {Definition} from '../../Definition/_Module'
// import { VariableConfig } from '../Config/VariableConfig';
import {TextureAllocationsController} from '../utils/TextureAllocationsController';
import {GlobalsGeometryHandler} from './Geometry';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {UniformGLDefinition, AttributeGLDefinition, VaryingGLDefinition} from '../../utils/GLDefinition';
import {GlConnectionPointType} from '../../../utils/io/connections/Gl';
import {ShadersCollectionController} from '../utils/ShadersCollectionController';
import {TextureVariable} from '../utils/TextureVariable';
import {TypeAssert} from '../../../../poly/Assert';

// import {DefinitionBaseConfig} from '../Config/DefinitionBaseConfig'
// import {UniformConfig} from '../Config/UniformConfig'
// import {AttributeConfig} from '../Config/AttributeConfig'
// import { Attribute } from '../../Attribute';

export enum GlobalsTextureHandlerPurpose {
	PARTICLES_SHADER = 'particles_shader',
	MATERIAL = 'material',
}

export class GlobalsTextureHandler extends GlobalsBaseController {
	private _textureAllocationsController: TextureAllocationsController | undefined;

	static UV_ATTRIB = 'particles_sim_uv_attrib';
	static UV_VARYING = 'particles_sim_uv_varying';
	static PARTICLE_SIM_UV = 'particleUV';

	private globals_geometry_handler: GlobalsGeometryHandler | undefined;

	constructor(private _uv_name: string, private _purpose: GlobalsTextureHandlerPurpose) {
		super();
	}

	set_texture_allocations_controller(controller: TextureAllocationsController) {
		this._textureAllocationsController = controller;
	}

	override handle_globals_node(
		globals_node: GlobalsGlNode,
		output_name: string,
		shaders_collection_controller: ShadersCollectionController
		// definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]>,
		// body_lines_by_shader_name: Map<ShaderName, string[]>,
		// body_lines: string[],
		// dependencies: ShaderName[],
		// shader_name: ShaderName
	) {
		if (!this._textureAllocationsController) {
			return;
		}

		const connection_point = globals_node.io.outputs.namedOutputConnectionPointsByName(output_name);
		const var_name = globals_node.glVarName(output_name);

		const variable = this._textureAllocationsController.variable(output_name);

		if (variable && connection_point) {
			const gl_type = connection_point.type();
			const new_value = this.readAttribute(globals_node, gl_type, output_name, shaders_collection_controller);
			const body_line = `${gl_type} ${var_name} = ${new_value}`;
			shaders_collection_controller.addBodyLines(globals_node, [body_line]);
		} else {
			this.globals_geometry_handler = this.globals_geometry_handler || new GlobalsGeometryHandler();
			this.globals_geometry_handler.handle_globals_node(
				globals_node,
				output_name,
				shaders_collection_controller
				// definitions_by_shader_name,
				// body_lines_by_shader_name,
				// body_lines,
				// dependencies,
				// shader_name
			);
		}

		// definitions
		// const gl_type = named_output.gl_type()
		// const definition = new Definition.Varying(globals_node, gl_type, var_name)
		// definitions_by_shader_name[shader_name].push(definition)

		// const new_value = this.read_attribute(globals_node, gl_type, output_name)
		// const body_line = `${var_name} = ${new_value}`
		// if(allocation){
		// 	const var_name_texture = allocation.texture_name()
		// 	// add another definition if a texture was allocated by ParticlesSystemGPU
		// 	const texture_definition = new Definition.Uniform(globals_node, 'sampler2D', var_name_texture)
		// 	definitions_by_shader_name[shader_name].push(texture_definition)

		// 	// const particles_sim_uv_definition = new Definition.Attribute(globals_node, 'vec2', GlobalsTextureHandler.UV_ATTRIB)
		// 	// definitions_by_shader_name['vertex'].push(particles_sim_uv_definition)
		// 	// this.add_particles_sim_uv_attribute(globals_node)

		// 	const new_value = this.read_attribute(globals_node, gl_type, output_name, shader_name)
		// 	body_line = `${var_name} = ${new_value}`

		// } else {
		// 	body_line = `${var_name} = vec3(${output_name})`
		// }

		// const new_body_lines = [
		// 	// `${var_name} = vec3(${output_name})`,
		// 	`vec3 ${var_name} = texture2D( ${var_name_texture}, uv ).xyz;`
		// ]
		// const body_line = `vec3 ${var_name} = texture2D( ${var_name_texture}, uv ).xyz`

		// for(let dependency of dependencies){
		// 	definitions_by_shader_name[dependency].push(definition)
		// 	body_lines_by_shader_name[dependency].push(body_line)
		// }
		// if(dependencies.length == 0){
		// 	body_lines.push(body_line)
		// }
	}
	// variable_config_default(variable_name: string): string {
	// 	// const allocation = this._texture_allocations_controller.allocation_for_variable(variable_name)
	// 	// if(allocation){
	// 	// 	return `texture2D( texture_${allocation.name()}, ${GlobalsTextureHandler.UV_VARYING} ).xyz`
	// 	// } else {
	// 	// 	GlobalsGeometryHandler.variable_config_default(variable_name)
	// 	// }
	// 	throw 'do I go through here?';
	// 	return this.read_attribute(variable_name);
	// }
	// variable_config_required_definitions(variable_name:string):DefinitionBaseConfig[]{
	// 	const allocation = this._texture_allocations_controller.allocation_for_variable(variable_name)
	// 	if(allocation){
	// 		return [
	// 			new AttributeConfig('vec2', GlobalsTextureHandler.UV_ATTRIB),
	// 			new UniformConfig('sampler2D', `texture_${allocation.name()}`)
	// 		]
	// 	}
	// }

	// static remap_instance_attribute(name:string):string{
	// 	if(name == 'instancePosition'){
	// 		return 'position'
	// 	}
	// 	return name
	// }
	// static variable_name_to_instance_attrib(name:string):string{
	// 	if(name == 'position'){
	// 		return 'instancePosition'
	// 	}
	// 	return name
	// }

	private _textureVariableUsable(textureVariable: TextureVariable) {
		switch (this._purpose) {
			case GlobalsTextureHandlerPurpose.PARTICLES_SHADER: {
				return true;
			}
			case GlobalsTextureHandlerPurpose.MATERIAL: {
				return !textureVariable.readonly();
			}
		}
		TypeAssert.unreachable(this._purpose);
	}

	attribTextureData(attribName: string) {
		if (!this._textureAllocationsController) {
			console.warn('no texture allocation controller');
			return;
		}
		const textureVariable = this._textureAllocationsController.variable(attribName);
		if (textureVariable && this._textureVariableUsable(textureVariable)) {
			const allocation = textureVariable.allocation();
			if (allocation) {
				const component = textureVariable.component();
				const attribTextureName = allocation.textureName();
				return {
					textureName: attribTextureName,
					component: component,
					uvName: this._uv_name,
				};
			}
		}
	}

	readAttribute(
		node: BaseGlNodeType,
		gl_type: GlConnectionPointType,
		attribName: string,
		shadersCollectionController: ShadersCollectionController
	) {
		if (!this._textureAllocationsController) {
			console.warn('no texture allocation controller');
			return;
		}
		// attrib_name = GlobalsTextureHandler.remap_instance_attribute(attrib_name)

		const textureVariable = this._textureAllocationsController.variable(attribName);
		if (textureVariable && this._textureVariableUsable(textureVariable)) {
			this.add_particles_sim_uv_attribute(node, shadersCollectionController);
			// const texture_variable = allocation.variable(attrib_name)
			// if(!texture_variable){
			// 	console.error(`no tex var found for ${attrib_name}`)
			// 	this._texture_allocations_controller.print(node.scene())
			// }

			const textureData = this.attribTextureData(attribName);
			if (textureData) {
				const {textureName, component, uvName} = textureData;
				const texture_definition = new UniformGLDefinition(node, GlConnectionPointType.SAMPLER_2D, textureName);
				// definitions_by_shader_name[shader_name].push(texture_definition)

				shadersCollectionController.addDefinitions(node, [texture_definition]);

				// const particles_sim_uv_definition = new Definition.Attribute(globals_node, 'vec2', 'particles_sim_uv')
				// definitions_by_shader_name['vertex'].push(particles_sim_uv_definition)

				const body_line = `texture2D( ${textureName}, ${uvName} ).${component}`;
				return body_line;
			}
		} else {
			return GlobalsGeometryHandler.readAttribute(node, gl_type, attribName, shadersCollectionController);
		}
	}

	add_particles_sim_uv_attribute(node: BaseGlNodeType, shaders_collection_controller: ShadersCollectionController) {
		// const shader_names = ['vertex', 'fragment'];
		// const definitions_by_shader_name:Map<ShaderName, BaseGLDefinition[]> = new Map();
		// definitions_by_shader_name.set(ShaderName.VERTEX, [])
		// definitions_by_shader_name.set(ShaderName.FRAGMENT, [])
		// for (let shader_name of shader_names) {
		// 	definitions_by_shader_name[shader_name] = [];
		// }

		const particles_sim_uv_attrib_definition = new AttributeGLDefinition(
			node,
			GlConnectionPointType.VEC2,
			GlobalsTextureHandler.UV_ATTRIB
		);
		const particles_sim_uv_varying_definition = new VaryingGLDefinition(
			node,
			GlConnectionPointType.VEC2,
			GlobalsTextureHandler.UV_VARYING
		);

		shaders_collection_controller.addDefinitions(
			node,
			[particles_sim_uv_attrib_definition, particles_sim_uv_varying_definition],
			ShaderName.VERTEX
		);
		shaders_collection_controller.addDefinitions(node, [particles_sim_uv_varying_definition], ShaderName.FRAGMENT);

		shaders_collection_controller.addBodyLines(
			node,
			[`${GlobalsTextureHandler.UV_VARYING} = ${GlobalsTextureHandler.UV_ATTRIB}`],
			ShaderName.VERTEX
		);
	}
}
