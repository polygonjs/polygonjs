import {Light} from 'three/src/lights/Light';
import {BaseLightHelper, BaseLightHelperObjNode} from './helpers/_BaseLightHelper';

// interface Helper<L extends Light> extends BaseLightHelper<L> {
// 	dispose: () => void;
// 	update: () => void;
// }
export interface HelperConstructor<L extends Light> {
	new (node: BaseLightHelperObjNode<L>, name: string): BaseLightHelper<L, BaseLightHelperObjNode<L>>;
}

export class HelperController<L extends Light> {
	private _helper: BaseLightHelper<L, BaseLightHelperObjNode<L>> | undefined;
	constructor(
		private node: BaseLightHelperObjNode<L>,
		private _helper_constructor: HelperConstructor<L>,
		private _name: string
	) {}

	initialize_node() {
		this.node.flags.display.add_hook(() => {
			this.update();
		});
	}

	get helper() {
		if (this.node.flags.display.active) {
			return (this._helper = this._helper || this._create_helper());
		}
	}
	get visible() {
		return this.node.flags.display.active && this.node.pv.showHelper;
	}

	private _create_helper(): BaseLightHelper<L, BaseLightHelperObjNode<L>> {
		const helper = new this._helper_constructor(this.node, this._name);
		helper.object.matrixAutoUpdate = false;
		helper.build();
		return helper;
	}

	update() {
		if (this.visible) {
			if (!this._helper) {
				this._helper = this._create_helper();
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
