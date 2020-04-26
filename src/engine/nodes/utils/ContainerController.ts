import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {ContainerMap, ContainerClassMap} from '../../containers/utils/ContainerMap';

type Callback<NC extends NodeContext> = (container: ContainerMap[NC] | undefined) => void;

export class TypedContainerController<NC extends NodeContext> {
	private _callbacks: Callback<NC>[] = [];
	protected _container: ContainerMap[NC];

	constructor(protected node: TypedNode<NC, any>) {
		const container_class = ContainerClassMap[node.node_context()];
		this._container = new container_class(this.node as any) as ContainerMap[NC];
	}

	get container() {
		return this._container;
	}

	request_container(): Promise<ContainerMap[NC]> {
		return new Promise((resolve, reject) => {
			this._callbacks.push(resolve);
			this.node.scene.cook_controller.add_node(this.node);

			// const cooker = this.node.scene.cooker;
			// if (cooker.blocked()) {
			// 	cooker.enqueue(this.node);
			// } else {
			setTimeout(this.process_container_request.bind(this), 0);
			// }
		});
	}

	process_container_request() {
		if (this.node.flags?.bypass?.active) {
			const input_index = 0;
			this.request_input_container(input_index).then((container) => {
				this.node.remove_dirty_state();
				if (container) {
					this.notify_requesters(container as ContainerMap[NC]);
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

	async request_input_container(input_index: number) {
		const input_node = (<unknown>this.node.io.inputs.input(input_index)) as TypedNode<NC, any>;
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
	notify_requesters(container?: ContainerMap[NC]) {
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
			container = this.node.container_controller.container; //.clone();
		}
		// removing the clone, as this seems to defeat the no cloning of inputs
		// container = container || this._container
		while ((callback = callbacks.pop())) {
			callback(container);
		}
		this.node.scene.cook_controller.remove_node(this.node);
	}
}

export class BaseContainerController extends TypedContainerController<any> {}
