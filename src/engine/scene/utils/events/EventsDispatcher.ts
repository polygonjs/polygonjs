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
// import {BaseUserInputJsNodeType} from '../../../nodes/js/_BaseUserInput';
// import {JsType} from '../../../poly/registers/nodes/types/Js';
import {Raycaster} from 'three';
import {ActorEvaluatorGenerator} from '../../../nodes/js/code/assemblers/actor/ActorEvaluatorGenerator';
import {JsType} from '../../../poly/registers/nodes/types/Js';

export class SceneEventsDispatcher {
	public readonly sceneEventsController = new SceneEventsController();
	private _keyboardEventsController?: KeyboardEventsController;
	private _mouseEventsController?: MouseEventsController;
	private _dragEventsController?: DragEventsController;
	private _pointerEventsController?: PointerEventsController;
	private _windowEventsController?: WindowEventsController;
	private _touchEventsController?: TouchEventsController;
	private _controllers: BaseSceneEventsController<Event, BaseInputEventNodeType>[] = [];
	constructor(public scene: PolyScene) {}

	registerEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		const controllers = this._findOrCreateControllerForEvaluator(evaluatorGenerator);
		if (controllers) {
			controllers.forEach((c) => c.registerEvaluatorGenerator(evaluatorGenerator));
		}
	}
	unregisterEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		const controllers = this._findOrCreateControllerForEvaluator(evaluatorGenerator);
		if (controllers) {
			controllers.forEach((c) => c.unregisterEvaluatorGenerator(evaluatorGenerator));
		}
	}
	// updateControllersFromJsNodes() {
	// 	const eventDatas = this.scene.actorsManager.eventDatas();
	// 	eventDatas.forEach((type) => {
	// 		this._findOrCreateControllerForEventInputType(type);
	// 	});
	// }

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
	traverseControllers(callback: (controller: BaseSceneEventsController<Event, BaseInputEventNodeType>) => void) {
		for (const controller of this._controllers) {
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
	): BaseSceneEventsController<Event, BaseInputEventNodeType> | undefined {
		return this._findOrCreateControllerForEventInputType(node.type() as EventInputType);
	}

	private _findOrCreateControllerForEvaluator(
		evaluator: ActorEvaluatorGenerator
	): Set<BaseSceneEventsController<Event, BaseInputEventNodeType>> | undefined {
		const eventDatas = evaluator.eventDatas;
		if (!eventDatas) {
			return;
		}
		const controllers: Set<BaseSceneEventsController<Event, BaseInputEventNodeType>> = new Set();
		eventDatas.forEach((eventData) => {
			const controller = this._findOrCreateControllerForJsType(eventData.jsType);
			if (controller) {
				controllers.add(controller);
			}
		});

		return controllers;
	}
	private _findOrCreateControllerForEventInputType(
		type: EventInputType
	): BaseSceneEventsController<Event, BaseInputEventNodeType> | undefined {
		switch (type) {
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
	private _findOrCreateControllerForJsType(
		jsType: JsType
	): BaseSceneEventsController<Event, BaseInputEventNodeType> | undefined {
		switch (jsType) {
			case JsType.CURSOR:
			case JsType.ON_OBJECT_CLICK:
			case JsType.ON_OBJECT_CONTEXT_MENU:
			case JsType.ON_OBJECT_HOVER:
			case JsType.ON_OBJECT_LONG_PRESS:
			case JsType.ON_OBJECT_POINTERDOWN:
			case JsType.ON_OBJECT_POINTERUP:
			case JsType.ON_POINTERDOWN:
			case JsType.ON_POINTERUP:
			case JsType.RAY_FROM_CURSOR:
				return this.pointerEventsController;
			case JsType.ON_KEY:
			case JsType.ON_KEYDOWN:
			case JsType.ON_KEYPRESS:
			case JsType.ON_KEYUP:
				return this.keyboardEventsController;
		}
		console.warn(`no event controller defined for jsType`, jsType);
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
