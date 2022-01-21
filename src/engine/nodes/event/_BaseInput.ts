import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ParamOptions} from '../../params/utils/OptionsController';
import {BaseNodeType} from '../_Base';
import {EVENT_EMITTERS, CoreEventEmitter} from '../../viewers/utils/EventsController';

export interface EventData {
	type: string;
	emitter: CoreEventEmitter;
}

export const EVENT_PARAM_OPTIONS: ParamOptions = {
	visibleIf: {active: 1},
	callback: (node: BaseNodeType) => {
		BaseInputEventNodeClass.PARAM_CALLBACK_updateRegister(node as BaseInputEventNodeType);
	},
};

export abstract class TypedInputEventNode<K extends BaseInputEventParamsConfig> extends TypedEventNode<K> {
	initializeBaseNode() {
		super.initializeBaseNode();

		const register = () => {
			this.scene().eventsDispatcher.registerEventNode(this);
		};
		const unregister = () => {
			this.scene().eventsDispatcher.unregisterEventNode(this);
		};
		this.lifecycle.onAfterAdded(register);
		// this.lifecycle.add_on_creation_completed_hook(register);
		this.lifecycle.onBeforeDeleted(unregister);

		this.params.onParamsCreated('update_register', () => {
			this._updateRegister();
		});
	}

	processEvent(eventContext: EventContext<Event>) {
		if (!this.pv.active) {
			return;
		}
		if (!eventContext.event) {
			return;
		}

		this.dispatchEventToOutput(eventContext.event.type, eventContext);
	}

	static PARAM_CALLBACK_updateRegister(node: BaseInputEventNodeType) {
		node._updateRegister();
	}
	private _updateRegister() {
		this._updateActiveEventDatas();
		this.scene().eventsDispatcher.updateViewerEventListeners(this);
	}

	private _activeEventDatas: EventData[] = [];
	private _updateActiveEventDatas() {
		this._activeEventDatas = [];
		if (this.pv.active) {
			const list = this.acceptedEventTypes();
			list.forEach((name) => {
				const param = this.params.get(name);
				if (param && param.value) {
					this._activeEventDatas.push({type: name, emitter: EVENT_EMITTERS[this.pv.element]});
				}
			});
		}
	}
	protected abstract acceptedEventTypes(): Set<string>;
	activeEventDatas() {
		return this._activeEventDatas;
	}
}

class BaseInputEventParamsConfig extends NodeParamsConfig {
	active = ParamConfig.BOOLEAN(true);
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(0, {
		menu: {
			entries: EVENT_EMITTERS.map((name, value) => {
				return {name, value};
			}),
		},
		separatorAfter: true,
	});
}

export type BaseInputEventNodeType = TypedInputEventNode<BaseInputEventParamsConfig>;
export class BaseInputEventNodeClass extends TypedInputEventNode<BaseInputEventParamsConfig> {
	acceptedEventTypes() {
		return new Set<string>();
	}
}
