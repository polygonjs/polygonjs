import {Constructor} from '../../../../types/GlobalTypes';
import {PolyScene} from '../../PolyScene';
import {BaseEventNodeType} from '../../../nodes/event/_Base';
import {BaseInputEventNodeType} from '../../../nodes/event/_BaseInput';
import {BaseSceneEventsController, BaseSceneEventsControllerClass} from './_BaseEventsController';
import {SceneEventsController} from './SceneEventsController';
import {DragEventsController} from './DragEventsController';
import {KeyboardEventsController} from './KeyboardEventsController';
import {MouseEventsController} from './MouseEventsController';
import {PointerEventsController} from './PointerEventsController';
import {WindowEventsController} from './WindowEventsController';
import {TouchEventsController} from './TouchEventsController';

import {SceneConnectionTriggerDispatcher} from './ConnectionTriggerDispatcher';
import {EventInputType} from '../../../poly/registers/nodes/types/Event';
import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';
import {ActorType} from '../../../poly/registers/nodes/types/Actor';
import {Raycaster} from 'three';

export class SceneEventsDispatcher {
	public readonly sceneEventsController = new SceneEventsController();
	private _keyboardEventsController: KeyboardEventsController | undefined;
	private _mouseEventsController: MouseEventsController | undefined;
	private _dragEventsController: DragEventsController | undefined;
	private _pointerEventsController: PointerEventsController | undefined;
	private _windowEventsController: WindowEventsController | undefined;
	private _touchEventsController: TouchEventsController | undefined;
	private _controllers: BaseSceneEventsController<Event, BaseInputEventNodeType, BaseUserInputActorNodeType>[] = [];
	constructor(public scene: PolyScene) {}

	registerActorNode(node: BaseUserInputActorNodeType) {
		const controller = this._findOrCreateControllerForActorNode(node);
		if (controller) {
			controller.registerActorNode(node);
		}
	}
	unregisterActorNode(node: BaseUserInputActorNodeType) {
		const controller = this._findOrCreateControllerForActorNode(node);
		if (controller) {
			controller.unregisterActorNode(node);
		}
	}

	registerEventNode(node: BaseInputEventNodeType) {
		const controller = this._findOrCreateControllerForEventNode(node);
		if (controller) {
			controller.registerEventNode(node);
		}
	}
	unregisterEventNode(node: BaseInputEventNodeType) {
		const controller = this._findOrCreateControllerForEventNode(node);
		if (controller) {
			controller.unregisterEventNode(node);
		}
	}
	updateViewerEventListeners(node: BaseInputEventNodeType) {
		const controller = this._findOrCreateControllerForEventNode(node);
		if (controller) {
			controller.updateViewerEventListeners();
		}
	}
	traverseControllers(
		callback: (
			controller: BaseSceneEventsController<Event, BaseInputEventNodeType, BaseUserInputActorNodeType>
		) => void
	) {
		for (let controller of this._controllers) {
			callback(controller);
		}
	}

	setRaycaster(raycaster: Raycaster) {
		// giving a raycaster here is useful to still benefit from mouse events, even if not viewer has been created
		this.pointerEventsController.setRaycaster(raycaster);
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

	private _findOrCreateControllerForEventNode<T extends BaseEventNodeType>(
		node: T
	): BaseSceneEventsController<Event, BaseInputEventNodeType, BaseUserInputActorNodeType> | undefined {
		switch (node.type()) {
			case EventInputType.KEYBOARD:
				return this.keyboardEventsController;
			case EventInputType.MOUSE:
				return this.mouseEventsController;
			case EventInputType.DRAG:
				return this.dragEventsController;
			case EventInputType.POINTER:
				return this.pointerEventsController;
			case EventInputType.TOUCH:
				return this.touchEventsController;
			case EventInputType.WINDOW:
				return this.windowEventsController;
		}
	}
	private _findOrCreateControllerForActorNode<T extends BaseUserInputActorNodeType>(
		node: T
	): BaseSceneEventsController<Event, BaseInputEventNodeType, BaseUserInputActorNodeType> | undefined {
		switch (node.type()) {
			case ActorType.CURSOR:
			case ActorType.ON_OBJECT_CLICK:
			case ActorType.ON_OBJECT_HOVER:
			case ActorType.ON_OBJECT_POINTERDOWN:
			case ActorType.ON_OBJECT_POINTERUP:
			case ActorType.ON_POINTERDOWN:
			case ActorType.ON_POINTERUP:
			case ActorType.RAY_FROM_CURSOR:
				return this.pointerEventsController;
			case ActorType.ON_KEYDOWN:
			case ActorType.ON_KEYPRESS:
			case ActorType.ON_KEYUP:
			case ActorType.ON_PLAYER_EVENT:
				return this.keyboardEventsController;
		}
		console.warn(`no event controller defined for node`, node);
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
	get pointerEventsController(): PointerEventsController {
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

	private _connectionTriggerDispatcher: SceneConnectionTriggerDispatcher | undefined;
	get connectionTriggerDispatcher() {
		return (this._connectionTriggerDispatcher =
			this._connectionTriggerDispatcher || new SceneConnectionTriggerDispatcher());
	}
}
