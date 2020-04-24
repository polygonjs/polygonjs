import {PolyScene} from '../../PolyScene';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {MouseEventNode} from '../../../nodes/event/MouseEvent';
import {SceneEventNode} from '../../../nodes/event/SceneEvent';
import {MouseEventsController} from './MouseEventsController';
import {SceneEventsController} from './SceneEventsController';
import {BaseEventsController, EventContext} from './_BaseEventsController';

export class SceneEventsDispatcher {
	private _mouse_events_controller: BaseEventsController<MouseEvent, MouseEventNode> = new MouseEventsController();
	private _scene_events_controller: BaseEventsController<Event, SceneEventNode> = new SceneEventsController();
	private _controllers: BaseEventsController<Event, BaseEventNodeType>[] = [
		this._mouse_events_controller,
		this._scene_events_controller,
	];
	constructor(scene: PolyScene) {}

	register_event_node(node: BaseEventNodeType) {
		const controller = this._get_controller_for_node(node);
		if (controller) {
			controller.register_node(node);
		}
	}
	unregister_event_node(node: BaseEventNodeType) {
		const controller = this._get_controller_for_node(node);
		if (controller) {
			controller.unregister_node(node);
		}
	}

	process_event(event_content: EventContext<Event>) {
		if (!event_content.event) {
			return;
		}
		for (let controller of this._controllers) {
			if (controller.accepts_event(event_content.event)) {
				controller.process(event_content);
				return;
			}
		}
	}

	private _get_controller_for_node<T extends BaseEventNodeType>(
		node: T
	): BaseEventsController<Event, BaseEventNodeType> | undefined {
		switch (node.type) {
			case MouseEventNode.type():
				return this._mouse_events_controller;
			case SceneEventNode.type():
				return this._scene_events_controller;
		}
	}
}
