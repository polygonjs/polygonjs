import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {TypedObjNode} from '../_Base';
import {Light} from 'three/src/lights/Light';
import {Object3D} from 'three/src/core/Object3D';
export function HelperParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		show_helper = ParamConfig.BOOLEAN(1);
	};
}
class HelperParamsConfig extends HelperParamConfig(NodeParamsConfig) {}
export class HelperObjNode<L extends Light> extends TypedObjNode<L, HelperParamsConfig> {}
interface Helper extends Object3D {
	dispose: () => void;
}
interface HelperConstructor<H extends Helper, L extends Light> {
	new (obj: L, size: number): H;
}

export class HelperController<H extends Helper, L extends Light> {
	private _helper: H | undefined;
	constructor(private node: HelperObjNode<L>, private _helper_constructor: HelperConstructor<H, L>) {}

	initialize_node() {
		this.node.flags?.display?.add_hook(() => {
			this.update();
		});
	}

	update() {
		if (this.node.scene) {
			// the helper needs to be re-created every frame to be updated when light params change
			if (this._helper) {
				this.node.scene.display_scene.remove(this._helper);
				this._helper.dispose();
			}
			if (this.node.pv.show_helper && this.node.flags?.display?.active) {
				this._helper = new this._helper_constructor(this.node.object, 1);
				this.node.scene.display_scene.add(this._helper);
			}
		}
	}
}
