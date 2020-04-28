import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import lodash_isNumber from 'lodash/isNumber';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreMath} from '../../../core/math/_Module';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TypeAssert} from '../../poly/Assert';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {SimplexNoise} from '../../../../modules/three/examples/jsm/math/SimplexNoise';

enum Operation {
	ADD = 'add',
	SET = 'set',
	MULT = 'mult',
	SUBSTRACT = 'substract',
	DIVIDE = 'divide',
}
type Operations = Array<Operation>;
const Operations: Operations = [Operation.ADD, Operation.SET, Operation.MULT, Operation.SUBSTRACT, Operation.DIVIDE];

// const COMPONENT_OFFSETS = [
// 	new Vector3(545, 125454, 2142),
// 	new Vector3(425, 25746, 95242),
// 	new Vector3(765132, 21, 9245),
// ]

const ATTRIB_NORMAL = 'normal';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class NoiseSopParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(1);
	freq = ParamConfig.VECTOR3([1, 1, 1]);
	offset = ParamConfig.VECTOR3([0, 0, 0]);
	octaves = ParamConfig.INTEGER(3, {
		range: [1, 8],
		range_locked: [true, false],
	});
	amp_attenuation = ParamConfig.FLOAT(0.5, {range: [0, 1]});
	freq_increase = ParamConfig.FLOAT(2, {range: [0, 10]});
	seed = ParamConfig.INTEGER(0, {range: [0, 100]});
	separator = ParamConfig.SEPARATOR();
	use_normals = ParamConfig.BOOLEAN(0);
	attrib_name = ParamConfig.STRING('position');
	operation = ParamConfig.INTEGER(Operations.indexOf(Operation.ADD), {
		menu: {
			entries: Operations.map((operation) => {
				return {
					name: operation,
					value: Operations.indexOf(operation),
				};
			}),
		},
	});
	compute_normals = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new NoiseSopParamsConfig();

export class NoiseSopNode extends TypedSopNode<NoiseSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'noise';
	}

	// _param_amount: number;
	// _param_offset: Vector3;
	// _param_freq: Vector3;
	// _param_seed: number;
	// _param_use_normals: boolean;
	// _param_attrib_name: string;
	// _param_operation: number;
	// _param_compute_normals: boolean;

	private _simplex_by_seed: Map<number, SimplexNoise> = new Map();

	private _rest_core_group_timestamp: number | undefined;
	private _rest_points: CorePoint[] = [];
	private _rest_pos = new Vector3();
	private _rest_value2 = new Vector2();
	private _noise_value_v = new Vector3();

	static displayed_input_names(): string[] {
		return ['geometry to add noise to', 'rest geometry'];
	}
	initialize_node() {
		this.io.inputs.set_count(1, 2);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const core_group_rest = input_contents[1];

		const dest_points = core_group.points();
		if (core_group_rest) {
			if (
				this._rest_core_group_timestamp == null ||
				this._rest_core_group_timestamp != core_group_rest.timestamp()
			) {
				this._rest_points = core_group_rest.points();
				this._rest_core_group_timestamp = core_group_rest.timestamp();
			}
		}

		// const {SimplexNoise} = await import(`three/examples/jsm/math/SimplexNoise`)
		const simplex = this._get_simplex();

		const use_normals = this.pv.use_normals && core_group.has_attrib(ATTRIB_NORMAL);
		const target_attrib_size = core_group.attrib_size(this.pv.attrib_name);

		for (let i = 0; i < dest_points.length; i++) {
			const dest_point = dest_points[i];
			let rest_point = core_group_rest ? this._rest_points[i] : dest_point;
			const current_attrib_value = rest_point.attrib_value(this.pv.attrib_name) as NumericAttribValue;

			const noise_result = this._noise_value(use_normals, simplex, rest_point);
			const noise_value = this._make_noise_value_correct_size(noise_result, target_attrib_size);

			const operation = Operations[this.pv.operation];

			if (lodash_isNumber(current_attrib_value) && lodash_isNumber(noise_value)) {
				const new_attrib_value_f = this._new_attrib_value_from_float(
					operation,
					current_attrib_value,
					noise_value
				);
				dest_point.set_attrib_value(this.pv.attrib_name, new_attrib_value_f);
			} else {
				if (current_attrib_value instanceof Vector2 && noise_value instanceof Vector2) {
					const new_attrib_value_v = this._new_attrib_value_from_vector2(
						operation,
						current_attrib_value,
						noise_value
					);
					dest_point.set_attrib_value(this.pv.attrib_name, new_attrib_value_v);
				} else {
					if (current_attrib_value instanceof Vector3 && noise_value instanceof Vector3) {
						const new_attrib_value_v = this._new_attrib_value_from_vector3(
							operation,
							current_attrib_value,
							noise_value
						);
						dest_point.set_attrib_value(this.pv.attrib_name, new_attrib_value_v);
					} else {
						if (current_attrib_value instanceof Vector4 && noise_value instanceof Vector4) {
							const new_attrib_value_v = this._new_attrib_value_from_vector4(
								operation,
								current_attrib_value,
								noise_value
							);
							dest_point.set_attrib_value(this.pv.attrib_name, new_attrib_value_v);
						}
					}
				}
			}
		}

		if (!this.io.inputs.clone_required(0)) {
			for (let geometry of core_group.geometries()) {
				(geometry.getAttribute(this.pv.attrib_name) as BufferAttribute).needsUpdate = true;
			}
		}

		if (this.pv.compute_normals) {
			core_group.compute_vertex_normals();
		}
		this.set_core_group(core_group);
	}

	private _noise_value(use_normals: boolean, simplex: SimplexNoise, rest_point: CorePoint) {
		const pos = rest_point.position(this._rest_pos).add(this.pv.offset).multiply(this.pv.freq);
		if (use_normals) {
			const noise = this.pv.amount * this._fbm(simplex, pos.x, pos.y, pos.z);
			const normal = rest_point.attrib_value(ATTRIB_NORMAL) as Vector3;
			this._noise_value_v.copy(normal);
			return this._noise_value_v.multiplyScalar(noise);
		} else {
			this._noise_value_v.set(
				this.pv.amount * this._fbm(simplex, pos.x + 545, pos.y + 125454, pos.z + 2142),
				this.pv.amount * this._fbm(simplex, pos.x - 425, pos.y - 25746, pos.z + 95242),
				this.pv.amount * this._fbm(simplex, pos.x + 765132, pos.y + 21, pos.z - 9245)
			);
			return this._noise_value_v;
		}
	}
	private _make_noise_value_correct_size(noise_value: Vector3, target_attrib_size: number) {
		switch (target_attrib_size) {
			case 1:
				return noise_value.x;
			case 2:
				this._rest_value2.set(noise_value.x, noise_value.y);
				return this._rest_value2;
			case 3:
				return noise_value;
			default:
				return noise_value;
		}
	}

	private _new_attrib_value_from_float(
		operation: Operation,
		current_attrib_value: number,
		noise_value: number
	): number {
		switch (operation) {
			case Operation.ADD:
				return current_attrib_value + noise_value;
			case Operation.SET:
				return noise_value;
			case Operation.MULT:
				return current_attrib_value * noise_value;
			case Operation.DIVIDE:
				return current_attrib_value / noise_value;
			case Operation.SUBSTRACT:
				return current_attrib_value - noise_value;
		}
		TypeAssert.unreachable(operation);
	}

	private _new_attrib_value_from_vector2(
		operation: Operation,
		current_attrib_value: Vector2,
		noise_value: Vector2
	): Vector2 {
		switch (operation) {
			case Operation.ADD:
				return current_attrib_value.add(noise_value);
			case Operation.SET:
				return noise_value;
			case Operation.MULT:
				return current_attrib_value.multiply(noise_value);
			case Operation.DIVIDE:
				return current_attrib_value.divide(noise_value);
			case Operation.SUBSTRACT:
				return current_attrib_value.sub(noise_value);
		}
		TypeAssert.unreachable(operation);
	}
	private _new_attrib_value_from_vector3(
		operation: Operation,
		current_attrib_value: Vector3,
		noise_value: Vector3
	): Vector3 {
		switch (operation) {
			case Operation.ADD:
				return current_attrib_value.add(noise_value);
			case Operation.SET:
				return noise_value;
			case Operation.MULT:
				return current_attrib_value.multiply(noise_value);
			case Operation.DIVIDE:
				return current_attrib_value.divide(noise_value);
			case Operation.SUBSTRACT:
				return current_attrib_value.sub(noise_value);
		}
		TypeAssert.unreachable(operation);
	}
	private _new_attrib_value_from_vector4(
		operation: Operation,
		current_attrib_value: Vector4,
		noise_value: Vector4
	): Vector4 {
		switch (operation) {
			case Operation.ADD:
				return current_attrib_value.add(noise_value);
			case Operation.SET:
				return noise_value;
			case Operation.MULT:
				return current_attrib_value.multiplyScalar(noise_value.x);
			case Operation.DIVIDE:
				return current_attrib_value.divideScalar(noise_value.x);
			case Operation.SUBSTRACT:
				return current_attrib_value.sub(noise_value);
		}
		TypeAssert.unreachable(operation);
	}

	private _fbm(simplex: SimplexNoise, x: number, y: number, z: number): number {
		let value = 0.0;
		let amplitude = 1.0;
		for (let i = 0; i < this.pv.octaves; i++) {
			value += amplitude * simplex.noise3d(x, y, z);
			x *= this.pv.freq_increase;
			y *= this.pv.freq_increase;
			z *= this.pv.freq_increase;
			amplitude *= this.pv.amp_attenuation;
		}
		return value;
	}

	private _get_simplex(): SimplexNoise {
		const simplex = this._simplex_by_seed.get(this.pv.seed);
		if (simplex) {
			return simplex;
		} else {
			const simplex = this._create_simplex();
			this._simplex_by_seed.set(this.pv.seed, simplex);
			return simplex;
		}
	}
	private _create_simplex(): SimplexNoise {
		const seed = this.pv.seed;
		const random_generator = {
			random: function () {
				return CoreMath.rand_float(seed);
			},
		};
		const simplex = new SimplexNoise(random_generator);
		// for (let key of Object.keys(this._simplex_by_seed)) {
		this._simplex_by_seed.delete(seed);
		// }
		return simplex;
	}
}
