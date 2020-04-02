/// <reference path="./types/occlusion.d.ts" />
// https://github.com/wwwtyro/geo-ambient-occlusion
import geoao from 'geo-ambient-occlusion';

import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
const THREE = {Float32BufferAttribute};
import {TypedSopNode} from './_Base';

// import {CoreGroup} from '../../../Core/Geometry/Group';
import {CoreObject} from '../../../core/geometry/Object';
// import {CoreGeometry} from '../../../Core/Geometry/Geometry'
// import {CorePoint} from '../../../Core/Geometry/Point'

import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class OcclusionSopParamsConfig extends NodeParamsConfig {
	attrib_name = ParamConfig.STRING('occlusion');
	samples = ParamConfig.INTEGER(256, {
		range: [1, 256],
		range_locked: [true, false],
	});
	sep = ParamConfig.SEPARATOR();
	buffer_resolution = ParamConfig.INTEGER(512);
	bias = ParamConfig.FLOAT(0.01);
}
const ParamsConfig = new OcclusionSopParamsConfig();

export class OcclusionSopNode extends TypedSopNode<OcclusionSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'occlusion';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
		// this.ui_data.set_icon('palette');
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const core_objects = core_group.core_objects();

		for (let core_object of core_objects) {
			await this._process_occlusion_on_object(core_object);
		}

		this.set_core_group(core_group);
	}

	private async _process_occlusion_on_object(core_object: CoreObject) {
		const geometry = core_object.core_geometry().geometry();

		const position_array = geometry.attributes.position.array;
		const normal_array = geometry.attributes.normal.array;
		const index_array = geometry.getIndex()?.array;
		const aoSampler = geoao(position_array, {
			cells: index_array,
			normals: normal_array,
			resolution: this.pv.buffer_resolution,
			bias: this.pv.bias,
		});

		for (let i = 0; i < this.pv.samples; i++) {
			aoSampler.sample();
		}
		const ao = aoSampler.report();

		geometry.setAttribute(this.pv.attrib_name, new THREE.Float32BufferAttribute(ao, 1));

		aoSampler.dispose();
	}
}
