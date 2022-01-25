import {TypedObjNode, ObjNodeRenderOrder} from './_Base';
import {Object3D} from 'three/src/core/Object3D';
import {Color} from 'three/src/math/Color';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerD} from '../utils/FlagsController';
import {Group} from 'three/src/objects/Group';

export abstract class TypedLightObjNode<L extends Object3D, K extends NodeParamsConfig> extends TypedObjNode<Group, K> {
	public override readonly flags: FlagsControllerD = new FlagsControllerD(this);
	public override readonly renderOrder: number = ObjNodeRenderOrder.LIGHT;
	protected _color_with_intensity = new Color(0x00000);
	protected _light!: L;
	get light() {
		return this._light;
	}
	protected abstract createLight(): L;
	protected override _used_in_scene: boolean = true;
	override initializeBaseNode() {
		super.initializeBaseNode();

		this._light = this.createLight();
		this.object.add(this._light);
		this.flags.display.onUpdate(() => {
			this._updateLightAttachment();
		});
		this.dirtyController.addPostDirtyHook(
			'_cook_main_without_inputs_when_dirty',
			this._cook_main_without_inputs_when_dirty_bound
		);
	}
	// TODO: I may be able to swap those methods to param callbacks for most params
	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		// if (this.used_in_scene) {
		await this.cookController.cookMainWithoutInputs();
		// }
	}

	protected override set_object_name() {
		super.set_object_name();
		if (this._light) {
			this._light.name = `${this.path()}:light`;
		}
	}

	private _updateLightAttachment() {
		if (this.flags.display.active()) {
			this.object.add(this.light);
			this._cook_main_without_inputs_when_dirty();
		} else {
			this.object.remove(this.light);
		}
	}

	override cook() {
		this.updateLightParams();
		this.updateShadowParams();
		this.cookController.endCook();
	}

	protected updateLightParams(): void {}
	protected updateShadowParams(): void {}
}

export type BaseLightObjNodeType = TypedLightObjNode<Object3D, NodeParamsConfig>;
// export class BaseLightObjNodeClass extends TypedLightObjNode<Light, NodeParamsConfig> {}
