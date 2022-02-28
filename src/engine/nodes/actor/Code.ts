/**
 * runs a custom code
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Object3D} from 'three/src/core/Object3D';
class CodeActorParamsConfig extends NodeParamsConfig {
	/** @param targetPosition */
	targetPosition = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CodeActorParamsConfig();

export class CodeActorNode extends TypedActorNode<CodeActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'code';
	}

	override processActor(object: Object3D) {
		// object.Code(this.pv.targetPosition);
		// object.updateMatrix();
	}
}
