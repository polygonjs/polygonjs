import {BaseEventNodeType} from '../_Base';

export class DispatcherRegisterer {
	constructor(private node: BaseEventNodeType) {}

	initialize() {
		this.node.lifecycle.add_on_add_hook(() => {
			this.node.scene.events_dispatcher.register_event_node(this.node);
		});
		this.node.lifecycle.add_delete_hook(() => {
			this.node.scene.events_dispatcher.unregister_event_node(this.node);
		});
	}

	update_register() {
		if (this.node.pv.active) {
			this.node.scene.events_dispatcher.register_event_node(this.node);
		} else {
			this.node.scene.events_dispatcher.unregister_event_node(this.node);
		}
	}
}
