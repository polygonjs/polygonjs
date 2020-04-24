import {TypedEventNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {BaseNodeType} from '../_Base';
import lodash_min from 'lodash/min';
import lodash_max from 'lodash/max';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {NodeContext} from '../../poly/NodeContext';
import {TransformAnimNode} from '../anim/Transform';
import {AnimationsObjNode} from '../obj/Animations';

const OUTPUT_NAME = 'done';

class AnimationMultiCacheEventParamsConfig extends NodeParamsConfig {
	animation_network = ParamConfig.OPERATOR_PATH('/ANIM', {
		node_selection: {
			context: NodeContext.OBJ,
			type: AnimationsObjNode.type(),
		},
		dependent_on_found_node: false,
	});
	cache = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimationMultiCacheEventNode.PARAM_CALLBACK_cache(node as AnimationMultiCacheEventNode);
		},
	});
}
const ParamsConfig = new AnimationMultiCacheEventParamsConfig();

export class AnimationMultiCacheEventNode extends TypedEventNode<AnimationMultiCacheEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'animation_transform';
	}
	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.inputs.set_named_input_connection_points([
			new TypedNamedConnectionPoint('trigger', ConnectionPointType.BOOL),
		]);
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointType.BOOL),
		]);
	}

	process_event(event_context: EventContext<Event>) {
		this.cache();
	}

	static PARAM_CALLBACK_cache(node: AnimationMultiCacheEventNode) {
		node.cache();
	}
	private async cache() {
		if (this.p.animation_network.is_dirty) {
			await this.p.animation_network.compute();
		}

		const node = this.p.animation_network.found_node_with_context_and_type(
			NodeContext.OBJ,
			AnimationsObjNode.type()
		);
		if (!node) {
			console.log('node not found');
			return;
		}
		const transform_anim_nodes = node.nodes_by_type(TransformAnimNode.type());

		const range = this._frame_range(transform_anim_nodes);
		for (let node of transform_anim_nodes) {
			await node.init_cache();
		}
		for (let i = range[0]; i <= range[1]; i++) {
			this.scene.set_frame(i);
			for (let node of transform_anim_nodes) {
				await node.cache_current_frame();
			}
		}
		for (let node of transform_anim_nodes) {
			node.create_clip_from_cached_frames();
		}

		this.dispatch_event_to_output(OUTPUT_NAME, {});
	}

	private _frame_range(transform_anim_nodes: TransformAnimNode[]): Number2 {
		const start_frame = lodash_min(transform_anim_nodes.map((n) => n.pv.start_frame)) || 0;
		const end_frame = lodash_max(transform_anim_nodes.map((n) => n.pv.end_frame)) || 0;
		return [start_frame, end_frame];
	}
}
