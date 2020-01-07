
import {AmbientLight} from 'three/src/lights/AmbientLight'
const THREE = {AmbientLight}
import {BaseLight} from './_BaseLight';

export class AmbientLightObj extends BaseLight {

	constructor() {
		super();
	}
	static type() { return 'ambient_light'; }

	create_object() {
		return new THREE.AmbientLight();
	}

	create_light_params() {
		this.add_param( 'color', 'color', [1,1,1] );
		this.add_param( 'float', 'intensity', 1 );
	}


	update_light_params() {
		let object;
		if ((object = this.object()) != null) {
			object.color = this._param_color;
			return object.intensity = this._param_intensity;
		}
	}
}
