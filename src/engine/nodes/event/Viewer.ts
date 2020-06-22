import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class ViewerParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ViewerParamsConfig();

export class ViewerEventNode extends TypedEventNode<ViewerParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'viewer';
	}

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint('set', EventConnectionPointType.BASE, this._process_trigger_set.bind(this)),
			new EventConnectionPoint('unset', EventConnectionPointType.BASE, this._process_trigger_unset.bind(this)),
		]);
	}

	private _process_trigger_set(context: EventContext<MouseEvent>) {
		const canvas = context.canvas;
		if (canvas) {
			canvas.style.cursor = 'pointer';
		}
	}

	private _process_trigger_unset(context: EventContext<MouseEvent>) {
		const canvas = context.canvas;
		if (canvas) {
			canvas.style.cursor = 'auto';
		}
	}
}
