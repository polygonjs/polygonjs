import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';

import {ShaderAssemblerMesh} from './_BaseMesh';
import {BaseGlShaderAssembler} from '../_Base';
import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';

import metalnessmap_fragment from '../../../gl/ShaderLib/ShaderChunk/metalnessmap_fragment.glsl';
import roughnessmap_fragment from '../../../gl/ShaderLib/ShaderChunk/roughnessmap_fragment.glsl';
import {OutputGlNode} from '../../../Output';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {GlConnectionPoint, GlConnectionPointType} from '../../../../utils/io/connections/Gl';

export class ShaderAssemblerStandard extends ShaderAssemblerMesh {
	is_physical() {
		return false;
	}

	get _template_shader() {
		const template = this.is_physical() ? ShaderLib.physical : ShaderLib.standard;
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		};
	}

	createMaterial() {
		const template_shader = this._template_shader;

		const options = {
			lights: true,
			extensions: {
				derivatives: true,
			},

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		};
		// if(this.constructor.is_physical()){
		// 	options['defines'] = {
		// 		PHYSICAL: 1
		// 	}
		// }

		const material = new ShaderMaterial(options);

		// replace some shader chunks
		material.onBeforeCompile = function (shader) {
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <metalnessmap_fragment>',
				metalnessmap_fragment
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <roughnessmap_fragment>',
				roughnessmap_fragment
			);
		};
		this._add_custom_materials(material);
		return material;
	}

	// static convert_material_to_gltf_supported(material: ShaderMaterial): Material {
	// 	const gltf_constructor = this.is_physical() ? MeshPhysicalMaterial : MeshStandardMaterial;
	// 	const options = {};
	// 	this._match_uniform('color', options, material, 'diffuse');
	// 	this._match_uniform('map', options, material);
	// 	this._match_uniform('envMap', options, material);
	// 	this._match_uniform('envMapIntensity', options, material);
	// 	this._match_uniform('metalness', options, material);
	// 	this._match_uniform('roughness', options, material);
	// 	const gltf_material = new gltf_constructor(options);
	// 	return gltf_material;
	// }

	add_output_inputs(output_child: OutputGlNode) {
		// BaseGlShaderAssembler.add_output_inputs(output_child);
		const list = BaseGlShaderAssembler.output_input_connection_points();
		list.push(new GlConnectionPoint('metalness', GlConnectionPointType.FLOAT, 1));
		list.push(new GlConnectionPoint('roughness', GlConnectionPointType.FLOAT, 1));
		output_child.io.inputs.setNamedInputConnectionPoints(list);
		// those defaults should be 1. If they were 0, using the params
		// at the material level would appear not to work
		// output_child.add_param(ParamType.FLOAT, 'metalness', 1);
		// output_child.add_param(ParamType.FLOAT, 'roughness', 1);
	}
	// create_globals_node_output_connections(){
	// 	return BaseShaderAssembler.create_globals_node_output_connections().concat([
	// 		new Connection.Float('metalness'),
	// 		new Connection.Float('roughness'),
	// 	])
	// }
	create_shader_configs() {
		return [
			new ShaderConfig(ShaderName.VERTEX, ['position', 'normal', 'uv'], []),
			new ShaderConfig(ShaderName.FRAGMENT, ['color', 'alpha', 'metalness', 'roughness'], [ShaderName.VERTEX]),
		];
	}
	create_variable_configs() {
		return BaseGlShaderAssembler.create_variable_configs().concat([
			new VariableConfig('metalness', {
				default: '1.0',
				prefix: 'float POLY_metalness = ',
			}),
			new VariableConfig('roughness', {
				default: '1.0',
				prefix: 'float POLY_roughness = ',
			}),
		]);
	}
}
