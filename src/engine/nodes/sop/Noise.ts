/**
 * Applies a noise to the geometry
 *
 * @remarks
 * The noise can affect any attribute, not just the position.
 *
 */
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreMath} from '../../../core/math/_Module';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TypeAssert} from '../../poly/Assert';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {SimplexNoise} from '../../../modules/three/examples/jsm/math/SimplexNoise';

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
import {CorePoint} from '../../../core/geometry/Point';
import { CoreType } from '../../../core/Type';
class NoiseSopParamsConfig extends NodeParamsConfig {
	/** @param noise amplitude */
	amplitude = ParamConfig.FLOAT(1);
	/** @param toggle on to multiply the amplitude by a vertex attribute */
	tamplitude_attrib = ParamConfig.BOOLEAN(0);
	/** @param which vertex attribute to use */
	amplitude_attrib = ParamConfig.STRING('amp', {visible_if: {tamplitude_attrib: true}});
	/** @param noise frequency */
	freq = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param noise offset */
	offset = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param noise octaves */
	octaves = ParamConfig.INTEGER(3, {
		range: [1, 8],
		range_locked: [true, false],
	});
	/** @param amplitude attenuation for higher octaves */
	amp_attenuation = ParamConfig.FLOAT(0.5, {range: [0, 1]});
	/** @param frequency increase for higher octaves */
	freq_increase = ParamConfig.FLOAT(2, {range: [0, 10]});
	/** @param noise seed */
	seed = ParamConfig.INTEGER(0, {range: [0, 100]});
	separator = ParamConfig.SEPARATOR();
	/** @param toggle on to have the noise be multiplied by the normal */
	use_normals = ParamConfig.BOOLEAN(0);
	/** @param set which attribute will be affected by the noise */
	attrib_name = ParamConfig.STRING('position');
	/** @param toggle on to use rest attributes. This can be useful when the noise is animated and this node does not clone the input geometry. Without using rest attributes, the noise would be based on an already modified position, and would therefore accumulate on itself after each cook. This may be what you are after, but for a more conventional result, using a rest attribute will ensure that the noise remains stable. Note that the rest attribute can be created by a RestAttributes node */
	use_rest_attributes = ParamConfig.BOOLEAN(0);
	/** @param name of rest position */
	restP = ParamConfig.STRING('restP', {visible_if: {use_rest_attributes: true}});
	/** @param name of rest normal */
	restN = ParamConfig.STRING('restN', {visible_if: {use_rest_attributes: true}});
	/** @param operation done when applying the noise (add, set, mult, substract, divide) */
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
	/** @param toggle on to recompute normals if the position has been updated */
	compute_normals = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new NoiseSopParamsConfig();

export class NoiseSopNode extends TypedSopNode<NoiseSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'noise';
	}

	private _simplex_by_seed: Map<number, SimplexNoise> = new Map();
	private _rest_pos = new Vector3();
	private _rest_value2 = new Vector2();
	private _noise_value_v = new Vector3();

	static displayed_input_names(): string[] {
		return ['geometry to add noise to'];
	}
	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE]);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const dest_points = core_group.points();

		const simplex = this._get_simplex();
		const use_normals = this.pv.use_normals && core_group.has_attrib(ATTRIB_NORMAL);
		const target_attrib_size = core_group.attrib_size(this.pv.attrib_name);
		const operation = Operations[this.pv.operation];
		const dest_attrib_name = this.pv.attrib_name;
		const use_rest_attributes: boolean = this.pv.use_rest_attributes;
		const base_amplitude: number = this.pv.amplitude;
		const use_amplitude_attrib: boolean = this.pv.tamplitude_attrib;

		let restP: Vector3 | undefined;
		let restN: Vector3 | undefined;
		let current_attrib_value: Vector3;
		for (let i = 0; i < dest_points.length; i++) {
			const dest_point = dest_points[i];

			current_attrib_value = dest_point.attrib_value(dest_attrib_name) as Vector3;
			if (use_rest_attributes) {
				restP = dest_point.attrib_value(this.pv.restP) as Vector3;
				restN = use_normals ? (dest_point.attrib_value(this.pv.restN) as Vector3) : undefined;
				current_attrib_value = restP;
			} else {
				restN = use_normals ? (dest_point.attrib_value('normal') as Vector3) : undefined;
			}

			const amplitude = use_amplitude_attrib
				? this._amplitude_from_attrib(dest_point, base_amplitude)
				: base_amplitude;

			const noise_result = this._noise_value(use_normals, simplex, amplitude, current_attrib_value, restN);
			const noise_value = this._make_noise_value_correct_size(noise_result, target_attrib_size);

			if (CoreType.isNumber(current_attrib_value) && CoreType.isNumber(noise_value)) {
				const new_attrib_value_f = this._new_attrib_value_from_float(
					operation,
					current_attrib_value,
					noise_value
				);
				dest_point.set_attrib_value(dest_attrib_name, new_attrib_value_f);
			} else {
				if (current_attrib_value instanceof Vector2 && noise_value instanceof Vector2) {
					const new_attrib_value_v = this._new_attrib_value_from_vector2(
						operation,
						current_attrib_value,
						noise_value
					);
					dest_point.set_attrib_value(dest_attrib_name, new_attrib_value_v);
				} else {
					if (current_attrib_value instanceof Vector3 && noise_value instanceof Vector3) {
						const new_attrib_value_v = this._new_attrib_value_from_vector3(
							operation,
							current_attrib_value,
							noise_value
						);
						dest_point.set_attrib_value(dest_attrib_name, new_attrib_value_v);
					} else {
						if (current_attrib_value instanceof Vector4 && noise_value instanceof Vector4) {
							const new_attrib_value_v = this._new_attrib_value_from_vector4(
								operation,
								current_attrib_value,
								noise_value
							);
							dest_point.set_attrib_value(dest_attrib_name, new_attrib_value_v);
						}
					}
				}
			}
		}

		if (!this.io.inputs.clone_required(0)) {
			for (let geometry of core_group.geometries()) {
				(geometry.getAttribute(dest_attrib_name) as BufferAttribute).needsUpdate = true;
			}
		}

		if (this.pv.compute_normals) {
			core_group.compute_vertex_normals();
		}
		this.set_core_group(core_group);
	}

	private _noise_value(
		use_normals: boolean,
		simplex: SimplexNoise,
		amplitude: number,
		restP: Vector3,
		restN?: Vector3
	) {
		this._rest_pos.copy(restP).add(this.pv.offset).multiply(this.pv.freq);
		// const pos = rest_point.position(this._rest_pos)
		if (use_normals && restN) {
			const noise = amplitude * this._fbm(simplex, this._rest_pos.x, this._rest_pos.y, this._rest_pos.z);
			this._noise_value_v.copy(restN);
			return this._noise_value_v.multiplyScalar(noise);
		} else {
			this._noise_value_v.set(
				amplitude *
					this._fbm(simplex, this._rest_pos.x + 545, this._rest_pos.y + 125454, this._rest_pos.z + 2142),
				amplitude *
					this._fbm(simplex, this._rest_pos.x - 425, this._rest_pos.y - 25746, this._rest_pos.z + 95242),
				amplitude *
					this._fbm(simplex, this._rest_pos.x + 765132, this._rest_pos.y + 21, this._rest_pos.z - 9245)
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

	private _amplitude_from_attrib(point: CorePoint, base_amplitude: number): number {
		const attrib_value = point.attrib_value(this.pv.amplitude_attrib) as NumericAttribValue;

		if (CoreType.isNumber(attrib_value)) {
			return attrib_value * base_amplitude;
		} else {
			if (attrib_value instanceof Vector2 || attrib_value instanceof Vector3 || attrib_value instanceof Vector4) {
				return attrib_value.x * base_amplitude;
			}
		}
		return 1;
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
