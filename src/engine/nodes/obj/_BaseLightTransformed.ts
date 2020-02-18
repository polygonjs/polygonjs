import {TypedLightObjNode} from './_BaseLight';
import {Light} from 'three/src/lights/Light';
// import {CoreTransform} from 'src/core/Transform';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TransformController, TransformedParamConfig} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';

// import {Transformed} from './Concerns/Transformed';
class TransformedObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {}

export abstract class BaseLightTransformedObjNode<
	O extends Light,
	K extends TransformedObjParamConfig
> extends TypedLightObjNode<O, K> {
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	readonly transform_controller: TransformController = new TransformController(this);

	initialize_base_node() {
		super.initialize_base_node();
		this.transform_controller.initialize_node();
	}
	// create_params() {
	// 	// this.within_param_folder('transform', () => {
	// 	// 	CoreTransform.create_params(this);
	// 	// });
	// 	// this.within_param_folder('light', () => {
	// 	// 	this.create_light_params();
	// 	// });
	// 	// this.within_param_folder('shadows', () => {
	// 	// 	this.create_shadow_params_main();
	// 	// });
	// }

	cook() {
		this.transform_controller.update();
		this.update_light_params();
		this.update_shadow_params();
		this.cook_controller.end_cook();
	}
}
