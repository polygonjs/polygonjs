/**
 * Dummy node
 *
 *
 */

import {BaseMathFunctionArg1ActorNode} from './_BaseMathFunction';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext} from './_Base';
class NullActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullActorParamsConfig();

export class NullActorNode extends BaseMathFunctionArg1ActorNode {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'null';
	}
	protected override _expectedInputTypes() {
		const type = this.io.connection_points.first_input_connection_type() || ActorConnectionPointType.FLOAT;
		return [type, ActorConnectionPointType.FLOAT];
	}
	public override receiveTrigger(context: ActorNodeTriggerContext) {
		this.runTrigger(context);
	}
	public override outputValue(context: ActorNodeTriggerContext) {
		return this._inputValue(this._expectedInputName(0), context) || 0;
	}
}
