import {PolyScene} from '../../PolyScene';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {MouseEventNode} from '../../../nodes/event/MouseEvent';
import {MouseEventsController} from './MouseEventsController';
import {BaseEventsController, EventContext} from './_BaseEventsController';

export class SceneEventsController {
	private _mouse_events_controller: BaseEventsController<MouseEvent, MouseEventNode> = new MouseEventsController();
	private _controllers: BaseEventsController<Event, BaseEventNodeType>[] = [this._mouse_events_controller];
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
		}
	}
}
