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

import sss_default from '../../../gl/sss/init.glsl';
import sss_declaration_fragment from '../../../gl/sss/declaration.glsl';
import sss_injected_fragment from '../../../gl/sss/injected.glsl';

export class ShaderAssemblerStandard extends ShaderAssemblerMesh {
	static USE_SSS = true;
	isPhysical() {
		return false;
	}

	templateShader() {
		const template = this.isPhysical() ? ShaderLib.physical : ShaderLib.standard;
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		};
	}

	createMaterial() {
		const template_shader = this.templateShader();

		const options = {
			lights: true,
			extensions: {
				derivatives: true,
			},

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		};
		// if(this.constructor.isPhysical()){
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

			if (ShaderAssemblerStandard.USE_SSS) {
				//
				// add SSS
				//
				shader.fragmentShader = shader.fragmentShader.replace(
					'void main() {',
					`${sss_declaration_fragment}

void main(){`
				);

				shader.fragmentShader = shader.fragmentShader.replace(
					'#include <lights_fragment_begin>',
					`#include <lights_fragment_begin>
${sss_injected_fragment}
`
				);
			}
		};
		this._addCustomMaterials(material);
		return material;
	}

	// static convert_material_to_gltf_supported(material: ShaderMaterial): Material {
	// 	const gltf_constructor = this.isPhysical() ? MeshPhysicalMaterial : MeshStandardMaterial;
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
		if (ShaderAssemblerStandard.USE_SSS) {
			list.push(new GlConnectionPoint('SSSModel', GlConnectionPointType.SSS_MODEL, sss_default));
		}
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
			new ShaderConfig(
				ShaderName.FRAGMENT,
				['color', 'alpha', 'metalness', 'roughness', 'SSSModel'],
				[ShaderName.VERTEX]
			),
		];
	}
	create_variable_configs() {
		const list = BaseGlShaderAssembler.create_variable_configs();
		list.push(
			new VariableConfig('metalness', {
				default: '1.0',
				prefix: 'float POLY_metalness = ',
			})
		);
		list.push(
			new VariableConfig('roughness', {
				default: '1.0',
				prefix: 'float POLY_roughness = ',
			})
		);
		if (ShaderAssemblerStandard.USE_SSS) {
			list.push(
				new VariableConfig('SSSModel', {
					default: sss_default,
					prefix: 'SSSModel POLY_SSSModel = ',
				})
			);
		}
		return list;
	}
}
