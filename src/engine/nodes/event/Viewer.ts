/**
 * Activates events for the viewer
 *
 * @param
 * For instance, this can be useful after a raycast node to set an 'active' class on the html canvas, so that the cursor reflect what the mouse is hovering over.
 *
 */
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class ViewerParamsConfig extends NodeParamsConfig {
	/** @param sets the class of the viewer */
	class_name = ParamConfig.STRING('active');
}
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
			canvas.classList.add(this.pv.class_name);
		}
	}

	private _process_trigger_unset(context: EventContext<MouseEvent>) {
		const canvas = context.canvas;
		if (canvas) {
			canvas.classList.remove(this.pv.class_name);
		}
	}
}
