import {BaseLightObjNode} from './_BaseLight';

import {CoreTransform} from 'src/core/Transform';

// import {Transformed} from './Concerns/Transformed';

// class BaseModules extends BaseLight {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, Transformed.instance_methods);

export abstract class BaseLightTransformedObjNode extends BaseLightObjNode {
	create_params() {
		this.within_param_folder('transform', () => {
			CoreTransform.create_params(this);
		});
		this.within_param_folder('light', () => {
			this.create_light_params();
		});
		this.within_param_folder('shadows', () => {
			this.create_shadow_params_main();
		});
	}

	cook() {
		this.transform_controller.update();
		this.update_light_params();
		this.update_shadow_params();
		this.cook_controller.end_cook();
	}
}
