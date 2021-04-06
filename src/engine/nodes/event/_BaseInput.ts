import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamOptions} from '../../params/utils/OptionsController';
import {BaseNodeType} from '../_Base';

export const EVENT_PARAM_OPTIONS: ParamOptions = {
	visibleIf: {active: 1},
	callback: (node: BaseNodeType) => {
		BaseInputEventNodeClass.PARAM_CALLBACK_updateRegister(node as BaseInputEventNodeType);
	},
};

export abstract class TypedInputEventNode<K extends NodeParamsConfig> extends TypedEventNode<K> {
	initializeBaseNode() {
		super.initializeBaseNode();

		const register = () => {
			this.scene().eventsDispatcher.registerEventNode(this);
		};
		const unregister = () => {
			this.scene().eventsDispatcher.unregisterEventNode(this);
		};
		this.lifecycle.add_on_add_hook(register);
		// this.lifecycle.add_on_creation_completed_hook(register);
		this.lifecycle.add_delete_hook(unregister);

		this.params.onParamsCreated('update_register', () => {
			this._updateRegister();
		});
	}

	processEvent(event_context: EventContext<Event>) {
		if (!this.pv.active) {
			return;
		}
		if (!event_context.event) {
			return;
		}
		this.dispatchEventToOutput(event_context.event.type, event_context);
	}

	static PARAM_CALLBACK_updateRegister(node: BaseInputEventNodeType) {
		node._updateRegister();
	}
	private _updateRegister() {
		this._updateActiveEventNames();
		this.scene().eventsDispatcher.updateViewerEventListeners(this);
	}

	private _activeEventNames: string[] = [];
	private _updateActiveEventNames() {
		this._activeEventNames = [];
		if (this.pv.active) {
			const list = this.acceptedEventTypes();
			for (let name of list) {
				const param = this.params.get(name);
				if (param && param.value) {
					this._activeEventNames.push(name);
				}
			}
		}
	}
	protected abstract acceptedEventTypes(): string[];
	activeEventNames() {
		return this._activeEventNames;
	}
}

export type BaseInputEventNodeType = TypedInputEventNode<any>;
export class BaseInputEventNodeClass extends TypedInputEventNode<any> {
	acceptedEventTypes() {
		return [];
	}
}
