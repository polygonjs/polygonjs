import {BasePersistedConfig} from '../../../../utils/PersistedConfig';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {BuilderCopNode} from '../../../../cop/Builder';
import {GlParamConfig} from '../../utils/ParamConfig';
import {IUniformsWithTime} from '../../../../../scene/utils/UniformsController';

type IUniforms = Dictionary<IUniform>;

export interface PersistedConfigBaseTextureData {
	fragment_shader: string;
	uniforms: IUniforms;
	param_uniform_pairs: [string, string][];
	uniforms_time_dependent?: boolean;
	uniforms_resolution_dependent?: boolean;
}

export class TexturePersistedConfig extends BasePersistedConfig {
	constructor(protected node: BuilderCopNode) {
		super(node);
	}
	to_json(): PersistedConfigBaseTextureData | undefined {
		if (!this.node.assembler_controller) {
			return;
		}

		// params updating uniforms
		const param_uniform_pairs: [string, string][] = [];
		const param_configs = this.node.assembler_controller.assembler.param_configs();
		for (let param_config of param_configs) {
			param_uniform_pairs.push([param_config.name, param_config.uniform_name]);
		}

		const data = {
			fragment_shader: this.node.texture_material.fragmentShader,
			uniforms: this.node.texture_material.uniforms,
			param_uniform_pairs: param_uniform_pairs,
			uniforms_time_dependent: this.node.assembler_controller.assembler.uniforms_time_dependent(),
			uniforms_resolution_dependent: this.node.assembler_controller.assembler.resolution_dependent(),
		};

		return data;
	}
	load(data: PersistedConfigBaseTextureData) {
		this.node.texture_material.fragmentShader = data.fragment_shader;
		this.node.texture_material.uniforms = data.uniforms;

		BuilderCopNode.handle_dependencies(
			this.node,
			data.uniforms_time_dependent || false,
			data.uniforms as IUniformsWithTime
		);

		for (let pair of data.param_uniform_pairs) {
			const param = this.node.params.get(pair[0]);
			const uniform = data.uniforms[pair[1]];
			if (param && uniform) {
				param.options.set({
					callback: () => {
						GlParamConfig.callback(param, uniform);
					},
				});
			}
		}
	}
}
