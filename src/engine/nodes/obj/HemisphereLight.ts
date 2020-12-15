import {HemisphereLight} from 'three/src/lights/HemisphereLight';
import {HemisphereLightHelper} from './utils/helpers/HemisphereLightHelper';
import {TypedLightObjNode} from './_BaseLight';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {ColorConversion} from '../../../core/Color';
import {Color} from 'three/src/math/Color';

const DEFAULT = {
	sky_color: new Color(1, 1, 1),
	ground_color: new Color(0, 0, 0),
};
class HemisphereLightObjParamsConfig extends NodeParamsConfig {
	sky_color = ParamConfig.COLOR(DEFAULT.sky_color, {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	ground_color = ParamConfig.COLOR(DEFAULT.ground_color, {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	intensity = ParamConfig.FLOAT(1);
	position = ParamConfig.VECTOR3([0, 1, 0]);
	show_helper = ParamConfig.BOOLEAN(0);
	helper_size = ParamConfig.FLOAT(1, {visible_if: {show_helper: 1}});
}
const ParamsConfig = new HemisphereLightObjParamsConfig();

export class HemisphereLightObjNode extends TypedLightObjNode<HemisphereLight, HemisphereLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'hemisphere_light';
	}
	private _helper_controller = new HelperController<HemisphereLight>(
		this,
		(<unknown>HemisphereLightHelper) as HelperConstructor<HemisphereLight>,
		'HemisphereLightHelper'
	);

	create_light() {
		const light = new HemisphereLight();
		light.matrixAutoUpdate = false;
		// make sure the light is initialized with same defaults as the node parameters
		light.color.copy(DEFAULT.sky_color);
		light.groundColor.copy(DEFAULT.ground_color);
		return light;
	}
	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this._helper_controller.initialize_node();
	}

	update_light_params() {
		this.light.color = this.pv.sky_color;
		this.light.groundColor = this.pv.ground_color;
		this.light.position.copy(this.pv.position);
		this.light.intensity = this.pv.intensity;

		this._helper_controller.update();
	}
}
