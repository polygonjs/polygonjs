/**
 * Screen space ambient occlusion
 *
 *
 */
import type {Color} from 'three';
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {Pass} from 'postprocessing';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// @ts-ignore
import {N8AOPostPass} from 'n8ao';

interface N8AOPostPass extends Pass {
	configuration: {
		aoSamples: number;
		aoRadius: number;
		distanceFalloff: number;
		intensity: number;
		color: Color;
		denoiseSamples: number;
		denoiseRadius: number;
		denoiseIterations: number;
		logarithmicDepthBuffer: boolean;
		screenSpaceRadius: boolean;
		halfRef: boolean;
		depthAwareUpsampling: boolean;
	};
	setDisplayMode: (mode: DisplayMode) => void;
}

enum DisplayMode {
	COMBINED = 'Combined',
	AO = 'AO',
	NO_AO = 'No AO',
	SPLIT = 'Split',
	SPLIT_AO = 'Split AO',
}
const DISPLAY_MODES: DisplayMode[] = [
	DisplayMode.COMBINED,
	DisplayMode.AO,
	DisplayMode.NO_AO,
	DisplayMode.SPLIT,
	DisplayMode.SPLIT_AO,
];

class ScreenSpaceAmbientOcclusionParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param color */
	color = ParamConfig.COLOR([0, 0, 0], {
		...PostParamOptions,
	});
	/** @param aoSamples */
	samples = ParamConfig.INTEGER(16, {
		range: [0, 32],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param intensity */
	intensity = ParamConfig.FLOAT(5, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param radius */
	radius = ParamConfig.FLOAT(5, {
		range: [0, 20],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param distanceFallOff */
	distanceFallOff = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param halfRef */
	halfRef = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param screenSpaceRadius */
	screenSpaceRadius = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param denoise samples  */
	denoiseSamples = ParamConfig.INTEGER(8, {
		range: [0, 32],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param denoise radius */
	denoiseRadius = ParamConfig.FLOAT(12, {
		range: [0, 20],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param denoise iterations  */
	denoiseIterations = ParamConfig.INTEGER(2, {
		range: [0, 4],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	displayMode = ParamConfig.INTEGER(DISPLAY_MODES.indexOf(DisplayMode.COMBINED), {
		menu: {
			entries: DISPLAY_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
}
const ParamsConfig = new ScreenSpaceAmbientOcclusionParamsConfig();
export class ScreenSpaceAmbientOcclusionPostNode extends TypedPostNode<Pass, ScreenSpaceAmbientOcclusionParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'screenSpaceAmbientOcclusion';
	}

	override createPass(context: TypedPostNodeContext) {
		const n8aoPass = new N8AOPostPass(context.scene, context.camera);

		this.updatePass(n8aoPass);

		const passes: Pass[] = [n8aoPass];
		return passes;
	}

	override updatePass(pass: N8AOPostPass) {
		pass.configuration.aoSamples = this.pv.samples;
		pass.configuration.aoRadius = this.pv.radius;
		pass.configuration.distanceFalloff = this.pv.distanceFallOff;
		pass.configuration.intensity = this.pv.intensity;
		pass.configuration.color.copy(this.pv.color);
		//
		pass.configuration.halfRef = this.pv.halfRef;
		pass.configuration.screenSpaceRadius = this.pv.screenSpaceRadius;
		// denoise
		pass.configuration.denoiseSamples = this.pv.denoiseSamples;
		pass.configuration.denoiseRadius = this.pv.denoiseRadius;
		pass.configuration.denoiseIterations = this.pv.denoiseIterations;

		const displayMode = DISPLAY_MODES[this.pv.displayMode];
		pass.setDisplayMode(displayMode);
	}
}
