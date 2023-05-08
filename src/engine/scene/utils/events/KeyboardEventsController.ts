import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';
// import type {KeyboardEventActorNode} from '../actors/ActorsKeyboardEventsController';
import {ACCEPTED_KEYBOARD_EVENT_TYPES, KeyboardEventType} from '../../../../core/event/KeyboardEventType';
import {SceneEventsDispatcher} from './EventsDispatcher';
import {TimeController} from '../TimeController';
// import {TimeController} from '../TimeController';
import {ActorKeyboardEventsController} from '../actors/ActorsKeyboardEventsController';
import {EvaluatorKeyboardMethod} from '../../../nodes/js/code/assemblers/actor/ActorEvaluator';
import {JsType} from '../../../poly/registers/nodes/types/Js';

const methodNameByEventType: Record<KeyboardEventType, EvaluatorKeyboardMethod[]> = {
	[KeyboardEventType.keydown]: [JsType.ON_KEY, JsType.ON_KEYDOWN],
	[KeyboardEventType.keypress]: [JsType.ON_KEYPRESS],
	[KeyboardEventType.keyup]: [JsType.ON_KEY, JsType.ON_KEYUP],
};

export class KeyboardEventsController extends BaseSceneEventsController<
	KeyboardEvent,
	KeyboardEventNode
	// KeyboardEventActorNode
> {
	private timeController: TimeController;
	private keyboardEventsController: ActorKeyboardEventsController;
	constructor(dispatcher: SceneEventsDispatcher) {
		super(dispatcher);
		this.timeController = this.dispatcher.scene.timeController;
		this.keyboardEventsController = this.dispatcher.scene.actorsManager.keyboardEventsController;
	}

	protected override _requireCanvasEventListeners: boolean = true;
	type() {
		return 'keyboard';
	}
	acceptedEventTypes() {
		return new Set(ACCEPTED_KEYBOARD_EVENT_TYPES.map((n) => `${n}`));
	}

	private _currentEvents: KeyboardEvent[] = [];
	private _lastProcessedFrame = -1;
	currentEvents() {
		return this._currentEvents;
	}
	override processEvent(eventContext: EventContext<KeyboardEvent>) {
		super.processEvent(eventContext);

		// const eventEmitter = eventContext.emitter;
		// if (!eventEmitter) {
		// 	return;
		// }

		const {event} = eventContext;
		if (!event) {
			return;
		}
		const eventType = event.type as KeyboardEventType;

		const mapForEvent = this._actorEvaluatorsByEventNames.get(eventType);
		if (!mapForEvent) {
			return;
		}

		if (this.timeController.playing()) {
			const frame = this.timeController.frame();
			if (frame != this._lastProcessedFrame) {
				this._lastProcessedFrame = frame;
				this._currentEvents.length = 0;
			}
			this._currentEvents.push(event);
			// this.keyboardEventsController.setTriggeredNodes(nodesToTrigger);
		} else {
			this._currentEvents[0] = event;
		}

		const eventEmitter = eventContext.emitter;
		if (!eventEmitter) {
			return;
		}
		const evaluatorGenerators = mapForEvent.get(eventEmitter);
		if (!evaluatorGenerators) {
			return;
		}
		const methodNames = methodNameByEventType[eventType];
		if (!methodNames) {
			return;
		}
		for (let methodName of methodNames) {
			this.keyboardEventsController.addTriggeredEvaluators(evaluatorGenerators, methodName);
		}
		// evaluatorGenerators.forEach((evaluatorGenerator) => {
		// 	this.keyboardEventsController.setTriggeredNodes(nodesToTrigger);
		// 	// evaluatorGenerator.traverseEvaluator((evaluator) => {
		// 	// 	if (evaluator[methodName]) {
		// 	// 		evaluator[methodName]!();
		// 	// 	}
		// 	// });
		// });

		// const eventType = event.type;
		// // const mapForEvent = this._actorNodesByEventNames.get(eventType);
		// // if (!mapForEvent) {
		// // 	return;
		// // }
		// // const nodesToTrigger = mapForEvent.get(eventEmitter);
		// // if (!nodesToTrigger) {
		// // 	return;
		// // }
	}
}
