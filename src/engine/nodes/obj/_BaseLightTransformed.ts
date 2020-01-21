import {TypedLightObjNode} from './_BaseLight';
import {Light} from 'three/src/lights/Light';
// import {CoreTransform} from 'src/core/Transform';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

// import {Transformed} from './Concerns/Transformed';

export abstract class BaseLightTransformedObjNode<
	O extends Light,
	K extends NodeParamsConfig
> extends TypedLightObjNode<O, K> {
	create_params() {
		// this.within_param_folder('transform', () => {
		// 	CoreTransform.create_params(this);
		// });
		// this.within_param_folder('light', () => {
		// 	this.create_light_params();
		// });
		// this.within_param_folder('shadows', () => {
		// 	this.create_shadow_params_main();
		// });
	}

	cook() {
		this.transform_controller.update();
		this.update_light_params();
		this.update_shadow_params();
		this.cook_controller.end_cook();
	}
}
