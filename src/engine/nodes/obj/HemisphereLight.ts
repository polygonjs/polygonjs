import {HemisphereLight} from 'three/src/lights/HemisphereLight';
import {TypedLightObjNode} from './_BaseLight';
// import {Color} from 'three/src/math/Color';
// import {Vector3} from 'three/src/math/Vector3';
// import {ParamType} from 'src/engine/poly/ParamType';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class HemisphereLightObjParamsConfig extends NodeParamsConfig {
	sky_color = ParamConfig.COLOR([0.2, 0.7, 1]);
	ground_color = ParamConfig.COLOR([0.1, 0.1, 0.25]);
	intensity = ParamConfig.FLOAT(1);
	position = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new HemisphereLightObjParamsConfig();

export class HemisphereLightObjNode extends TypedLightObjNode<HemisphereLight, HemisphereLightObjParamsConfig> {
	params_config = ParamsConfig;
	// protected _object: HemisphereLight;
	// get object() {
	// 	return this._object;
	// }
	static type() {
		return 'hemisphere_light';
	}

	create_object() {
		return new HemisphereLight();
	}

	// create_light_params() {
	// 	this.add_param(ParamType.COLOR, 'sky_color', [0.2, 0.7, 1]);
	// 	this.add_param(ParamType.COLOR, 'ground_color', [0.1, 0.1, 0.25]);
	// 	this.add_param(ParamType.VECTOR3, 'position', [0, 1, 0]);
	// 	this.add_param(ParamType.FLOAT, 'intensity', 1, {range: [0, 10]});
	// }

	update_light_params() {
		this.object.color = this.pv.sky_color;
		this.object.groundColor = this.pv.ground_color;
		this.object.position.copy(this.pv.position);
		this.object.intensity = this.pv.intensity;
	}
}
