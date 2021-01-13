import {TypedLightObjNode} from './_BaseLight';
import {Light} from 'three/src/lights/Light';
// import {CoreTransform} from '../../../core/Transform';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TransformController, TransformedParamConfig} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {HierarchyController} from './utils/HierarchyController';

// import {Transformed} from './Concerns/Transformed';
class TransformedObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {}

export abstract class BaseLightTransformedObjNode<
	L extends Light,
	K extends TransformedObjParamConfig
> extends TypedLightObjNode<L, K> {
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	readonly transform_controller: TransformController = new TransformController(this);

	initialize_base_node() {
		super.initialize_base_node();
		this.hierarchy_controller.initialize_node();
		this.transform_controller.initialize_node();
	}

	cook() {
		this.transform_controller.update();
		this.update_light_params();
		this.update_shadow_params();
		this.cookController.end_cook();
	}
}
