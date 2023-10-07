/**
 * Adds tonemapping.
 *
 *
 */
import {Vector2} from 'three';
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BlendFunction, ToneMappingEffect, EffectPass, ToneMappingMode} from 'postprocessing';

enum ToneMappingModeStr {
	REINHARD = 'REINHARD',
	REINHARD2 = 'REINHARD2',
	REINHARD2_ADAPTIVE = 'REINHARD2_ADAPTIVE',
	OPTIMIZED_CINEON = 'OPTIMIZED_CINEON',
	ACES_FILMIC = 'ACES_FILMIC',
	UNCHARTED2 = 'UNCHARTED2',
}
const TONE_MAPPING_MODES: ToneMappingModeStr[] = [
	ToneMappingModeStr.REINHARD,
	ToneMappingModeStr.REINHARD2,
	ToneMappingModeStr.REINHARD2_ADAPTIVE,
	ToneMappingModeStr.OPTIMIZED_CINEON,
	ToneMappingModeStr.ACES_FILMIC,
	ToneMappingModeStr.UNCHARTED2,
];
const REMAPPED_TONE_MAPPING: Record<ToneMappingModeStr, ToneMappingMode> = {
	[ToneMappingModeStr.REINHARD]: ToneMappingMode.REINHARD,
	[ToneMappingModeStr.REINHARD2]: ToneMappingMode.REINHARD2,
	[ToneMappingModeStr.REINHARD2_ADAPTIVE]: ToneMappingMode.REINHARD2_ADAPTIVE,
	[ToneMappingModeStr.OPTIMIZED_CINEON]: ToneMappingMode.OPTIMIZED_CINEON,
	[ToneMappingModeStr.ACES_FILMIC]: ToneMappingMode.ACES_FILMIC,
	[ToneMappingModeStr.UNCHARTED2]: ToneMappingMode.UNCHARTED2,
};

interface ToneMappingEffectOptions {
	blendFunction?: BlendFunction;
	adaptive?: boolean;
	mode?: ToneMappingMode;
	resolution?: number;
	maxLuminance?: number;
	whitePoint?: number;
	middleGrey?: number;
	minLuminance?: number;
	averageLuminance?: number;
	adaptationRate?: number;
}

class ToneMappingPostParamsConfig extends NodeParamsConfig {
	/** @param mode */
	mode = ParamConfig.INTEGER(TONE_MAPPING_MODES.indexOf(ToneMappingModeStr.ACES_FILMIC), {
		menu: {
			entries: TONE_MAPPING_MODES.map((name, value) => ({name, value})),
		},
		...PostParamOptions,
	});
	/** @param adaptive */
	adaptive = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
}
const ParamsConfig = new ToneMappingPostParamsConfig();
export class ToneMappingPostNode extends TypedPostNode<EffectPass, ToneMappingPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'toneMapping';
	}

	private _rendererSize = new Vector2();
	override createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		const toneMappingEffectOptions: ToneMappingEffectOptions = {
			mode: this.toneMapping(),
		};
		const bloomEffect = new ToneMappingEffect(toneMappingEffectOptions);
		const pass = new EffectPass(context.camera, bloomEffect);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as ToneMappingEffect;

		effect.mode = this.toneMapping();
	}
	toneMapping() {
		return REMAPPED_TONE_MAPPING[TONE_MAPPING_MODES[this.pv.mode]];
	}
}
