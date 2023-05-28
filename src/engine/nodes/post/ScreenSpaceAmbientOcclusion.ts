/**
 * Screen space ambient occlusion
 *
 *
 */
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {Pass} from 'postprocessing';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// @ts-ignore
import {N8AOPostPass} from 'n8ao';

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
	/** @param intensity */
	intensity = ParamConfig.FLOAT(5, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param radius */
	radius = ParamConfig.FLOAT(5, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param distanceFallOff */
	distanceFallOff = ParamConfig.FLOAT(1, {
		range: [0, 1],
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
		pass.configuration.aoRadius = this.pv.radius;
		pass.configuration.distanceFalloff = this.pv.distanceFallOff;
		pass.configuration.intensity = this.pv.intensity;
		pass.configuration.color.copy(this.pv.color);

		const displayMode = DISPLAY_MODES[this.pv.displayMode];
		pass.setDisplayMode(displayMode);
	}
}
