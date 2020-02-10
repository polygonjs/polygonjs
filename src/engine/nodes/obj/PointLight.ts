import {PointLight} from 'three/src/lights/PointLight';
import {ParamType} from 'src/engine/poly/ParamType';

import {TypedLightObjNode} from './_BaseLight';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class PointLightObjParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
	intensity = ParamConfig.FLOAT(1);
	decay = ParamConfig.FLOAT(0.1);
	distance = ParamConfig.FLOAT(100);
	// shadows
	cast_shadows = ParamConfig.BOOLEAN(1);
	shadow_res = ParamConfig.VECTOR2([1024, 1024]);
	shadow_bias = ParamConfig.FLOAT(-0.001);
	shadow_near = ParamConfig.FLOAT(1);
	shadow_far = ParamConfig.FLOAT(100);
}
const ParamsConfig = new PointLightObjParamsConfig();

export class PointLightObjNode extends TypedLightObjNode<PointLight, PointLightObjParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'point_light';
	}
	initialize_node() {
		this.io.inputs.set_count(0, 1);
	}

	create_object() {
		const object = new PointLight();

		object.castShadow = true;
		object.shadow.bias = -0.001;
		object.shadow.mapSize.x = 1024;
		object.shadow.mapSize.y = 1024;
		object.shadow.camera.near = 0.1;
		return object;
	}

	create_light_params() {
		this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
		this.add_param(ParamType.FLOAT, 'intensity', 1);
		this.add_param(ParamType.FLOAT, 'decay', 0.1);
		this.add_param(ParamType.FLOAT, 'distance', 100);
	}
	// create_shadow_params() {
	// 	this.add_param(ParamType.BOOLEAN, 'cast_shadows', 1);
	// 	const shadow_options = {visible_if: {cast_shadows: 1}};
	// 	this.add_param(ParamType.VECTOR2, 'shadow_res', [1024, 1024], shadow_options);
	// 	this.add_param(ParamType.FLOAT, 'shadow_near', 0.1, shadow_options);
	// 	this.add_param(ParamType.FLOAT, 'shadow_far', 100, shadow_options);
	// 	// this.add_param( 'float', 'shadow_far', 500 ) # same as param distance
	// 	this.add_param(ParamType.FLOAT, 'shadow_bias', -0.0001, shadow_options);
	// 	// this.add_param( 'float', 'shadow_blur', 1, shadow_options );
	// }

	update_light_params() {
		this.object.color = this.pv.color;
		this.object.intensity = this.pv.intensity;
		this.object.decay = this.pv.decay;

		this.object.distance = this.pv.distance;
	}
	update_shadow_params() {
		this.object.castShadow = this.pv.cast_shadows;
		this.object.shadow.mapSize.copy(this.pv.shadow_res);
		this.object.shadow.camera.near = this.pv.shadow_near;
		this.object.shadow.camera.far = this.pv.shadow_far;
		this.object.shadow.bias = this.pv.shadow_bias;
	}
}
