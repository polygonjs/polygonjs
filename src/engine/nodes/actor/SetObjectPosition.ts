/**
 * Update the object's position
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class SetObjectPositionActorParamsConfig extends NodeParamsConfig {
	/** @param position */
	position = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new SetObjectPositionActorParamsConfig();

export class SetObjectPositionActorNode extends TypedActorNode<SetObjectPositionActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectPosition';
	}
}
