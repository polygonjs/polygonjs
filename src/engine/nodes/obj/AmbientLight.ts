import {AmbientLight} from 'three/src/lights/AmbientLight';
import {TypedLightObjNode} from './_BaseLight';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorConversion} from '../../../core/Color';
class AmbientLightObjParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1], {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	intensity = ParamConfig.FLOAT(1);
}
const ParamsConfig = new AmbientLightObjParamsConfig();

export class AmbientLightObjNode extends TypedLightObjNode<AmbientLight, AmbientLightObjParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'ambient_light';
	}

	create_light() {
		const light = new AmbientLight();
		light.matrixAutoUpdate = false;
		return light;
	}
	initialize_node() {
		this.io.inputs.set_count(0, 1);
	}

	update_light_params() {
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
	}
}
