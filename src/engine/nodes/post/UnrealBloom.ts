/**
 * Adds an Unreal Bloom effect.
 *
 *
 */
import {Vector2} from 'three';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
// import {UnrealBloomPass} from '../../../modules/three/examples/jsm/postprocessing/UnrealBloomPass';
import {UnrealBloomPass} from '../../../modules/core/post_process/UnrealBloomPass';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/Type';
// import {isBooleanTrue} from '../../../core/Type';
// import {BaseNodeType} from '../_Base';
class UnrealBloomPostParamsConfig extends NodeParamsConfig {
	/** @param effect strength */
	strength = ParamConfig.FLOAT(1.5, {
		range: [0, 3],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param effect radius */
	radius = ParamConfig.FLOAT(1, {
		...PostParamOptions,
	});
	/** @param effect threshold */
	threshold = ParamConfig.FLOAT(0, {
		...PostParamOptions,
	});
	/** @param bloom only */
	bloomOnly = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
}
const ParamsConfig = new UnrealBloomPostParamsConfig();
export class UnrealBloomPostNode extends TypedPostProcessNode<UnrealBloomPass, UnrealBloomPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'unrealBloom';
	}

	private _rendererSize = new Vector2();
	protected override _createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		const pass = new UnrealBloomPass({
			resolution: this._rendererSize,
			strength: this.pv.strength,
			radius: this.pv.radius,
			threshold: this.pv.threshold,
			bloomOnly: isBooleanTrue(this.pv.bloomOnly),
			renderTargetFactory: (width, height) => {
				return this._createRenderTarget(context.composer.renderer, {width, height});
			},
		});
		return pass;
	}
	override updatePass(pass: UnrealBloomPass) {
		pass.strength = this.pv.strength;
		pass.radius = this.pv.radius;
		pass.threshold = this.pv.threshold;
		pass.bloomOnly = this.pv.bloomOnly;
	}
}
