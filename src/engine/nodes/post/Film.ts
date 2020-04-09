import {TypedPostProcessNode, TypedPostNodeContext, PostParamCallback} from './_Base';
import {FilmPass} from '../../../../modules/three/examples/jsm/postprocessing/FilmPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

interface FilmPassWithUniforms extends FilmPass {
	uniforms: {
		time: IUniform;
		nIntensity: IUniform;
		sIntensity: IUniform;
		sCount: IUniform;
		grayscale: IUniform;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class FilmPostParamsConfig extends NodeParamsConfig {
	noise_intensity = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		range_locked: [false, false],
		callback: PostParamCallback,
	});
	scanlines_intensity = ParamConfig.FLOAT(0.05, {
		range: [0, 1],
		range_locked: [true, false],
		callback: PostParamCallback,
	});
	scanlines_count = ParamConfig.FLOAT(4096, {
		range: [0, 4096],
		range_locked: [true, false],
		callback: PostParamCallback,
	});
	grayscale = ParamConfig.BOOLEAN(1, {
		callback: PostParamCallback,
	});
}
const ParamsConfig = new FilmPostParamsConfig();
export class FilmPostNode extends TypedPostProcessNode<FilmPass, FilmPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'film';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new FilmPass(
			this.pv.noise_intensity,
			this.pv.scanlines_intensity,
			this.pv.scanlines_count,
			this.pv.grayscale ? 1 : 0
		) as FilmPassWithUniforms;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: FilmPassWithUniforms) {
		pass.uniforms.nIntensity.value = this.pv.noise_intensity;
		pass.uniforms.sIntensity.value = this.pv.scanlines_intensity;
		pass.uniforms.sCount.value = this.pv.scanlines_count;
		pass.uniforms.grayscale.value = this.pv.scanlines_count;
	}
}
