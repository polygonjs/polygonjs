/**
 * Adds a Glitch effect.
 *
 *
 */
import {Vector2} from 'three';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BlendFunction, GlitchEffect, EffectPass, GlitchMode} from 'postprocessing';
import {BLEND_FUNCTIONS, BLEND_FUNCTION_MENU_OPTIONS} from '../../../core/post/BlendFunction';
import {MenuNumericParamOptions} from '../../params/utils/OptionsController';
import {NodeContext} from '../../poly/NodeContext';
import {BaseViewerType} from '../../viewers/_Base';
import {Number2} from '../../../types/GlobalTypes';

const GLITCH_MODES: GlitchMode[] = [
	GlitchMode.DISABLED,
	GlitchMode.SPORADIC,
	GlitchMode.CONSTANT_MILD,
	GlitchMode.CONSTANT_WILD,
];

const GLITCH_MODE_BY_INDEX = ['DISABLED', 'SPORADIC', 'CONSTANT_MILD', 'CONSTANT_WILD'];

export const GLITCH_MODE_MENU_OPTIONS: MenuNumericParamOptions = {
	menu: {
		entries: GLITCH_MODES.map((value) => {
			return {
				name: GLITCH_MODE_BY_INDEX[value],
				value,
			};
		}),
	},
};

class GlitchPostParamsConfig extends NodeParamsConfig {
	// useTexture = ParamConfig.BOOLEAN(0, {
	// 	...PostParamOptions,
	// });
	texture = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
		},
		dependentOnFoundNode: false,
		...PostParamOptions,
		// visibleIf: {useTexture: 1},
	});
	// dtSize = ParamConfig.INTEGER(64, {
	// 	separatorBefore: true,
	// 	...PostParamOptions,
	// 	range: [2, 128],
	// 	rangeLocked: [true, false],
	// 	visibleIf: {useTexture: 0},
	// });
	/** @param mode */
	mode = ParamConfig.INTEGER(GLITCH_MODES.indexOf(GlitchMode.CONSTANT_MILD), {
		...GLITCH_MODE_MENU_OPTIONS,
		...PostParamOptions,
	});
	minDelay = ParamConfig.FLOAT(0.5, {
		separatorBefore: true,
		...PostParamOptions,
		range: [0, 1],
		rangeLocked: [true, false],
	});
	maxDelay = ParamConfig.FLOAT(0.5, {
		...PostParamOptions,
		range: [0, 1],
		rangeLocked: [true, false],
	});
	minDuration = ParamConfig.FLOAT(0.5, {
		separatorBefore: true,
		...PostParamOptions,
		range: [0, 1],
		rangeLocked: [true, false],
	});
	maxDuration = ParamConfig.FLOAT(0.5, {
		...PostParamOptions,
		range: [0, 1],
		rangeLocked: [true, false],
	});
	minStrength = ParamConfig.FLOAT(0.5, {
		separatorBefore: true,
		...PostParamOptions,
		range: [0, 1],
		rangeLocked: [true, false],
	});
	maxStrength = ParamConfig.FLOAT(0.5, {
		...PostParamOptions,
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param columns */
	columns = ParamConfig.INTEGER(2, {
		...PostParamOptions,
		range: [0, 20],
		rangeLocked: [true, false],
	});
	/** @param ratio */
	ratio = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});

	/** @param blend function */
	blendFunction = ParamConfig.INTEGER(BLEND_FUNCTIONS.indexOf(BlendFunction.SCREEN), {
		...PostParamOptions,
		...BLEND_FUNCTION_MENU_OPTIONS,
	});
	/** @param if true, the offset parameter will be updated on each render to reflect the intensity of the glitch. This can be used to drive other effects with it */
	updateOffset = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
		...PostParamOptions,
	});
	offset = ParamConfig.VECTOR2([0, 0], {
		cook: false,
		visibleIf: {
			updateOffset: 1,
		},
	});
}
const ParamsConfig = new GlitchPostParamsConfig();
export class GlitchPostNode extends TypedPostProcessNode<EffectPass, GlitchPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'glitch';
	}

	private _rendererSize = new Vector2();
	override createPass(context: TypedPostNodeContext) {
		// context.
		this._lastViewer = context.viewer;
		context.renderer.getSize(this._rendererSize);
		this._lastEffect = new GlitchEffect({
			blendFunction: this.pv.blendFunction,
			chromaticAberrationOffset: new Vector2(0, 0),
			// delay:this.pv.delay,
			// duration:this.pv.duration,
			// strength:this.pv.strength,
			// dtSize: this.pv.dtSize,
		});
		const pass = new EffectPass(context.camera, this._lastEffect);
		this.updatePass(pass);
		return pass;
	}
	override async updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as GlitchEffect;
		(effect as any).blendFunction = this.pv.blendFunction;
		effect.mode = GLITCH_MODES[this.pv.mode];
		// effect.chromaticAberrationOffset.set(this.pv.minOffset, this.pv.maxOffset);
		effect.minDelay = this.pv.minDelay;
		effect.maxDelay = this.pv.maxDelay;
		effect.minDuration = this.pv.minDuration;
		effect.maxDuration = this.pv.maxDuration;
		effect.minStrength = this.pv.minStrength;
		effect.maxStrength = this.pv.maxStrength;
		effect.columns = this.pv.columns;
		effect.ratio = this.pv.ratio;

		// if (this.pv.useTexture) {
		const texture = await this._fetchTexture();
		if (texture) {
			effect.perturbationMap = texture;
		}

		this._updateOnTickCallback();
		// } else {
		// 	// effect.dt
		// 	// (effect as any).perturbationMap = null;
		// }
	}
	private async _fetchTexture() {
		const textureNode = this.pv.texture.nodeWithContext(NodeContext.COP, this.states?.error);
		if (textureNode) {
			const container = await textureNode.compute();
			return container.coreContent();
		}
	}

	private _lastEffect: GlitchEffect | undefined;
	private _lastViewer: BaseViewerType | undefined;
	private _offsetArray: Number2 = [0, 0];
	private _onTickCallbackName() {
		return `post/glitch-${this.graphNodeId()}`;
	}
	private _updateOnTickCallback() {
		if (!this._lastViewer) {
			return;
		}
		const callbackName = this._onTickCallbackName();
		if (this.pv.updateOffset) {
			if (!this._lastViewer.registeredAfterRenderCallbacks().has(callbackName)) {
				this._lastViewer.registerOnAfterRender(callbackName, this._onRenderBound);
			}
		} else {
			this._lastViewer.unRegisterOnAfterRender(callbackName);
		}
	}
	private _onRenderBound = this._onRender.bind(this);
	private _onRender() {
		if (!this._lastEffect) {
			return;
		}
		this._lastEffect.chromaticAberrationOffset.toArray(this._offsetArray);
		this.p.offset.set(this._offsetArray);
	}
}
