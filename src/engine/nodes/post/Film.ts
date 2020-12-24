/**
 * Adds a film effect
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {FilmPass} from '../../../modules/three/examples/jsm/postprocessing/FilmPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface FilmPassWithUniforms extends FilmPass {
	uniforms: {
		time: IUniformN;
		nIntensity: IUniformN;
		sIntensity: IUniformN;
		sCount: IUniformN;
		grayscale: IUniformN;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class FilmPostParamsConfig extends NodeParamsConfig {
	/** @param noise intensity */
	noise_intensity = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		range_locked: [false, false],
		...PostParamOptions,
	});
	/** @param scanlines intensity */
	scanlines_intensity = ParamConfig.FLOAT(0.05, {
		range: [0, 1],
		range_locked: [true, false],
		...PostParamOptions,
	});
	/** @param scanlines count */
	scanlines_count = ParamConfig.FLOAT(4096, {
		range: [0, 4096],
		range_locked: [true, false],
		...PostParamOptions,
	});
	/** @param toggle on to be grayscale */
	grayscale = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
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
		pass.uniforms.grayscale.value = this.pv.grayscale ? 1 : 0;
	}
}
