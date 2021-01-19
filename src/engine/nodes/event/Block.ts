/**
 * Blocks incoming envetts
 *
 * @remarks
 * This can be useful to debug events, to prevents incoming events to be propagatted further.
 *
 *
 */
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class BlockParamsConfig extends NodeParamsConfig {
	/** @param toggle on to block incoming events */
	blocking = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new BlockParamsConfig();

export class BlockEventNode extends TypedEventNode<BlockParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'block';
	}
	static readonly OUTPUT = 'output';

	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('in', EventConnectionPointType.BASE, this._process_incoming_event.bind(this)),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(BlockEventNode.OUTPUT, EventConnectionPointType.BASE),
		]);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.blocking], () => {
					return this.pv.blocking ? 'blocking (X)' : 'pass-through (-->)';
				});
			});
		});
	}

	private trigger_output(context: EventContext<MouseEvent>) {
		this.dispatch_event_to_output(BlockEventNode.OUTPUT, context);
	}

	private _process_incoming_event(context: EventContext<MouseEvent>) {
		if (!this.pv.blocking) {
			this.trigger_output(context);
		}
	}
}
