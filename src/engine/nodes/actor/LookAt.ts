/**
 * Make object look at a position
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {Object3D} from 'three/src/core/Object3D';
class LookAtActorParamsConfig extends NodeParamsConfig {
	/** @param targetPosition */
	targetPosition = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new LookAtActorParamsConfig();

export class LookAtActorNode extends TypedActorNode<LookAtActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'lookAt';
	}

	// override processActor(object: Object3D) {
	// 	object.lookAt(this.pv.targetPosition);
	// 	object.updateMatrix();
	// }
}
