import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import gsap from 'gsap';

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
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {AnimationContainer} from '../../containers/Animation';
class AnimationEventParamsConfig extends NodeParamsConfig {
	animation = ParamConfig.OPERATOR_PATH('/ANIM/OUT', {
		node_selection: {context: NodeContext.ANIM},
		dependent_on_found_node: false,
	});
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimationEventNode.PARAM_CALLBACK_play(node as AnimationEventNode);
		},
	});
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimationEventNode.PARAM_CALLBACK_pause(node as AnimationEventNode);
		},
	});
}
const ParamsConfig = new AnimationEventParamsConfig();

export class AnimationEventNode extends TypedEventNode<AnimationEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'animate';
	}

	private _timeline_builder: TimelineBuilder | undefined;

	// private _resolved_anim_node: BaseAnimNodeType | undefined;
	// private _resolved_object_node: BaseObjNodeType | undefined;

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(AnimationEventInput.START, EventConnectionPointType.BASE, this._play.bind(this)),
			new EventConnectionPoint(AnimationEventInput.STOP, EventConnectionPointType.BASE, this._pause.bind(this)),
			// new EventConnectionPoint(
			// 	AnimationEventInput.UPDATE,
			// 	EventConnectionPointType.BASE,
			// 	this._update_animation.bind(this)
			// ),
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

	static PARAM_CALLBACK_play(node: AnimationEventNode) {
		node._play();
	}
	static PARAM_CALLBACK_pause(node: AnimationEventNode) {
		node._pause();
	}

	private async _play() {
		const param = this.p.animation;
		if (param.is_dirty) {
			await param.compute();
		}
		const node = param.found_node_with_context(NodeContext.ANIM);
		if (!node) {
			return;
		}
		let container: AnimationContainer | undefined;
		if (node.is_dirty) {
			container = await node.request_container();
		}
		if (!container) {
			return;
		}
		this._timeline_builder = container.core_content();
		if (!this._timeline_builder) {
			return;
		}
		const timeline = gsap.timeline();

		this._timeline_builder.populate(timeline, this.scene);

		timeline.vars.onComplete = () => {
			timeline.kill();
		};

		// single tween test
		// const object = this.scene.default_scene.children[0].children[0];
		// gsap.to(object.position, {
		// 	duration: 1,
		// 	x: object.position.x + 1,
		// 	z: object.position.z + 1,
		// 	ease: 'power2.out',
		// });
		// gsap.to(object.position, {
		// 	duration: 1,
		// 	z: object.position.z + 1,
		// });

		// timeline test
		// const object = this.scene.default_scene.children[0].children[0];
		// console.log(object);
		// const t2 = gsap.timeline();
		// // t2.pause();
		// t2.to(object.position, {duration: 1, y: object.position.y + 1, ease: 'power2.out'});
		// t2.to(object.scale, {duration: 1, z: object.scale.z + 1, ease: 'power2.out'}, 0);

		// const t1 = gsap.timeline();
		// t1.to(object.position, {duration: 1, x: object.position.x + 1, ease: 'power2.out'});
		// t1.to(object.rotation, {duration: 1, y: object.rotation.y + Math.PI, ease: 'power2.out'}, 0);

		// const timeline = gsap.timeline({
		// 	onComplete: () => {
		// 		console.log('timeline completed');
		// 	},
		// });
		// timeline.add(t1);
		// timeline.add(t2);

		// stagger test
		// const objects = this.scene.default_scene.children[0].children[1].children[1].children;
		// console.log(objects);
		// gsap.to(
		// 	objects.map((o) => o.position),
		// 	{
		// 		duration: 1,
		// 		y: objects[0].position.y + 1,
		// 		stagger: 0.02,
		// 	}
		// );
	}
	private _pause() {}

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
