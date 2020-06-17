import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {gsap} from 'gsap';
import {PluginRegister} from '../../../core/animation/GSAPPlugin';
PluginRegister.register_if_required();

enum AnimationEventInput {
	START = 'start',
	STOP = 'stop',
	UPDATE = 'update',
}
enum AnimationEventOutput {
	START = 'start',
	STOP = 'stop',
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AnimateEventParamsConfig extends NodeParamsConfig {
	object = ParamConfig.OPERATOR_PATH('/geo1', {
		node_selection: {context: NodeContext.OBJ},
		dependent_on_found_node: false,
	});
	start = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimateEventNode.PARAM_CALLBACK_start_animation(node as AnimateEventNode);
		},
	});
	stop = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimateEventNode.PARAM_CALLBACK_stop_animation(node as AnimateEventNode);
		},
	});
	animation = ParamConfig.OPERATOR_PATH('/ANIM/OUT', {
		node_selection: {context: NodeContext.ANIM},
		dependent_on_found_node: false,
	});
}
const ParamsConfig = new AnimateEventParamsConfig();

export class AnimateEventNode extends TypedEventNode<AnimateEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'animate';
	}

	// private _resolved_anim_node: BaseAnimNodeType | undefined;
	// private _resolved_object_node: BaseObjNodeType | undefined;

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(
				AnimationEventInput.START,
				EventConnectionPointType.BASE,
				this._start_animation.bind(this)
			),
			new EventConnectionPoint(
				AnimationEventInput.STOP,
				EventConnectionPointType.BASE,
				this._stop_animation.bind(this)
			),
			new EventConnectionPoint(
				AnimationEventInput.UPDATE,
				EventConnectionPointType.BASE,
				this._update_animation.bind(this)
			),
		]);

		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(AnimationEventOutput.START, EventConnectionPointType.BASE),
			new EventConnectionPoint(AnimationEventOutput.STOP, EventConnectionPointType.BASE),
		]);
	}
	// cook() {
	// 	console.warn('cook');
	// 	this._update_object_node();
	// 	this._update_animation_node();

	// 	this.cook_controller.end_cook();
	// }

	process_event(event_context: EventContext<Event>) {
		// this.dispatch_event_to_output(OUTPUT_NAME, event_context);
	}

	static PARAM_CALLBACK_start_animation(node: AnimateEventNode) {
		node._start_animation();
	}
	static PARAM_CALLBACK_stop_animation(node: AnimateEventNode) {
		node._stop_animation();
	}

	private _start_animation() {
		const object = this.scene.default_scene.children[0].children[0];
		gsap.to(object.position, {
			duration: 1,
			x: object.position.x + 1,
			z: object.position.z + 1,
			ease: 'power2.out',
		});
		// gsap.to(object.position, {
		// 	duration: 1,
		// 	z: object.position.z + 1,
		// });
	}
	private _stop_animation() {}
	private _update_animation() {}

	// private async _update_animation_node() {
	// 	const param = this.p.animation;
	// 	console.log('param animation', param);
	// 	if (param.is_dirty) {
	// 		await param.compute();
	// 	}
	// 	this._resolved_anim_node = param.found_node_with_context(NodeContext.ANIM);
	// }
	// private async _update_object_node() {
	// 	const param = this.p.object;
	// 	console.log('param object', param);
	// 	if (param.is_dirty) {
	// 		await param.compute();
	// 	}
	// 	this._resolved_object_node = param.found_node_with_context(NodeContext.OBJ);
	// }
}
