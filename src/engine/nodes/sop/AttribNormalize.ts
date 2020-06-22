import {TypedSopNode} from './_Base';
import {Vector3} from 'three/src/math/Vector3';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreString} from '../../../core/String';
import {BufferAttribute} from 'three';

export enum NormalizeMode {
	MIN_MAX_TO_01 = 'min/max to 0/1',
	VECTOR_TO_LENGTH_1 = 'vectors to length 1',
}
const NORMALIZE_MODES: NormalizeMode[] = [NormalizeMode.MIN_MAX_TO_01, NormalizeMode.VECTOR_TO_LENGTH_1];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttribNormalizeSopParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(0, {
		menu: {
			entries: NORMALIZE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	name = ParamConfig.STRING('position');
	change_name = ParamConfig.BOOLEAN(false);
	new_name = ParamConfig.STRING('', {visible_if: {change_name: 1}});
}
const ParamsConfig = new AttribNormalizeSopParamsConfig();

export class AttribNormalizeSopNode extends TypedSopNode<AttribNormalizeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_normalize';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}

	set_mode(mode: NormalizeMode) {
		this.p.mode.set(NORMALIZE_MODES.indexOf(mode));
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const objects = input_contents[0].objects_with_geo();
		const attrib_names = CoreString.attrib_names(this.pv.name);
		for (let object of objects) {
			const geometry = object.geometry;
			for (let attrib_name of attrib_names) {
				const src_attrib = geometry.getAttribute(attrib_name) as BufferAttribute;
				if (src_attrib) {
					let dest_attrib: BufferAttribute | undefined = src_attrib;
					if (this.pv.change_name && this.pv.new_name != '') {
						dest_attrib = geometry.getAttribute(this.pv.new_name) as BufferAttribute;
						if (dest_attrib) {
							dest_attrib.needsUpdate = true;
						}

						dest_attrib = dest_attrib || src_attrib.clone();
					}
					this._normalize_attribute(src_attrib, dest_attrib);
				}
			}
		}
		this.set_core_group(core_group);
	}

	private _normalize_attribute(src_attrib: BufferAttribute, dest_attrib: BufferAttribute) {
		const mode = NORMALIZE_MODES[this.pv.mode];
		switch (mode) {
			case NormalizeMode.MIN_MAX_TO_01:
				return this._normalize_from_min_max_to_01(src_attrib, dest_attrib);
			case NormalizeMode.VECTOR_TO_LENGTH_1:
				return this._normalize_vectors(src_attrib, dest_attrib);
		}
	}

	private min3: Vector3 = new Vector3();
	private max3: Vector3 = new Vector3();
	private _normalize_from_min_max_to_01(src_attrib: BufferAttribute, dest_attrib: BufferAttribute) {
		const attrib_size = src_attrib.itemSize;
		const src_array = src_attrib.array as number[];
		const dest_array = dest_attrib.array as number[];
		// const values = points.map((point) => point.attrib_value(this.pv.name));
		switch (attrib_size) {
			case 1: {
				const minf = Math.min(...src_array);
				const maxf = Math.max(...src_array);
				for (let i = 0; i < dest_array.length; i++) {
					dest_array[i] = (src_array[i] - minf) / (maxf - minf);
				}
				return;
			}

			case 3: {
				const points_count = src_array.length / attrib_size;
				const xs = new Array(points_count);
				const ys = new Array(points_count);
				const zs = new Array(points_count);
				let j = 0;
				for (let i = 0; i < points_count; i++) {
					j = i * attrib_size;
					xs[i] = src_array[j + 0];
					ys[i] = src_array[j + 1];
					zs[i] = src_array[j + 2];
				}
				this.min3.set(Math.min(...xs), Math.min(...ys), Math.min(...zs));
				this.max3.set(Math.max(...xs), Math.max(...ys), Math.max(...zs));
				for (let i = 0; i < points_count; i++) {
					j = i * attrib_size;
					dest_array[j + 0] = (xs[i] - this.min3.x) / (this.max3.x - this.min3.x);
					dest_array[j + 1] = (ys[i] - this.min3.y) / (this.max3.y - this.min3.y);
					dest_array[j + 2] = (zs[i] - this.min3.z) / (this.max3.z - this.min3.z);
				}
				return;
			}
		}

		// let target_name = this.pv.name;
		// if (this.pv.change_name) {
		// 	target_name = this.pv.new_name;
		// 	if (!core_group.has_attrib(target_name)) {
		// 		core_group.add_numeric_vertex_attrib(target_name, attrib_size, 0);
		// 	}
		// }

		// normalized_values.forEach((normalized_value, i) => {
		// 	const point = points[i];
		// 	point.set_attrib_value(target_name, normalized_value);
		// });
	}

	private _vec: Vector3 = new Vector3();
	_normalize_vectors(src_attrib: BufferAttribute, dest_attrib: BufferAttribute) {
		const src_array = src_attrib.array;
		const dest_array = dest_attrib.array;

		const elements_count = src_array.length;
		if (src_attrib.itemSize == 3) {
			for (let i = 0; i < elements_count; i += 3) {
				this._vec.fromArray(src_array, i);
				this._vec.normalize();
				this._vec.toArray(dest_array, i);
			}
		}
	}
}
