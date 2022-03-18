/**
 * outputs 1 of the 2 inputs based on a boolean input
 *
 *
 *
 */
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext, ParamlessTypedActorNode} from './_Base';

const OUTPUT_NAME = 'val';

export class OrActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'or';
	}

	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputName(index: number) {
		return 'booleans';
	}
	protected _expectedOutputName() {
		return OUTPUT_NAME;
	}
	protected _expectedInputTypes(): ActorConnectionPointType[] {
		return [ActorConnectionPointType.BOOLEAN_ARRAY];
	}
	protected _expectedOutputTypes() {
		return [ActorConnectionPointType.BOOLEAN];
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const booleanArray = this._inputValue<ActorConnectionPointType.BOOLEAN_ARRAY>(
			this._expectedInputName(0),
			context
		);
		let result = false;
		if (booleanArray.length > 1) {
			for (let elem of booleanArray) {
				result = result || elem;
			}
		}
		return result;
	}
}
