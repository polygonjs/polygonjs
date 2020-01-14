// import {HemisphereLight} from 'three/src/lights/HemisphereLight';
// import {BaseLightObjNode} from './_BaseLight';
// import {Color} from 'three/src/math/Color';
// import {Vector3} from 'three/src/math/Vector3';
// import {ParamType} from 'src/engine/poly/ParamType';

// export class HemisphereLightObj extends BaseLightObjNode {
// 	@ParamC('sky_color') _param_sky_color: Color;
// 	@ParamC('ground_color') _param_ground_color: Color;
// 	@ParamV3('position') _param_position: Vector3;
// 	@ParamC('intensity') _param_intensity: number;
// 	protected _object: HemisphereLight;
// 	get object() {
// 		return this._object;
// 	}
// 	static type() {
// 		return 'hemisphere_light';
// 	}

// 	create_object() {
// 		return new HemisphereLight();
// 	}

// 	create_light_params() {
// 		this.add_param(ParamType.COLOR, 'sky_color', [0.2, 0.7, 1]);
// 		this.add_param(ParamType.COLOR, 'ground_color', [0.1, 0.1, 0.25]);
// 		this.add_param(ParamType.VECTOR3, 'position', [0, 1, 0]);
// 		this.add_param(ParamType.FLOAT, 'intensity', 1, {range: [0, 10]});
// 	}

// 	update_light_params() {
// 		this.object.color = this._param_sky_color;
// 		this.object.groundColor = this._param_ground_color;
// 		this.object.position.copy(this._param_position);
// 		this.object.intensity = this._param_intensity;
// 	}
// }
