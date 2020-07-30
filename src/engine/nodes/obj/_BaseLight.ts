import {TypedObjNode, ObjNodeRenderOrder} from './_Base';
import {Light} from 'three/src/lights/Light';
import {Color} from 'three/src/math/Color';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerD} from '../utils/FlagsController';
import {Group} from 'three/src/objects/Group';

export abstract class TypedLightObjNode<L extends Light, K extends NodeParamsConfig> extends TypedObjNode<Group, K> {
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	public readonly render_order: number = ObjNodeRenderOrder.LIGHT;
	protected _color_with_intensity = new Color(0x00000);
	protected _light!: L;
	get light() {
		return this._light;
	}
	protected abstract create_light(): L;
	protected _used_in_scene: boolean = true;
	initialize_base_node() {
		super.initialize_base_node();

		this._light = this.create_light();
		this.object.add(this._light);
		this.flags.display.add_hook(() => {
			this.update_light_attachment();
		});
		this.dirty_controller.add_post_dirty_hook(
			'_cook_main_without_inputs_when_dirty',
			this._cook_main_without_inputs_when_dirty_bound
		);
	}
	// TODO: I may be able to swap those methods to param callbacks for most params
	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		// if (this.used_in_scene) {
		await this.cook_controller.cook_main_without_inputs();
		// }
	}

	protected set_object_name() {
		super.set_object_name();
		if (this._light) {
			this._light.name = `${this.full_path()}:light`;
		}
	}

	private update_light_attachment() {
		if (this.flags.display.active) {
			this.object.add(this.light);
			this._cook_main_without_inputs_when_dirty();
		} else {
			this.object.remove(this.light);
		}
	}

	// create_params() {
	// 	// this.create_light_params();
	// 	// this.create_shadow_params_main();
	// }

	create_shadow_params_main() {
		if (this._light.shadow != null) {
			return this.create_shadow_params();
		}
	}

	protected create_light_params(): void {}
	protected update_light_params(): void {}

	protected create_shadow_params() {
		return;
		// this.add_param('toggle', 'cast_shadows', 1);
		// shadow_options = {visible_if: {cast_shadows: 1}}
		// this.add_param( 'vector2', 'shadow_res', [1024, 1024], shadow_options );
		// this.add_param( 'float', 'shadow_near', 0.1, shadow_options );
		// this.add_param( 'float', 'shadow_far', 100, shadow_options );
		// // this.add_param( 'float', 'shadow_far', 500 ) # same as param distance
		// this.add_param( 'float', 'shadow_bias', -0.0001, shadow_options );
		// this.add_param( 'float', 'shadow_blur', 1, shadow_options );
	}

	// as_code_set_up_custom: ->
	// 	lines = []
	// 	lines.push "#{this.code_var_name()}.set_display_flag(#{this.display_flag_state()})"
	// 	lines

	cook() {
		this.update_light_params();
		this.update_shadow_params();
		this.cook_controller.end_cook();
	}

	update_shadow_params() {
		// let object;
		// return;
		// if (((object = this.object()) != null) && (object.shadow != null)) {
		// 	object.castShadow = this._param_cast_shadow;
		// 	object.shadow.mapSize.width = this._param_shadow_res.x;
		// 	object.shadow.mapSize.height = this._param_shadow_res.y;
		// 	object.shadow.camera.near = this._param_shadow_near;
		// 	object.shadow.camera.far = this._param_shadow_far;
		// 	return object.shadow.bias = this._param_shadow_bias;
		// }
	}

	get color_with_intensity() {
		const color = this.params.color('color');
		const intensity = this.params.float('intensity');
		this._color_with_intensity.copy(color).multiplyScalar(intensity);
		return this._color_with_intensity;
	}
	get active(): boolean {
		return this.flags.display.active;
	}
}

export type BaseLightObjNodeType = TypedLightObjNode<Light, NodeParamsConfig>;
// export class BaseLightObjNodeClass extends TypedLightObjNode<Light, NodeParamsConfig> {}
