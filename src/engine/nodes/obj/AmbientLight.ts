import {AmbientLight} from 'three/src/lights/AmbientLight';
import {BaseLightObjNode} from './_BaseLight';
import {Color} from 'three/src/math/Color';

export class AmbientLightObj extends BaseLightObjNode {
	@ParamC('color') _param_color: Color;
	@ParamC('intensity') _param_intensity: number;
	constructor() {
		super();
	}
	static type() {
		return 'ambient_light';
	}

	create_object() {
		return new AmbientLight();
	}

	create_light_params() {
		this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
		this.add_param(ParamType.FLOAT, 'intensity', 1, {range: [0, 10]});
	}

	update_light_params() {
		this.object.color = this._param_color;
		this.object.intensity = this._param_intensity;
	}
}
