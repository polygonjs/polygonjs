import lodash_sortBy from 'lodash/sortBy';
// import lodash_isArray from 'lodash/isArray'
// import lodash_isString from 'lodash/isString'
import {RGBFormat} from 'three/src/constants';
import {DataTexture} from 'three/src/textures/DataTexture';
import {CubicInterpolant} from 'three/src/math/interpolants/CubicInterpolant';
// import {ClampToEdgeWrapping} from 'three/src/constants'
import {TypedParamVisitor} from './_Base';
import {Single} from './_Single';
import {RampValue, RampPoint} from './ramp/RampValue';

// import {AsCodeRamp} from './concerns/visitors/Ramp';
import {ParamType} from '../poly/ParamType';

interface RampParamVisitor extends TypedParamVisitor {
	visit_ramp_param: (param: RampParam) => any;
}

export class RampParam extends Single<RampValue> {
	static type() {
		return ParamType.RAMP;
	}

	private _ramp_interpolant: CubicInterpolant | null;
	private _ramp_texture: DataTexture | null;

	static DEFAULT_VALUE = new RampValue('linear', [new RampPoint(0, 0), new RampPoint(1, 1)]);

	constructor() {
		super('ramp');

		this.add_post_dirty_hook(this._reset_ramp_interpolant_and_texture.bind(this));
	}
	accepts_visitor(visitor: RampParamVisitor) {
		return visitor.visit_ramp_param(this);
	}
	is_raw_input_default(): boolean {
		return this.value.is_equal(this.default_value);
	}

	// convert_value(v) {
	// 	let is_json = false

	// 	if (lodash_isString(v)) {
	// 		v = JSON.parse(v)
	// 		is_json = true
	// 	}

	// 	if (!is_json) {
	// 		if (v.interpolation && v.points) {
	// 			if (lodash_isArray(v.points)) {
	// 				is_json = true
	// 			}
	// 		}
	// 	}
	// 	if (is_json) {
	// 		v = RampValue.from_json(v)
	// 	}

	// 	return v
	// }
	// convert_default_value(v) {
	// 	return this.convert_value(v)
	// }

	has_expression() {
		return false;
	}

	_reset_ramp_interpolant_and_texture() {
		this._ramp_interpolant = null;
		this._ramp_texture = null;
	}
	ramp_texture() {
		return (this._ramp_texture = this._ramp_texture || this._create_ramp_texture());
	}
	_create_ramp_texture() {
		const width = 1024;
		const height = 1;

		const size = width * height;
		const data = new Uint8Array(3 * size);

		let stride = 0;
		let position = 0;
		let value = 0;
		for (var i = 0; i < size; i++) {
			stride = i * 3;
			position = i / width;
			value = this.value_at_position(position);
			data[stride] = value * 255; // if I set 256, a value of 1 will become 0
			// data[ stride+1 ] = 1
			// data[ stride+2 ] = 2
		}

		const texture = new DataTexture(data, width, height, RGBFormat);
		// texture.wrapS = ClampToEdgeWrapping
		// texture.wrapT = ClampToEdgeWrapping
		// texture.wrapS = ClampToEdgeWrapping
		// texture.wrapT = ClampToEdgeWrapping
		texture.needsUpdate = true;
		return texture;
	}

	static create_interpolant(positions: Float32Array, values: Float32Array) {
		const values_count = 1;
		const interpolated_values = new Float32Array(values_count);
		return new CubicInterpolant(positions, values, values_count, interpolated_values);
	}
	interpolant() {
		return (this._ramp_interpolant = this._ramp_interpolant || this._create_interpolant());
	}
	_create_interpolant() {
		const points = this.value.points();
		const sorted_points = lodash_sortBy(points, (point) => point.position());
		const positions = new Float32Array(sorted_points.length);
		const values = new Float32Array(sorted_points.length);

		let i = 0;
		for (let sorted_point of sorted_points) {
			positions[i] = sorted_point.position();
			values[i] = sorted_point.value();
			i++;
		}

		return RampParam.create_interpolant(positions, values);
	}

	value_at_position(position: number): number {
		return (<unknown>this.interpolant().evaluate(position)[0]) as number;
	}
}
