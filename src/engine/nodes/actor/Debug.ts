/**
 * Debug prints out the inputs values it receives to the console
 *
 *
 */

import {BaseMathFunctionArg1ActorNode} from './_BaseMathFunction';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext} from './_Base';
class DebugActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DebugActorParamsConfig();

export class DebugActorNode extends BaseMathFunctionArg1ActorNode {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'debug';
	}
	protected override _expectedInputTypes() {
		const type = this.io.connection_points.first_input_connection_type() || ActorConnectionPointType.FLOAT;
		return [type, ActorConnectionPointType.FLOAT];
	}
	public override receiveTrigger(context: ActorNodeTriggerContext) {
		console.log('receiveTrigger', this.path(), context);
		this.runTrigger(context);
	}
	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const val = this._inputValue(this._expectedInputName(0), context) || 0;
		console.log('outputValue', this.path(), context, val);
		return val;
	}
}
