import {ContainableMap} from './../../../../src/engine/containers/utils/ContainableMap';
import {ContainableClassMap} from './../../containers/utils/ContainableMap';
import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {ContainerMap, ContainerClassMap} from '../../containers/utils/ContainerMap';

type NodeContainerControllerCallback<NC extends NodeContext> = (container: ContainerMap[NC] | undefined) => void;

export class TypedContainerController<NC extends NodeContext> {
	private _callbacks: NodeContainerControllerCallback<NC>[] = [];
	private _callbacksTmp: NodeContainerControllerCallback<NC>[] = [];
	protected _container: ContainerMap[NC];

	constructor(protected node: TypedNode<NC, any>) {
		this._container = this._createContainer();
	}

	container() {
		return this._container;
	}
	private _createContainer() {
		const ContainerClass = ContainerClassMap[this.node.context()];
		return new ContainerClass(this.node as any) as ContainerMap[NC];
	}
	private _createContainerWithContent() {
		const container = this._createContainer();
		const ContentClass = ContainableClassMap[this.node.context()];
		const content = new ContentClass() as ContainableMap[NC];
		container.set_content(<never>content);
		return container;
	}

	containerUnlessBypassed(): ContainerMap[NC] | undefined {
		if (this.node.flags?.bypass?.active()) {
			this.node.states.error.clear();
			const inputNode = (<unknown>this.node.io.inputs.input(0)) as TypedNode<NC, any>;
			if (inputNode) {
				return inputNode.containerController.containerUnlessBypassed();
			} else {
				return this._createContainerWithContent();
			}
		} else {
			return this.container();
		}
	}

	async compute(): Promise<ContainerMap[NC]> {
		if (this.node.disposed) {
			console.warn('.compute() requested from a disposed node', this.node);
		}
		if (this.node.flags?.bypass?.active()) {
			this.node.states.error.clear();
			const inputNode = (<unknown>this.node.io.inputs.input(0)) as TypedNode<NC, any>;
			if (inputNode) {
				const container = (await this.requestInputContainer(0)) || this._container;
				this.node.cookController.endCook();
				return container;
			} else {
				return this._createContainerWithContent();
			}
		}
		if (this.node.isDirty()) {
			return new Promise((resolve, reject) => {
				this._callbacks.push(resolve as () => ContainerMap[NC]);
				if (this.node.flags?.bypass?.active()) {
					throw 'we should not be here';
				}
				this.node.cookController.cookMain();
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

	async requestInputContainer(inputIndex: number) {
		const inputNode = (<unknown>this.node.io.inputs.input(inputIndex)) as TypedNode<NC, any>;
		if (inputNode) {
			return await inputNode.compute();
		} else {
			this.node.states.error.set(`input ${inputIndex} required`);
			this.notifyRequesters();
			return null;
		}
	}
	notifyRequesters(container?: ContainerMap[NC]) {
		// make a copy of the callbacks first,
		// to ensure that new ones are not added to this list
		// in side effects from those callbacks
		// (the test suite for the File SOP is a good test for this)
		this._callbacksTmp = this._callbacks.slice(); // clone
		this._callbacks.splice(0, this._callbacks.length); // empty

		if (!container) {
			container = this.node.containerController.container();
		}
		let callback: NodeContainerControllerCallback<NC> | undefined;
		while ((callback = this._callbacksTmp.pop())) {
			callback(container);
		}
		this.node.scene().cookController.removeNode(this.node);
	}
}

export class BaseContainerController extends TypedContainerController<any> {}
