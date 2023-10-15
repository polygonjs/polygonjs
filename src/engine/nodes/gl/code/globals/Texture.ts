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
import {GlobalsBaseControllerType} from './Common';

// import {DefinitionBaseConfig} from '../Config/DefinitionBaseConfig'
// import {UniformConfig} from '../Config/UniformConfig'
// import {AttributeConfig} from '../Config/AttributeConfig'
// import { Attribute } from '../../Attribute';

export enum GlobalsTextureHandlerPurpose {
	PARTICLES_SHADER = 'particles_shader',
	MATERIAL = 'material',
}
export interface GlobalsTextureHandlerData {
	textureName: string;
	component: string;
	uvName: string;
}

export class GlobalsTextureHandler extends GlobalsBaseController {
	private _textureAllocationsController: TextureAllocationsController | undefined;

	static PARTICLES_SIM_UV_ATTRIB = 'particlesSimUv';
	static UV_VARYING = 'particlesSimUvVarying';
	static PARTICLE_SIM_UV = 'particleUv';

	private _globalsGeometryHandler: GlobalsGeometryHandler | undefined;

	constructor(private _uvName: string, private _purpose: GlobalsTextureHandlerPurpose) {
		super();
	}
	type() {
		return GlobalsBaseControllerType.TEXTURE;
	}

	set_texture_allocations_controller(controller: TextureAllocationsController) {
		this._textureAllocationsController = controller;
	}

	override handleGlobalsNode(
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
			this._globalsGeometryHandler = this._globalsGeometryHandler || new GlobalsGeometryHandler();
			this._globalsGeometryHandler.handleGlobalsNode(globals_node, output_name, shaders_collection_controller);
		}
	}

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

	attribTextureData(attribName: string): GlobalsTextureHandlerData | undefined {
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
					uvName: this._uvName,
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
			this.addParticlesSimUvAttribute(node, shadersCollectionController);

			const textureData = this.attribTextureData(attribName);
			if (textureData) {
				const {textureName, component, uvName} = textureData;
				const texture_definition = new UniformGLDefinition(node, GlConnectionPointType.SAMPLER_2D, textureName);
				// definitions_by_shader_name[shader_name].push(texture_definition)

				shadersCollectionController.addDefinitions(node, [texture_definition]);

				const body_line = `texture2D( ${textureName}, ${uvName} ).${component}`;
				return body_line;
			}
		} else {
			return GlobalsGeometryHandler.readAttribute(node, gl_type, attribName, shadersCollectionController);
		}
	}

	addParticlesSimUvAttribute(node: BaseGlNodeType, shaders_collection_controller: ShadersCollectionController) {
		// const shader_names = ['vertex', 'fragment'];
		// const definitions_by_shader_name:Map<ShaderName, BaseGLDefinition[]> = new Map();
		// definitions_by_shader_name.set(ShaderName.VERTEX, [])
		// definitions_by_shader_name.set(ShaderName.FRAGMENT, [])
		// for (let shader_name of shader_names) {
		// 	definitions_by_shader_name[shader_name] = [];
		// }

		const particlesSimUvAttribDefinition = new AttributeGLDefinition(
			node,
			GlConnectionPointType.VEC2,
			GlobalsTextureHandler.PARTICLES_SIM_UV_ATTRIB
		);
		const particlesSimUvVaryingDefinition = new VaryingGLDefinition(
			node,
			GlConnectionPointType.VEC2,
			GlobalsTextureHandler.UV_VARYING
		);

		shaders_collection_controller.addDefinitions(
			node,
			[particlesSimUvAttribDefinition, particlesSimUvVaryingDefinition],
			ShaderName.VERTEX
		);
		shaders_collection_controller.addDefinitions(node, [particlesSimUvVaryingDefinition], ShaderName.FRAGMENT);

		shaders_collection_controller.addBodyLines(
			node,
			[`${GlobalsTextureHandler.UV_VARYING} = ${GlobalsTextureHandler.PARTICLES_SIM_UV_ATTRIB}`],
			ShaderName.VERTEX
		);
	}
}
