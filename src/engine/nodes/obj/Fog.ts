// import {BaseNode} from '../_Base';
import {TypedObjNode, ObjNodeRenderOrder} from './_Base';
import {FogExp2} from 'three/src/scenes/FogExp2';
import {Fog} from 'three/src/scenes/Fog';
import {Color} from 'three/src/math/Color';

const DEFAULT = {
	color: new Color(1, 1, 1),
	near: 0,
	far: 100,
	density: 0.00025,
};

// export Fog = (function() {
// 	let DEFAULT = undefined;
// 	Fog = class Fog extends BaseModules {
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Object3D} from 'three/src/core/Object3D';
import {FlagsControllerD} from '../utils/FlagsController';
class FogObjParamConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR(DEFAULT.color.toArray() as [number, number, number]);
	exponential = ParamConfig.BOOLEAN(0);
	density = ParamConfig.FLOAT(1);
	near = ParamConfig.FLOAT(0, {range: [0, 100]});
	far = ParamConfig.FLOAT(100, {range: [0, 100]});
}
const ParamsConfig = new FogObjParamConfig();
export class FogObjNode extends TypedObjNode<Object3D, FogObjParamConfig> {
	params_config = ParamsConfig;
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
	// public readonly add_to_hierarchy: boolean = false;
	protected _attachable_to_hierarchy: boolean = false;

	protected _linear_fog!: Fog;
	protected _linear_fogexp2!: FogExp2;

	initialize_node() {
		// this._init_display_flag({
		// 	multiple_display_flags_allowed: false,
		// });

		// this.set_inputs_count_to_zero();
		// this._init_dirtyable_hook();

		this._linear_fog = new Fog(DEFAULT.color.getHex(), DEFAULT.near, DEFAULT.far);
		this._linear_fogexp2 = new FogExp2(DEFAULT.color.getHex(), DEFAULT.density);
	}
	static type() {
		return 'fog';
	}

	// create_params() {
	// 	this.add_param(ParamType.COLOR, 'color', DEFAULT.color.toArray() as [number, number, number]);
	// 	this.add_param(ParamType.BOOLEAN, 'exponential', 0);
	// 	this.add_param(ParamType.FLOAT, 'density', DEFAULT.density);
	// 	this.add_param(ParamType.FLOAT, 'near', DEFAULT.near, {
	// 		range: [0, 100],
	// 	});
	// 	this.add_param(ParamType.FLOAT, 'far', DEFAULT.far, {
	// 		range: [0, 100],
	// 	});
	// }

	// get_fog: (callback)->
	// 	this.param('exponential').eval (val)=>
	// 		fog = if val then @_exponential_fog else @_linear_fog
	// 		callback(fog)

	cook() {
		let fog: Fog | FogExp2;
		if (this.pv.exponential) {
			this._linear_fogexp2.density = this.pv.density;
			fog = this._linear_fogexp2;
		} else {
			this._linear_fog.near = this.pv.near;
			this._linear_fog.far = this.pv.far; // * (1/@_param_intensity)
			fog = this._linear_fog;
		}

		fog.color.copy(this.pv.color);

		this.scene.display_scene.fog = fog;

		this.cook_controller.end_cook();
	}
}
