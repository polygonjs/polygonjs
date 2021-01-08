import {Constructor} from '../../../../types/GlobalTypes';
import {PolyScene} from '../../PolyScene';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {MouseEventNode} from '../../../nodes/event/Mouse';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {SceneEventNode} from '../../../nodes/event/Scene';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';
import {BaseInputEventNodeType} from '../../../nodes/event/_BaseInput';

import {BaseSceneEventsController, BaseSceneEventsControllerClass} from './_BaseEventsController';
import {SceneEventsController} from './SceneEventsController';
import {KeyboardEventsController} from './KeyboardEventsController';
import {MouseEventsController} from './MouseEventsController';
import {PointerEventsController} from './PointerEventsController';

export class SceneEventsDispatcher {
	private _keyboard_events_controller: KeyboardEventsController | undefined;
	private _mouse_events_controller: MouseEventsController | undefined;
	private _pointer_events_controller: PointerEventsController | undefined;
	private _scene_events_controller: SceneEventsController | undefined;
	private _controllers: BaseSceneEventsController<Event, BaseInputEventNodeType>[] = [];
	constructor(public scene: PolyScene) {}

	registerEventNode(node: BaseInputEventNodeType) {
		const controller = this._find_or_create_controller_for_node(node);
		if (controller) {
			controller.registerNode(node);
		}
	}
	unregisterEventNode(node: BaseInputEventNodeType) {
		const controller = this._find_or_create_controller_for_node(node);
		if (controller) {
			controller.unregisterNode(node);
		}
	}
	updateViewerEventListeners(node: BaseInputEventNodeType) {
		const controller = this._find_or_create_controller_for_node(node);
		if (controller) {
			controller.updateViewerEventListeners();
		}
	}
	traverseControllers(callback: (controller: BaseSceneEventsController<Event, BaseInputEventNodeType>) => void) {
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
				return this.keyboardEventsController;
			case MouseEventNode.type():
				return this.mouseEventsController;
			case PointerEventNode.type():
				return this.pointerEventsController;
			case SceneEventNode.type():
				return this.sceneEventsController;
		}
	}

	get keyboardEventsController() {
		return (this._keyboard_events_controller =
			this._keyboard_events_controller || this._create_controller(KeyboardEventsController));
	}
	get mouseEventsController() {
		return (this._mouse_events_controller =
			this._mouse_events_controller || this._create_controller(MouseEventsController));
	}
	get pointerEventsController() {
		return (this._pointer_events_controller =
			this._pointer_events_controller || this._create_controller(PointerEventsController));
	}
	get sceneEventsController() {
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
