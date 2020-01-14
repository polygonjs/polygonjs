import {BaseNode} from '../_Base';
import {TypedObjNode} from './_Base';
import {FogExp2} from 'three/src/scenes/FogExp2';
import {Fog} from 'three/src/scenes/Fog';
import {Color} from 'three/src/math/Color';
import {ParamType} from 'src/engine/poly/ParamType';

const DEFAULT = {
	color: new Color(1, 1, 1),
	near: 0,
	far: 100,
	density: 0.00025,
};

// export Fog = (function() {
// 	let DEFAULT = undefined;
// 	Fog = class Fog extends BaseModules {
import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class FogObjParamConfig extends NodeParamsConfig {
	color = new ParamConfig<ParamType.COLOR>(DEFAULT.color.toArray() as [number, number, number]);
	exponential = new ParamConfig<ParamType.BOOLEAN>(0);
	density = new ParamConfig<ParamType.FLOAT>(1);
	near = new ParamConfig<ParamType.FLOAT>(0, {range: [0, 100]});
	far = new ParamConfig<ParamType.FLOAT>(100, {range: [0, 100]});
}

export class FogObjNode extends TypedObjNode<FogObjParamConfig> {
	// @BaseNode.ParamColor('color') _param_color: Color;
	// @BaseNode.ParamBoolean('exponential') _param_exponential: boolean;
	// @BaseNode.ParamFloat('density') _param_density: number;
	// @BaseNode.ParamFloat('near') _param_near: number;
	// @BaseNode.ParamFloat('far') _param_far: number;

	protected _linear_fog: Fog;
	protected _linear_fogexp2: FogExp2;

	initialize_node() {
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
