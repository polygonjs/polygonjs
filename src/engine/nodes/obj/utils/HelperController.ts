import {Light} from 'three/src/lights/Light';
import {Object3D} from 'three/src/core/Object3D';
import {BaseLightHelper, BaseLightHelperObjNode} from './helpers/_BaseLightHelper';

// interface Helper<L extends Light> extends BaseLightHelper<L> {
// 	dispose: () => void;
// 	update: () => void;
// }
export interface HelperConstructor<O extends Object3D, L extends Light> {
	new (node: BaseLightHelperObjNode<L>, name: string): BaseLightHelper<O, L, BaseLightHelperObjNode<L>>;
}

export class HelperController<O extends Object3D, L extends Light> {
	private _helper: BaseLightHelper<O, L, BaseLightHelperObjNode<L>> | undefined;
	constructor(
		private node: BaseLightHelperObjNode<L>,
		private _helperConstructor: HelperConstructor<O, L>,
		private _name: string
	) {}

	initializeNode() {
		this.node.flags.display.onUpdate(() => {
			this.update();
		});
	}

	visible() {
		return this.node.flags.display.active() && this.node.pv.showHelper;
	}

	private _createHelper(): BaseLightHelper<O, L, BaseLightHelperObjNode<L>> {
		const helper = new this._helperConstructor(this.node, this._name);
		helper.build();
		return helper;
	}

	update() {
		if (this.visible()) {
			if (!this._helper) {
				this._helper = this._createHelper();
			}
			if (this._helper) {
				this.node.light.add(this._helper.object);
				this._helper.update();
			}
		} else {
			if (this._helper) {
				this.node.light.remove(this._helper.object);
			}
		}
	}
}
