import {BasePersistedConfig} from '../../../../utils/PersistedConfig';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {BuilderCopNode} from '../../../../cop/Builder';
import {GlParamConfig} from '../../utils/ParamConfig';
import {IUniformsWithTime} from '../../../../../scene/utils/UniformsController';
import {PolyDictionary} from '../../../../../../types/GlobalTypes';

type IUniforms = PolyDictionary<IUniform>;

export interface PersistedConfigBaseTextureData {
	fragment_shader: string;
	uniforms: IUniforms;
	param_uniform_pairs: [string, string][];
	uniforms_time_dependent?: boolean;
	uniforms_resolution_dependent?: boolean;
}

export class TexturePersistedConfig extends BasePersistedConfig {
	constructor(protected override node: BuilderCopNode) {
		super(node);
	}
	override toJSON(): PersistedConfigBaseTextureData | undefined {
		const assemblerController = this.node.assemblerController;
		if (!assemblerController) {
			return;
		}

		// params updating uniforms
		const param_uniform_pairs: [string, string][] = [];
		const param_configs = assemblerController.assembler.param_configs();
		for (let param_config of param_configs) {
			param_uniform_pairs.push([param_config.name(), param_config.uniformName()]);
		}

		const data = {
			fragment_shader: this.node.texture_material.fragmentShader,
			uniforms: this.node.texture_material.uniforms,
			param_uniform_pairs: param_uniform_pairs,
			uniforms_time_dependent: assemblerController.assembler.uniformsTimeDependent(),
			uniforms_resolution_dependent: assemblerController.assembler.uniforms_resolution_dependent(),
		};

		return data;
	}
	override load(data: PersistedConfigBaseTextureData) {
		this.node.texture_material.fragmentShader = data.fragment_shader;
		this.node.texture_material.uniforms = data.uniforms;

		BuilderCopNode.handleDependencies(
			this.node,
			data.uniforms_time_dependent || false,
			data.uniforms as IUniformsWithTime
		);

		for (let pair of data.param_uniform_pairs) {
			const param = this.node.params.get(pair[0]);
			const uniform = data.uniforms[pair[1]];
			if (param && uniform) {
				const callback = () => {
					GlParamConfig.callback(param, uniform);
				};
				param.options.set({
					callback: callback,
				});
				// it's best to execute the callback directly
				// as it may otherwise be prevented if the scene is loading for instance
				// and this is currently necessary for ramp params, when no assembler is loaded
				callback();
				// param.options.executeCallback();
			}
		}
	}
}
