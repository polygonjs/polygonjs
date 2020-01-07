
import {HemisphereLight} from 'three/src/lights/HemisphereLight'
const THREE = {HemisphereLight}
import {BaseLight} from './_BaseLight';
import {ParamType} from 'src/Engine/Param/_Module'

export class HemisphereLightObj extends BaseLight {
	static type() { return 'hemisphere_light'; }

	constructor() {
		super();
	}

	create_object() {
		return new THREE.HemisphereLight();
	}

	create_light_params() {
		this.add_param( ParamType.COLOR, 'sky_color', [0.2,0.7,1] );
		this.add_param( ParamType.COLOR, 'ground_color', [0.1,0.1,0.25] );
		this.add_param( ParamType.VECTOR, 'position', [0,1,0] );
		this.add_param( ParamType.FLOAT, 'intensity', 1, {range: [0,10]} );
	}


	update_light_params() {
		const object = this.object();
		if (object) {
			object.color = this._param_sky_color;
			object.groundColor = this._param_ground_color;
			object.position.copy(this._param_position);
			object.intensity = this._param_intensity;
		}
	}
}



