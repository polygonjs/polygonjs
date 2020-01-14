// import {Color} from 'three/src/math/Color';
// import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
// import {RectAreaLight} from 'three/src/lights/RectAreaLight';

// // attempt to load immediately, to ensure that async lights
// // are not going to trigger material recompilations
// // making the scene load much slower
// // but this makes the js heavier by a fair bit
// // so an alternative should be found
// // if that proves to be necessary (maybe I'll have to wait for all lights to be created first, and only then load the objects)
// // well.. that changes nothing.
// // instead I should do this maybe:
// // scene.display_scene().traverse((object)=>{if(object.material){object.material.needsUpdate = true}})
// // or maybe I should only instanciate a RectAreaLight after having called init()
// import {CoreScriptLoader} from 'src/core/loader/Script';
// import {ParamType} from 'src/engine/poly/ParamType';

// export class AreaLight extends BaseLightTransformedObjNode {
// 	@ParamC('color') _param_color: Color;
// 	@ParamC('intensity') _param_intensity: number;
// 	@ParamC('width') _param_width: number;
// 	@ParamC('height') _param_height: number;
// 	protected _object: RectAreaLight;
// 	get object() {
// 		return this._object;
// 	}

// 	static type() {
// 		return 'area_light';
// 	}

// 	create_object() {
// 		const object = new RectAreaLight(0xffffff, 1, 1, 1);

// 		return object;
// 	}

// 	create_light_params() {
// 		this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
// 		this.add_param(ParamType.FLOAT, 'intensity', 1, {range: [0, 10]});
// 		this.add_param(ParamType.FLOAT, 'width', 1, {range: [0, 10]});
// 		this.add_param(ParamType.FLOAT, 'height', 1, {range: [0, 10]});
// 	}

// 	update_light_params() {
// 		this.object.color = this._param_color;
// 		this.object.intensity = this._param_intensity;
// 		this.object.width = this._param_width;
// 		this.object.height = this._param_height;
// 	}

// 	async cook() {
// 		const {RectAreaLightUniformsLib} = await CoreScriptLoader.load_module_three_light('RectAreaLightUniformsLib');
// 		// const module = RectAreaLightUniformsLib
// 		if (!RectAreaLightUniformsLib.initialized) {
// 			RectAreaLightUniformsLib.init();
// 			RectAreaLightUniformsLib.initialized = true;
// 		}

// 		this.transform_controller.update();
// 		this.update_light_params();
// 		this.update_shadow_params();
// 		this.cook_controller.end_cook();
// 	}
// }
