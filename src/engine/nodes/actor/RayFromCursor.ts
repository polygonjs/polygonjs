/**
 * gets the ray from the cursor
 *
 * @remarks
 *
 *
 */

import {ActorNodeTriggerContext} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {BaseUserInputActorNode} from './_BaseUserInput';

const OUTPUT_NAME = 'ray';
class RayFromCursorActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new RayFromCursorActorParamsConfig();
export class RayFromCursorActorNode extends BaseUserInputActorNode<RayFromCursorActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.RAY_FROM_CURSOR;
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
		this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.RAY]);
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const pointerEventsController = this.scene().eventsDispatcher.pointerEventsController;
		const raycaster = pointerEventsController.raycaster();
		return raycaster.ray;
	}
}
