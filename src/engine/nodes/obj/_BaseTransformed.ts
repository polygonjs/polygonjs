// import {Object3D} from 'three/src/core/Object3D';

// import {TypedObjNode} from './_Base';
// import {LookAtController} from './utils/LookAtController';
// import {TransformController, TransformedParamConfig} from './utils/TransformController';

// import {NodeParamsConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
// import {FlagsControllerD} from '../utils/FlagsController';
// class TransformedObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {}

// export class TypedTransformedObjNode<O extends Object3D, K extends TransformedObjParamConfig> extends TypedObjNode<
// 	O,
// 	K
// > {
// 	public readonly flags: FlagsControllerD = new FlagsControllerD(this);

// 	protected _look_at_controller: LookAtController | undefined;
// 	get look_at_controller(): LookAtController {
// 		return (this._look_at_controller = this._look_at_controller || new LookAtController(this));
// 	}
// 	protected _transform_controller: TransformController | undefined;
// 	get transform_controller(): TransformController {
// 		return (this._transform_controller = this._transform_controller || new TransformController(this));
// 	}

// 	initialize_base_node() {
// 		super.initialize_base_node();

// 		this.transform_controller.initialize_node();
// 	}
// }

// export type BaseTransformedObjNodeType = TypedTransformedObjNode<Object3D, any>;
// export class BaseTransformedObjNodeclass extends TypedTransformedObjNode<Object3D, any> {}
