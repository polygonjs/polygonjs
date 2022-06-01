/**
 * forwards any input trigger
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';

class AnyTriggerActorParamsConfig extends NodeParamsConfig {
	/** @param audio node */
	condition = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new AnyTriggerActorParamsConfig();

export class AnyTriggerActorNode extends TypedActorNode<AnyTriggerActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'anyTrigger';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputTypes() {
		const current_connections = this.io.connections.existingInputConnections();
		const expected_count = current_connections ? Math.max(current_connections.length + 1, 2) : 2;
		return new Array(expected_count).fill(ActorConnectionPointType.TRIGGER);
	}
	protected _expectedOutputTypes() {
		return [ActorConnectionPointType.TRIGGER];
	}
	protected _expectedInputName(index: number) {
		return `${ActorConnectionPointType.TRIGGER}${index}`;
	}
	protected _expectedOutputName(index: number): string {
		return ActorConnectionPointType.TRIGGER;
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		this.runTrigger(context);
	}
}
