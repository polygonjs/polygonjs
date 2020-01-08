import {BaseContainer} from '../../containers/_Base';
// import {ContainerModule} from '../../containers/_Module';
import {BaseNode} from '../_Base';

// TODO: add enum
// const REMOVE_DIRTY_STATE_MESSAGE_PROCESS_CONTAINER_REQUEST = 'process_container_request';

// type RequestContainerCallback = (container: BaseContainer)=>void

type Callback = (container: BaseContainer) => void;

export class ContainerController {
	_callbacks: Callback[] = [];
	protected _container: BaseContainer;
	protected _container_class: typeof BaseContainer;

	constructor(protected node: BaseNode) {}

	init(container_class: typeof BaseContainer) {
		this._container = new container_class(this.node);
	}
	get container() {
		return this._container;
	}
	// protected self: BaseNode = (<unknown>this) as BaseNode;
	// _container: BaseContainer;

	// _init_container_owner(type: string) {
	// 	const constructor = ContainerModule[type];
	// 	this._container = new constructor();
	// 	this._container.set_node(this.self);
	// }

	// request_container(callback: RequestContainerCallback){
	// 	// if window.test
	// 	// 	window.t1 = performance.now()

	// 	this._callbacks.push(callback);

	// 	const cooker = this.self.scene().cooker();
	// 	if (cooker.blocked()) {
	// 		return cooker.enqueue(this);
	// 	} else {
	// 		//this.process_container_request()
	// 		return setTimeout( this.process_container_request.bind(this), 0 );
	// 	}
	// }

	request_container(): Promise<BaseContainer> {
		return new Promise((resolve, reject) => {
			// if window.test
			// 	window.t1 = performance.now()

			this._callbacks.push(resolve);

			const cooker = this.node.scene().cooker();
			if (cooker.blocked()) {
				cooker.enqueue(this);
			} else {
				//this.process_container_request()
				setTimeout(this.process_container_request.bind(this), 0);
			}
		});
	}

	process_container_request() {
		if (this.node.flags.bypass?.active) {
			const input_index = 0;
			this.request_input_container_p(input_index).then((container) => {
				// this._container.set_content(container.content())
				// const input_node = this.self.input(input_index);
				// this.self.post_process_container_request_as_bypassed(input_node)
				//this.set_container(container.content())
				this.node.remove_dirty_state();
				this.notify_requesters(container);
			});
		} else {
			if (this.node.is_dirty()) {
				this.node.container.reset_caches();
				this.node.cook_controller.cook_main();
			} else {
				this.notify_requesters();
			}
		}
	}

	// TODO: this fails for nodes which have no input, such as the picker
	// it should pass the input container (without cloning) if there is
	// otherwise, just have set it to null or empty array
	// request_input_container(input_index: number, callback: RequestContainerCallback){
	// 	const input_node = this.self.input(input_index)
	// 	if (input_node) {
	// 		input_node.context().set_frame(this.self.context().frame());
	// 		input_node.request_container(callback);
	// 	} else {
	// 		// if this.requires_one_input()
	// 		this.self.set_error(`input ${input_index} required`);
	// 		this.notify_requesters();
	// 		//return null;
	// 	}
	// }
	async request_input_container_p(input_index: number) {
		const input_node = this.node.input(input_index);
		if (input_node) {
			input_node.context().set_frame(this.node.context().frame());
			const container = await input_node.container_controller.request_container();
			return container;
		} else {
			// if this.requires_one_input()
			this.node.states.error.set(`input ${input_index} required`);
			this.notify_requesters();
			//return null;
		}
	}
	notify_requesters(container?: BaseContainer) {
		// make a copy of the callbacks first,
		// to ensure that new ones are not added to this list
		// in side effects from those callbacks
		// (the test suite for the File SOP is a good test for this)
		let callback;
		const callbacks = [];
		while ((callback = this._callbacks.pop())) {
			callbacks.push(callback);
		}

		if (container == null) {
			container = this.node.container.clone();
		}
		// removing the clone, as this seems to defeat the no cloning of inputs
		// container = container || this._container
		while ((callback = callbacks.pop())) {
			callback(container);
		}
		// return (() => {
		// 	const result = [];
		// 	while ((callback = callbacks.pop())) {
		// 		if (container == null) { container = this._container.clone(); }
		// 		result.push(callback(container));
		// 	}
		// 	return result;
		// })();
	}
}
