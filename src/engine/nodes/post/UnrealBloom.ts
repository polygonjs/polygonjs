import {Vector2} from 'three/src/math/Vector2';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamCallback} from './_Base';
import {UnrealBloomPass} from '../../../../modules/three/examples/jsm/postprocessing/UnrealBloomPass';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class UnrealBloomPostParamsConfig extends NodeParamsConfig {
	strength = ParamConfig.FLOAT(1.5, {
		range: [0, 3],
		range_locked: [true, false],
		callback: PostParamCallback,
	});
	radius = ParamConfig.FLOAT(1, {
		callback: PostParamCallback,
	});
	threshold = ParamConfig.FLOAT(0, {
		callback: PostParamCallback,
	});
}
const ParamsConfig = new UnrealBloomPostParamsConfig();
export class UnrealBloomPostNode extends TypedPostProcessNode<UnrealBloomPass, UnrealBloomPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'unreal_bloom';
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
