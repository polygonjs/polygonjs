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
			this.update_helper_attachment();
		});
	}

	private update_helper_attachment() {
		if (this.node.flags.display.active) {
			const object = this.helper?.object; // use this.helper to create if needed
			if (object) {
				this.node.object.add(object);
				this._helper?.update();
			}
		} else {
			const object = this._helper?.object; // use this._helper to NOT create if not already existing
			if (object) {
				this.node.object.remove(object);
			}
		}
	}
	get helper() {
		if (this.node.flags.display.active) {
			return (this._helper = this._helper || this._create_helper());
		}
	}
	get visible() {
		return this.node.flags.display.active && this.node.pv.show_helper;
	}

	private _create_helper(): BaseLightHelper<L, BaseLightHelperObjNode<L>> {
		const helper = new this._helper_constructor(this.node, this._name);
		helper.build();
		this.node.light.add(helper.object);
		return helper;
	}

	update() {
		if (this.visible) {
			if (!this._helper) {
				this._helper = this._create_helper();
			}
			if (this._helper) {
				this._helper.object.visible = true;
				this._helper.update();
			}
		} else {
			if (this._helper) {
				this._helper.object.visible = false;
			}
		}
	}
}
