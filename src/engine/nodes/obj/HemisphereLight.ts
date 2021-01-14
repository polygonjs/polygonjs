/**
 * Creates a hemisphere light.
 *
 *
 */
import {HemisphereLight} from 'three/src/lights/HemisphereLight';
import {HemisphereLightHelper} from './utils/helpers/HemisphereLightHelper';
import {TypedLightObjNode} from './_BaseLight';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {ColorConversion} from '../../../core/Color';
import {Color} from 'three/src/math/Color';
import {Mesh} from 'three/src/objects/Mesh';

const DEFAULT = {
	skyColor: new Color(1, 1, 1),
	groundColor: new Color(0, 0, 0),
};
class HemisphereLightObjParamsConfig extends NodeParamsConfig {
	/** @param sky color */
	skyColor = ParamConfig.COLOR(DEFAULT.skyColor, {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param ground color */
	groundColor = ParamConfig.COLOR(DEFAULT.groundColor, {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param light intensity */
	intensity = ParamConfig.FLOAT(1);
	/** @param light position */
	position = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param toggle to show helper */
	showHelper = ParamConfig.BOOLEAN(0);
	/** @param helper size */
	helperSize = ParamConfig.FLOAT(1, {visibleIf: {showHelper: 1}});
}
const ParamsConfig = new HemisphereLightObjParamsConfig();

export class HemisphereLightObjNode extends TypedLightObjNode<HemisphereLight, HemisphereLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'hemisphereLight';
	}
	private _helper_controller = new HelperController<Mesh, HemisphereLight>(
		this,
		(<unknown>HemisphereLightHelper) as HelperConstructor<Mesh, HemisphereLight>,
		'HemisphereLightHelper'
	);

	create_light() {
		const light = new HemisphereLight();
		light.matrixAutoUpdate = false;
		// make sure the light is initialized with same defaults as the node parameters
		light.color.copy(DEFAULT.skyColor);
		light.groundColor.copy(DEFAULT.groundColor);
		return light;
	}
	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this._helper_controller.initialize_node();
	}

	update_light_params() {
		this.light.color = this.pv.skyColor;
		this.light.groundColor = this.pv.groundColor;
		this.light.position.copy(this.pv.position);
		this.light.intensity = this.pv.intensity;

		this._helper_controller.update();
	}
}
