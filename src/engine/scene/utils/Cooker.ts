import {PolyScene} from '../PolyScene';

export class Cooker {
	constructor(private _scene: PolyScene) {}

	block() {
		this._scene.graph.callbacksTriggerController.block();
	}
	unblock() {
		this._scene.graph.callbacksTriggerController.unblock();
	}
}
