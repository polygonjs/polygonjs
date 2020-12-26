/**
 * Adds an Unreal Bloom effect.
 *
 *
 */
import {Vector2} from 'three/src/math/Vector2';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {UnrealBloomPass} from '../../../modules/three/examples/jsm/postprocessing/UnrealBloomPass';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class UnrealBloomPostParamsConfig extends NodeParamsConfig {
	/** @param effect strength */
	strength = ParamConfig.FLOAT(1.5, {
		range: [0, 3],
		range_locked: [true, false],
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
}
const ParamsConfig = new UnrealBloomPostParamsConfig();
export class UnrealBloomPostNode extends TypedPostProcessNode<UnrealBloomPass, UnrealBloomPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'unrealBloom';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new UnrealBloomPass(
			new Vector2(context.resolution.x, context.resolution.y),
			this.pv.strength,
			this.pv.radius,
			this.pv.threshold
		);
		return pass;
	}
	update_pass(pass: UnrealBloomPass) {
		pass.strength = this.pv.strength;
		pass.radius = this.pv.radius;
		pass.threshold = this.pv.threshold;
	}
}
