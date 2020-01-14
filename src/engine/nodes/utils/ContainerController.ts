import {BaseContainer, TypedContainer} from '../../containers/_Base';
import {BaseNodeType} from '../_Base';

type Callback<T extends TypedContainer<any>> = (container: T | undefined) => void;

export class TypedContainerController<T extends TypedContainer<any>> {
	private _callbacks: Callback<T>[] = [];
	protected _container: T;

	constructor(protected node: BaseNodeType, container_class: typeof BaseContainer) {
		this._container = new container_class(this.node) as T;
	}

	get container() {
		return this._container;
	}

	request_container(): Promise<T> {
		return new Promise((resolve, reject) => {
			this._callbacks.push(resolve);

			const cooker = this.node.scene.cooker;
			if (cooker.blocked()) {
				cooker.enqueue(this.node);
			} else {
				setTimeout(this.process_container_request.bind(this), 0);
			}
		});
	}

	process_container_request() {
		if (this.node.flags.bypass?.active) {
			const input_index = 0;
			this.request_input_container_p(input_index).then((container) => {
				if (container) {
					this.node.remove_dirty_state();
					this.notify_requesters(container);
				} else {
					this.node.states.error.set('input invalid');
				}
			});
		} else {
			if (this.node.is_dirty) {
				this.node.container_controller.container.reset_caches();
				this.node.cook_controller.cook_main();
			} else {
				this.notify_requesters();
			}
		}
	}

	async request_input_container_p(input_index: number) {
		const input_node = this.node.io.inputs.input(input_index);
		if (input_node) {
			input_node.processing_context.copy(this.node.processing_context);
			const container = await input_node.container_controller.request_container();
			return container;
		} else {
			this.node.states.error.set(`input ${input_index} required`);
			this.notify_requesters();
			return null;
		}
	}
	notify_requesters(container?: T) {
		// make a copy of the callbacks first,
		// to ensure that new ones are not added to this list
		// in side effects from those callbacks
		// (the test suite for the File SOP is a good test for this)
		let callback;
		const callbacks = [];
		while ((callback = this._callbacks.pop())) {
			callbacks.push(callback);
		}

		if (!container) {
			container = this.node.container_controller.container.clone();
		}
		// removing the clone, as this seems to defeat the no cloning of inputs
		// container = container || this._container
		while ((callback = callbacks.pop())) {
			callback(container);
		}
	}
}

export class BaseContainerController extends TypedContainerController<any> {}
