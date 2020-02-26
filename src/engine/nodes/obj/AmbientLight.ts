import {AmbientLight} from 'three/src/lights/AmbientLight';
import {TypedLightObjNode} from './_BaseLight';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AmbientLightObjParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
	intensity = ParamConfig.FLOAT(1);
}
const ParamsConfig = new AmbientLightObjParamsConfig();

export class AmbientLightObjNode extends TypedLightObjNode<AmbientLight, AmbientLightObjParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'ambient_light';
	}

	create_light() {
		return new AmbientLight();
	}

	update_light_params() {
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
	}
}
