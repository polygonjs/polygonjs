import {PolyScene} from '../../PolyScene';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {MouseEventNode} from '../../../nodes/event/Mouse';
import {SceneEventNode} from '../../../nodes/event/Scene';
import {MouseEventsController} from './MouseEventsController';
import {SceneEventsController} from './SceneEventsController';
import {BaseSceneEventsController, BaseSceneEventsControllerClass} from './_BaseEventsController';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';
import {KeyboardEventsController} from './KeyboardEventsController';
import {BaseInputEventNodeType} from '../../../nodes/event/_BaseInput';

export class SceneEventsDispatcher {
	private _keyboard_events_controller: KeyboardEventsController | undefined;
	private _mouse_events_controller: MouseEventsController | undefined;
	private _scene_events_controller: SceneEventsController | undefined;
	private _controllers: BaseSceneEventsController<Event, BaseInputEventNodeType>[] = [];
	constructor(public scene: PolyScene) {}

	register_event_node(node: BaseInputEventNodeType) {
		const controller = this._find_or_create_controller_for_node(node);
		if (controller) {
			controller.register_node(node);
		}
	}
	unregister_event_node(node: BaseInputEventNodeType) {
		const controller = this._find_or_create_controller_for_node(node);
		if (controller) {
			controller.unregister_node(node);
		}
	}
	update_viewer_event_listeners(node: BaseInputEventNodeType) {
		const controller = this._find_or_create_controller_for_node(node);
		if (controller) {
			controller.update_viewer_event_listeners();
		}
	}
	traverse_controllers(callback: (controller: BaseSceneEventsController<Event, BaseInputEventNodeType>) => void) {
		for (let controller of this._controllers) {
			callback(controller);
		}
	}

	// process_event(event_content: EventContext<Event>) {
	// 	if (!event_content.event) {
	// 		return;
	// 	}
	// 	for (let controller of this._controllers) {
	// 		if (controller.accepts_event(event_content.event)) {
	// 			controller.process_event(event_content);
	// 			return;
	// 		}
	// 	}
	// }

	private _find_or_create_controller_for_node<T extends BaseEventNodeType>(
		node: T
	): BaseSceneEventsController<Event, BaseInputEventNodeType> | undefined {
		switch (node.type) {
			case KeyboardEventNode.type():
				return this.keyboard_events_controller;
			case MouseEventNode.type():
				return this.mouse_events_controller;
			case SceneEventNode.type():
				return this.scene_events_controller;
		}
	}

	get keyboard_events_controller() {
		return (this._keyboard_events_controller =
			this._keyboard_events_controller || this._create_controller(KeyboardEventsController));
	}
	get mouse_events_controller() {
		return (this._mouse_events_controller =
			this._mouse_events_controller || this._create_controller(MouseEventsController));
	}
	get scene_events_controller() {
		return (this._scene_events_controller =
			this._scene_events_controller || this._create_controller(SceneEventsController));
	}
	private _create_controller<T extends BaseSceneEventsControllerClass>(event_constructor: Constructor<T>): T {
		const controller = new event_constructor(this);
		if (!this._controllers.includes(controller)) {
			this._controllers.push(controller);
		}
		return controller;
	}
}
