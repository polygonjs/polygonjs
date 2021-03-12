/**
 * Creates an ambient light.
 *
 * @remarks
 * An ambient light will add a uniform light to every object. This can be useful to elevate the shadows slightly.
 *
 */
import {AmbientLight} from 'three/src/lights/AmbientLight';
import {TypedLightObjNode} from './_BaseLight';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorConversion} from '../../../core/Color';
class AmbientLightObjParamsConfig extends NodeParamsConfig {
	/** @param light color */
	color = ParamConfig.COLOR([1, 1, 1], {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param light intensity */
	intensity = ParamConfig.FLOAT(1);
}
const ParamsConfig = new AmbientLightObjParamsConfig();

export class AmbientLightObjNode extends TypedLightObjNode<AmbientLight, AmbientLightObjParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'ambientLight';
	}

	createLight() {
		const light = new AmbientLight();
		light.matrixAutoUpdate = false;
		return light;
	}
	initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	protected updateLightParams() {
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
	}
}
