/**
 * gets the 2D position of the cursor
 *
 * @remarks
 *
 *
 */

import {ActorNodeTriggerContext} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {BaseUserInputActorNode} from './_BaseUserInput';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';

const OUTPUT_NAME = 'cursor';
class CursorActorParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
	});
}
const ParamsConfig = new CursorActorParamsConfig();
export class CursorActorNode extends BaseUserInputActorNode<CursorActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.CURSOR;
	}
	userInputEventNames() {
		return ['pointermove'];
	}
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.initializeNode();
		// this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function((index: number) => OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.VECTOR2]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType.VECTOR2] | undefined {
		const pointerEventsController = this.scene().eventsDispatcher.pointerEventsController;
		return pointerEventsController.cursor();
	}
	override eventEmitter() {
		return EVENT_EMITTERS[this.pv.element];
	}
}
