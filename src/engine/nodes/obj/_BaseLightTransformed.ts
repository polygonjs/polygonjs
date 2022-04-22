import {TypedLightObjNode} from './_BaseLight';
import {Object3D} from 'three';
// import {CoreTransform} from '../../../core/Transform';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TransformController, TransformedParamConfig} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {HierarchyController} from './utils/HierarchyController';

// import {Transformed} from './Concerns/Transformed';
class TransformedObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {}

export abstract class BaseLightTransformedObjNode<
	L extends Object3D,
	K extends TransformedObjParamConfig
> extends TypedLightObjNode<L, K> {
	public override readonly flags: FlagsControllerD = new FlagsControllerD(this);
	override readonly hierarchyController: HierarchyController = new HierarchyController(this);
	override readonly transformController: TransformController = new TransformController(this);

	override initializeBaseNode() {
		super.initializeBaseNode();
		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();
	}

	override cook() {
		this.transformController.update();
		this.updateLightParams();
		this.updateShadowParams();
		this.cookController.endCook();
	}
}
