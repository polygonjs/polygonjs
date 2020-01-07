
import {ParamType} from 'src/Engine/Param/_Module'
import {BaseLightTransformed} from './_BaseLightTransformed';
import {RectAreaLight} from 'three/src/lights/RectAreaLight'
const THREE = {RectAreaLight}

// attempt to load immediately, to ensure that async lights
// are not going to trigger material recompilations
// making the scene load much slower
// but this makes the js heavier by a fair bit
// so an alternative should be found
// if that proves to be necessary (maybe I'll have to wait for all lights to be created first, and only then load the objects)
// well.. that changes nothing.
// instead I should do this maybe:
// scene.display_scene().traverse((object)=>{if(object.material){object.material.needsUpdate = true}})
// or maybe I should only instanciate a THREE.RectAreaLight after having called init()
import {CoreScriptLoader} from 'src/Core/Loader/Script'

export class AreaLight extends BaseLightTransformed {

	constructor() {
		super();
	}
	static type() { return 'area_light'; }

	create_object() {
		const object = new THREE.RectAreaLight(0xffffff, 1, 1, 1);

		return object;
	}

	create_light_params() {
		this.add_param( ParamType.COLOR, 'color', [1,1,1] );
		this.add_param( ParamType.FLOAT, 'intensity', 1, {range: [0, 10]} );
		this.add_param( ParamType.FLOAT, 'width', 1, {range: [0, 10]} );
		this.add_param( ParamType.FLOAT, 'height', 1, {range: [0, 10]} );
	}

	update_light_params() {
		let object;
		if ((object = this.object()) != null) {

			object.color = this._param_color;
			object.intensity = this._param_intensity;
			object.width = this._param_width;
			object.height = this._param_height;
		}
	}

	async cook() {
		const {RectAreaLightUniformsLib} = await CoreScriptLoader.load_module_three_light("RectAreaLightUniformsLib")
		// const module = RectAreaLightUniformsLib
		if(!RectAreaLightUniformsLib.initialized){
			RectAreaLightUniformsLib.init();
			RectAreaLightUniformsLib.initialized = true
		}


		this.update_transform();
		this.update_light_params();
		this.update_shadow_params();
		this.end_cook();
	}

}


