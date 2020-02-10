import {RectAreaLight} from 'three/src/lights/RectAreaLight';
import {RectAreaLightUniformsLib} from 'modules/three/examples/jsm/lights/RectAreaLightUniformsLib';

import {TypedLightObjNode} from './_BaseLight';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class AreaLightObjParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
	intensity = ParamConfig.FLOAT(1, {range: [0, 10]});
	width = ParamConfig.FLOAT(1, {range: [0, 10]});
	height = ParamConfig.FLOAT(1, {range: [0, 10]});
}
const ParamsConfig = new AreaLightObjParamsConfig();

export class AreaLightObjNode extends TypedLightObjNode<RectAreaLight, AreaLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'area_light';
	}

	create_object() {
		const object = new RectAreaLight(0xffffff, 1, 1, 1);

		return object;
	}

	// create_light_params() {
	// 	this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
	// 	this.add_param(ParamType.FLOAT, 'intensity', 1, {range: [0, 10]});
	// 	this.add_param(ParamType.FLOAT, 'width', 1, {range: [0, 10]});
	// 	this.add_param(ParamType.FLOAT, 'height', 1, {range: [0, 10]});
	// }

	update_light_params() {
		this.object.color = this.pv.color;
		this.object.intensity = this.pv.intensity;
		this.object.width = this.pv.width;
		this.object.height = this.pv.height;
	}

	async cook() {
		// const {RectAreaLightUniformsLib} = await CoreScriptLoader.load_module_three_light('RectAreaLightUniformsLib');
		// const module = RectAreaLightUniformsLib
		if (!(RectAreaLightUniformsLib as any).initialized) {
			RectAreaLightUniformsLib.init();
			(RectAreaLightUniformsLib as any).initialized = true;
		}

		this.transform_controller.update();
		this.update_light_params();
		this.update_shadow_params();
		this.cook_controller.end_cook();
	}
}
