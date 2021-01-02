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
	noiseIntensity = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
	/** @param scanlines intensity */
	scanlinesIntensity = ParamConfig.FLOAT(0.05, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param scanlines count */
	scanlinesCount = ParamConfig.FLOAT(4096, {
		range: [0, 4096],
		rangeLocked: [true, false],
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
			this.pv.noiseIntensity,
			this.pv.scanlinesIntensity,
			this.pv.scanlinesCount,
			this.pv.grayscale ? 1 : 0
		) as FilmPassWithUniforms;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: FilmPassWithUniforms) {
		pass.uniforms.nIntensity.value = this.pv.noiseIntensity;
		pass.uniforms.sIntensity.value = this.pv.scanlinesIntensity;
		pass.uniforms.sCount.value = this.pv.scanlinesCount;
		pass.uniforms.grayscale.value = this.pv.grayscale ? 1 : 0;
	}
}
