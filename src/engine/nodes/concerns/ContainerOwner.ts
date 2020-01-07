import {BaseContainer} from '../../containers/_Base';
// import {ContainerModule} from '../../containers/_Module';
import {BaseNode} from '../_Base';

// TODO: add enum
// const REMOVE_DIRTY_STATE_MESSAGE_PROCESS_CONTAINER_REQUEST = 'process_container_request';

// type RequestContainerCallback = (container: BaseContainer)=>void

export function ContainerOwner<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;
		_callbacks: any[] = [];
		_container: BaseContainer;

		_init_container_owner(type: string) {
			const constructor = ContainerModule[type];
			this._container = new constructor();
			this._container.set_node(this.self);
		}

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

		request_container() {
			return this.request_container_p();
		}
		request_container_p() {
			return new Promise((resolve, reject) => {
				// if window.test
				// 	window.t1 = performance.now()

				this._callbacks.push(resolve);

				const cooker = this.self.scene().cooker();
				if (cooker.blocked()) {
					cooker.enqueue(this);
				} else {
					//this.process_container_request()
					setTimeout(this.process_container_request.bind(this), 0);
				}
			});
		}

		process_container_request() {
			if (this.self.is_bypassed()) {
				const input_index = 0;
				this.request_input_container_p(input_index).then((container) => {
					// this._container.set_content(container.content())
					// const input_node = this.self.input(input_index);
					// this.self.post_process_container_request_as_bypassed(input_node)
					//this.set_container(container.content())
					this.self.remove_dirty_state();
					this.self.notify_requesters(container);
				});
			} else {
				if (this.self.is_dirty()) {
					this._container.reset_caches();
					this.self.cook_main();
				} else {
					this.self.notify_requesters();
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
			const input_node = this.self.input(input_index);
			if (input_node) {
				input_node.context().set_frame(this.self.context().frame());
				const container = await input_node.request_container_p();
				return container;
			} else {
				// if this.requires_one_input()
				this.self.set_error(`input ${input_index} required`);
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
				container = this._container.clone();
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

		set_container(content, message: string = null) {
			// if message?
			this._container.set_content(content); //, this.self.cook_eval_key());
			if (content != null) {
				if (!content.name) {
					content.name = this.self.full_path();
				}
				if (!content.node) {
					content.node = this;
				}
			}
			//if @_container.has_content()?
			this.self.end_cook(message);
		}

		container() {
			return this._container;
		}
	};
}
