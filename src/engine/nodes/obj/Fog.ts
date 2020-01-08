import {BaseObjNode} from './_Base';
import {FogExp2} from 'three/src/scenes/FogExp2';
import {Fog} from 'three/src/scenes/Fog';
import {Color} from 'three/src/math/Color';
const THREE = {Color, Fog, FogExp2};

// class BaseModules extends Base {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, Dirtyable.instance_methods);

const DEFAULT = {
	color: new THREE.Color(1, 1, 1),
	near: 0,
	far: 100,
	density: 0.00025,
};

// export Fog = (function() {
// 	let DEFAULT = undefined;
// 	Fog = class Fog extends BaseModules {
export class FogObj extends BaseObjNode {
	protected _linear_fog: THREE.Fog;
	protected _linear_fog: THREE.FogExp2;

	constructor() {
		super();

		this._init_display_flag({
			multiple_display_flags_allowed: false,
		});

		this.set_inputs_count_to_zero();
		this._init_dirtyable_hook();

		this._linear_fog = new THREE.Fog(DEFAULT.color.getHex(), DEFAULT.near, DEFAULT.far);
		this._exponential_fog = new THREE.FogExp2(DEFAULT.color.getHex(), DEFAULT.density);
	}
	static type() {
		return 'fog';
	}

	create_params() {
		this.add_param(ParamType.COLOR, 'color', DEFAULT.color.toArray());
		this.add_param(ParamType.TOGGLE, 'exponential', 0);
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
		const fog = (() => {
			if (this._param_exponential === 1 || this._param_exponential === true) {
				this._exponential_fog.density = this._param_density;
				return this._exponential_fog;
			} else {
				this._linear_fog.near = this._param_near;
				this._linear_fog.far = this._param_far; // * (1/@_param_intensity)
				return this._linear_fog;
			}
		})();

		fog.color.copy(this._param_color);

		this.scene().display_scene().fog = fog;

		return this.end_cook();
	}
}
