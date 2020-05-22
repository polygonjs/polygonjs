import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';

const OUTPUT_NAME = 'event';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
class NodeCookEventParamsConfig extends NodeParamsConfig {
	node = ParamConfig.OPERATOR_PATH('/geo1', {
		callback: (node: BaseNodeType) => {
			NodeCookEventNode.PARAM_CALLBACK_update_node(node as NodeCookEventNode);
		},
	});
}
const ParamsConfig = new NodeCookEventParamsConfig();

export class NodeCookEventNode extends TypedEventNode<NodeCookEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'node_cook';
	}

	private _resolved_node: BaseNodeType | undefined;

	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE),
		]);
	}

	process_event(event_context: EventContext<Event>) {
		this.dispatch_event_to_output(OUTPUT_NAME, event_context);
	}

	static PARAM_CALLBACK_update_node(node: NodeCookEventNode) {
		node._update_node();
	}
	private async _update_node() {
		if (this.p.node.is_dirty) {
			await this.p.node.compute();
		}
		const found_node = this.p.node.found_node();
		if (found_node) {
			this._resolved_node = found_node;
			this._resolved_node.cook_controller.add_on_cook_complete_hook(this, () => {
				this.dispatch_event_to_output(OUTPUT_NAME, {});
			});
		} else {
			if (this._resolved_node) {
				this._resolved_node.cook_controller.remove_on_cook_complete_hook(this);
			}
			this._resolved_node = undefined;
		}
	}
}
