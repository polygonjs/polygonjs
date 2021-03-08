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
	static USE_SSS: Readonly<boolean> = true;
	isPhysical() {
		return false;
	}

	templateShader() {
		const template = this.isPhysical() ? ShaderLib.physical : ShaderLib.standard;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: template.fragmentShader,
			uniforms: template.uniforms,
		};
	}

	filterFragmentShader(fragmentShader: string) {
		fragmentShader = fragmentShader.replace('#include <metalnessmap_fragment>', metalnessmap_fragment);
		fragmentShader = fragmentShader.replace('#include <roughnessmap_fragment>', roughnessmap_fragment);

		if (ShaderAssemblerStandard.USE_SSS) {
			fragmentShader = fragmentShader.replace(
				/void main\s?\(\) {/,
				`${sss_declaration_fragment}

void main() {`
			);

			fragmentShader = fragmentShader.replace(
				'#include <lights_fragment_begin>',
				`#include <lights_fragment_begin>
${sss_injected_fragment}
`
			);
		}
		return fragmentShader;
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

		const material = new ShaderMaterial(options);

		if (this.isPhysical()) {
			material.defines.PHYSICAL = true;
		}

		this._addCustomMaterials(material);
		return material;
	}

	add_output_inputs(output_child: OutputGlNode) {
		// BaseGlShaderAssembler.add_output_inputs(output_child);
		const list = BaseGlShaderAssembler.output_input_connection_points();
		list.push(new GlConnectionPoint('metalness', GlConnectionPointType.FLOAT, 1));
		list.push(new GlConnectionPoint('roughness', GlConnectionPointType.FLOAT, 1));
		if (ShaderAssemblerStandard.USE_SSS) {
			list.push(new GlConnectionPoint('SSSModel', GlConnectionPointType.SSS_MODEL, sss_default));
		}
		output_child.io.inputs.setNamedInputConnectionPoints(list);
	}

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
