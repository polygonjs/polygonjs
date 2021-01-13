import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamOptions} from '../../params/utils/OptionsController';
import {BaseNodeType} from '../_Base';

export const EVENT_PARAM_OPTIONS: ParamOptions = {
	visibleIf: {active: 1},
	callback: (node: BaseNodeType) => {
		BaseInputEventNodeClass.PARAM_CALLBACK_update_register(node as BaseInputEventNodeType);
	},
};

export abstract class TypedInputEventNode<K extends NodeParamsConfig> extends TypedEventNode<K> {
	initialize_base_node() {
		super.initialize_base_node();

		const register = () => {
			this.scene().eventsDispatcher.registerEventNode(this);
		};
		const unregister = () => {
			this.scene().eventsDispatcher.unregisterEventNode(this);
		};
		this.lifecycle.add_on_add_hook(register);
		// this.lifecycle.add_on_creation_completed_hook(register);
		this.lifecycle.add_delete_hook(unregister);

		this.params.on_params_created('update_register', () => {
			this._update_register();
		});
	}

	process_event(event_context: EventContext<Event>) {
		if (!this.pv.active) {
			return;
		}
		if (!event_context.event) {
			return;
		}
		this.dispatch_event_to_output(event_context.event.type, event_context);
	}

	static PARAM_CALLBACK_update_register(node: BaseInputEventNodeType) {
		node._update_register();
	}
	private _update_register() {
		this._update_active_event_names();
		this.scene().eventsDispatcher.updateViewerEventListeners(this);
	}

	private _active_event_names: string[] = [];
	private _update_active_event_names() {
		this._active_event_names = [];
		if (this.pv.active) {
			const list = this.accepted_event_types();
			for (let name of list) {
				const param = this.params.get(name);
				if (param && param.value) {
					this._active_event_names.push(name);
				}
			}
		}
	}
	protected abstract accepted_event_types(): string[];
	active_event_names() {
		return this._active_event_names;
	}
}

export type BaseInputEventNodeType = TypedInputEventNode<any>;
export class BaseInputEventNodeClass extends TypedInputEventNode<any> {
	accepted_event_types() {
		return [];
	}
}
