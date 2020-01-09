import {BaseObjNode} from './_Base';
import {FogExp2} from 'three/src/scenes/FogExp2';
import {Fog} from 'three/src/scenes/Fog';
import {Color} from 'three/src/math/Color';

// class BaseModules extends Base {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, Dirtyable.instance_methods);

const DEFAULT = {
	color: new Color(1, 1, 1),
	near: 0,
	far: 100,
	density: 0.00025,
};

// export Fog = (function() {
// 	let DEFAULT = undefined;
// 	Fog = class Fog extends BaseModules {
export class FogObj extends BaseObjNode {
	@ParamC('color') _param_color: Color;
	@ParamB('exponential') _param_exponential: boolean;
	@ParamF('density') _param_density: number;
	@ParamF('near') _param_near: number;
	@ParamF('far') _param_far: number;

	protected _linear_fog: Fog;
	protected _linear_fogexp2: FogExp2;

	constructor() {
		super();

		this.flags.add_display();
		// this._init_display_flag({
		// 	multiple_display_flags_allowed: false,
		// });

		// this.set_inputs_count_to_zero();
		this._init_dirtyable_hook();

		this._linear_fog = new Fog(DEFAULT.color.getHex(), DEFAULT.near, DEFAULT.far);
		this._linear_fogexp2 = new FogExp2(DEFAULT.color.getHex(), DEFAULT.density);
	}
	static type() {
		return 'fog';
	}

	create_params() {
		this.add_param(ParamType.COLOR, 'color', DEFAULT.color.toArray() as [number, number, number]);
		this.add_param(ParamType.BOOLEAN, 'exponential', 0);
		this.add_param(ParamType.FLOAT, 'density', DEFAULT.density);
		this.add_param(ParamType.FLOAT, 'near', DEFAULT.near, {
			range: [0, 100],
		});
		this.add_param(ParamType.FLOAT, 'far', DEFAULT.far, {
			range: [0, 100],
		});
	}

	// get_fog: (callback)->
	// 	this.param('exponential').eval (val)=>
	// 		fog = if val then @_exponential_fog else @_linear_fog
	// 		callback(fog)

	cook() {
		let fog: Fog | FogExp2;
		if (this._param_exponential) {
			this._linear_fogexp2.density = this._param_density;
			fog = this._linear_fogexp2;
		} else {
			this._linear_fog.near = this._param_near;
			this._linear_fog.far = this._param_far; // * (1/@_param_intensity)
			fog = this._linear_fog;
		}

		fog.color.copy(this._param_color);

		this.scene().display_scene.fog = fog;

		this.cook_controller.end_cook();
	}
}
