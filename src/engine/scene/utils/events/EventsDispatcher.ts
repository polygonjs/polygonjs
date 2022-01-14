import {Constructor} from '../../../../types/GlobalTypes';
import {PolyScene} from '../../PolyScene';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {MouseEventNode} from '../../../nodes/event/Mouse';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';
import {WindowEventNode} from '../../../nodes/event/Window';
import {BaseInputEventNodeType} from '../../../nodes/event/_BaseInput';

import {BaseSceneEventsController, BaseSceneEventsControllerClass} from './_BaseEventsController';
import {SceneEventsController} from './SceneEventsController';
import {DragEventsController} from './DragEventsController';
import {KeyboardEventsController} from './KeyboardEventsController';
import {MouseEventsController} from './MouseEventsController';
import {PointerEventsController} from './PointerEventsController';
import {WindowEventsController} from './WindowEventsController';
import {TouchEventsController} from './TouchEventsController';
import {DragEventNode} from '../../../nodes/event/Drag';
import {TouchEventNode} from '../../../nodes/event/Touch';

export class SceneEventsDispatcher {
	public readonly sceneEventsController = new SceneEventsController();
	private _keyboardEventsController: KeyboardEventsController | undefined;
	private _mouseEventsController: MouseEventsController | undefined;
	private _dragEventsController: DragEventsController | undefined;
	private _pointerEventsController: PointerEventsController | undefined;
	private _windowEventsController: WindowEventsController | undefined;
	private _touchEventsController: TouchEventsController | undefined;
	private _controllers: BaseSceneEventsController<Event, BaseInputEventNodeType>[] = [];
	constructor(public scene: PolyScene) {}

	registerEventNode(node: BaseInputEventNodeType) {
		const controller = this._findOrCreateControllerForNode(node);
		if (controller) {
			controller.registerNode(node);
		}
	}
	unregisterEventNode(node: BaseInputEventNodeType) {
		const controller = this._findOrCreateControllerForNode(node);
		if (controller) {
			controller.unregisterNode(node);
		}
	}
	updateViewerEventListeners(node: BaseInputEventNodeType) {
		const controller = this._findOrCreateControllerForNode(node);
		if (controller) {
			controller.updateViewerEventListeners();
		}
	}
	traverseControllers(callback: (controller: BaseSceneEventsController<Event, BaseInputEventNodeType>) => void) {
		for (let controller of this._controllers) {
			callback(controller);
		}
	}

	// processEvent(event_content: EventContext<Event>) {
	// 	if (!event_content.event) {
	// 		return;
	// 	}
	// 	for (let controller of this._controllers) {
	// 		if (controller.accepts_event(event_content.event)) {
	// 			controller.processEvent(event_content);
	// 			return;
	// 		}
	// 	}
	// }

	private _findOrCreateControllerForNode<T extends BaseEventNodeType>(
		node: T
	): BaseSceneEventsController<Event, BaseInputEventNodeType> | undefined {
		switch (node.type()) {
			case KeyboardEventNode.type():
				return this.keyboardEventsController;
			case MouseEventNode.type():
				return this.mouseEventsController;
			case DragEventNode.type():
				return this.dragEventsController;
			case PointerEventNode.type():
				return this.pointerEventsController;
			case TouchEventNode.type():
				return this.touchEventsController;
			case WindowEventNode.type():
				return this.windowEventsController;
		}
	}

	get keyboardEventsController() {
		return (this._keyboardEventsController =
			this._keyboardEventsController || this._createController(KeyboardEventsController));
	}
	get mouseEventsController() {
		return (this._mouseEventsController =
			this._mouseEventsController || this._createController(MouseEventsController));
	}
	get dragEventsController() {
		return (this._dragEventsController =
			this._dragEventsController || this._createController(DragEventsController));
	}
	get pointerEventsController() {
		return (this._pointerEventsController =
			this._pointerEventsController || this._createController(PointerEventsController));
	}
	get windowEventsController() {
		return (this._windowEventsController =
			this._windowEventsController || this._createController(WindowEventsController));
	}
	get touchEventsController() {
		return (this._touchEventsController =
			this._touchEventsController || this._createController(TouchEventsController));
	}
	private _createController<T extends BaseSceneEventsControllerClass>(eventConstructor: Constructor<T>): T {
		const controller = new eventConstructor(this);
		if (!this._controllers.includes(controller)) {
			this._controllers.push(controller);
		}
		return controller;
	}
}
