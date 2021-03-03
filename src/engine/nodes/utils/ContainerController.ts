import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {ContainerMap, ContainerClassMap} from '../../containers/utils/ContainerMap';

type Callback<NC extends NodeContext> = (container: ContainerMap[NC] | undefined) => void;

export class TypedContainerController<NC extends NodeContext> {
	private _callbacks: Callback<NC>[] = [];
	private _callbacks_tmp: Callback<NC>[] = [];
	protected _container: ContainerMap[NC];

	constructor(protected node: TypedNode<NC, any>) {
		const container_class = ContainerClassMap[node.nodeContext()];
		this._container = new container_class(this.node as any) as ContainerMap[NC];
	}

	get container() {
		return this._container;
	}

	async requestContainer(): Promise<ContainerMap[NC]> {
		if (this.node.flags?.bypass?.active()) {
			return (await this.requestInputContainer(0)) || this._container;
		}
		if (this.node.isDirty()) {
			return new Promise((resolve, reject) => {
				this._callbacks.push(resolve);
				this.node.cookController.cook_main();
			});
		}
		return this._container;
	}
	// async requestContainerTEST(): Promise<ContainerMap[NC]> {
	// 	if (this.node.flags?.bypass?.active()) {
	// 		const container = await this.requestInputContainer(0);
	// 		return container || this._container;
	// 	}
	// 	if (this.node.isDirty()) {
	// 		await this.node.cookController.cook_main();
	// 	}
	// 	return this._container;
	// }

	// TODO: should I merge this into the method above?
	// private process_container_request() {
	// 	if (this.node.flags?.bypass?.active()) {
	// 		const input_index = 0;
	// 		this.requestInputContainer(input_index).then((container) => {
	// 			this.node.removeDirtyState();
	// 			if (container) {
	// 				this.notify_requesters(container);
	// 			} else {
	// 				this.node.states.error.set('input invalid');
	// 			}
	// 		});
	// 	} else {
	// 		if (this.node.isDirty()) {
	// 			this.node.cookController.cook_main();
	// 		} else {
	// 			this.notify_requesters();
	// 		}
	// 	}
	// }

	async requestInputContainer(input_index: number) {
		const input_node = (<unknown>this.node.io.inputs.input(input_index)) as TypedNode<NC, any>;
		if (input_node) {
			return await input_node.requestContainer();
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
		this._callbacks_tmp = this._callbacks.slice(); // clone
		this._callbacks.splice(0, this._callbacks.length); // empty

		if (!container) {
			container = this.node.containerController.container;
		}
		let callback: Callback<NC> | undefined;
		while ((callback = this._callbacks_tmp.pop())) {
			callback(container);
		}
		this.node.scene().cookController.removeNode(this.node);
	}
}

export class BaseContainerController extends TypedContainerController<any> {}
