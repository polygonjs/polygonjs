import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';
import type {KeyboardEventActorNode} from '../actors/ActorsKeyboardEventsController';
import {ACCEPTED_KEYBOARD_EVENT_TYPES} from '../../../../core/event/KeyboardEventType';

export class KeyboardEventsController extends BaseSceneEventsController<
	KeyboardEvent,
	KeyboardEventNode,
	KeyboardEventActorNode
> {
	protected override _requireCanvasEventListeners: boolean = true;
	type() {
		return 'keyboard';
	}
	acceptedEventTypes() {
		return new Set(ACCEPTED_KEYBOARD_EVENT_TYPES.map((n) => `${n}`));
	}

	private _currentEvent: KeyboardEvent | undefined;
	currentEvent() {
		return this._currentEvent;
	}
	override processEvent(eventContext: EventContext<KeyboardEvent>) {
		super.processEvent(eventContext);

		const eventEmitter = eventContext.emitter;
		if (!eventEmitter) {
			return;
		}
		// if (this._actorEventNames.size == 0) {
		// 	return;
		// }
		const {viewer, event} = eventContext;
		if (!(event && viewer)) {
			return;
		}
		const eventType = event.type;
		const mapForEvent = this._actorNodesByEventNames.get(eventType);
		if (!mapForEvent) {
			return;
		}
		const nodesToTrigger = mapForEvent.get(eventEmitter);
		if (!nodesToTrigger) {
			return;
		}
		// if (!this._actorEventNames.has(eventType)) {
		// 	return;
		// }
		// const nodesToTrigger = this._actorNodesByEventNames.get(eventType);
		// if (nodesToTrigger) {
		this._currentEvent = eventContext.event;
		this.dispatcher.scene.actorsManager.keyboardEventsController.setTriggeredNodes(nodesToTrigger);
		// }
	}

	// protected override _actorEventDatas(): EventData[] | undefined {
	// 	const eventDatas: EventData[] = [];

	// 	this._actorEventNamesByNode.forEach((_, node) => {
	// 		const eventNames = node.userInputEventNames();
	// 		const emitter = EVENT_EMITTERS[node.pv.element];

	// 		for (let type of eventNames) {
	// 			const eventData: EventData = {
	// 				type,
	// 				emitter,
	// 			};
	// 			eventDatas.push(eventData);
	// 		}
	// 	});

	// 	return eventDatas;
	// }
}
