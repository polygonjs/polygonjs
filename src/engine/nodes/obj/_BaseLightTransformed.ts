import {BaseLight} from './_BaseLight';

import {CoreTransform} from 'src/Core/Transform';


import {Transformed} from './Concerns/Transformed';

// class BaseModules extends BaseLight {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, Transformed.instance_methods);

export class BaseLightTransformed extends Transformed(BaseLight) {

	constructor() {
		super();
	}


	create_params() {
		this.within_param_folder('transform', ()=>{
			CoreTransform.create_params(this);
		})
		this.within_param_folder('light', ()=>{
			this.create_light_params();
		})
		this.within_param_folder('shadows', ()=>{
			this.create_shadow_params_main();
		})
	}


	cook() {
		this.update_transform();
		this.update_light_params();
		this.update_shadow_params();
		this.end_cook();
	}
}

