import {TypedSopNode} from './_Base';

import {Object3D} from 'three/src/core/Object3D';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';

class BlendSopParamsConfig extends NodeParamsConfig {
	attrib_name = ParamConfig.STRING();
	blend = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		range_locked: [true, true],
	});
}
const ParamsConfig = new BlendSopParamsConfig();

export class BlendSopNode extends TypedSopNode<BlendSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'blend';
	}

	static displayed_input_names(): string[] {
		return ['geometry to blend from', 'geometry to blend to'];
	}
	initialize_node() {
		this.io.inputs.set_count(2);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	cook(input_contents: CoreGroup[]) {
		// this.request_input_container 0, (container0)=>
		// 	if container0? && (group0 = container0.group())?
		// 		this.request_input_container 1, (container1)=>
		// 			if container1? && (group1 = container1.group({clone: false}))?

		//this.eval_all_params =>
		// const container0 = input_containers[0];
		// const container1 = input_containers[1];

		// const group0 = container0.group();
		// const group1 = container1.group();
		const core_group0 = input_contents[0];
		const core_group1 = input_contents[1];

		const objects0 = core_group0.objects();
		const objects1 = core_group1.objects();

		let object0, object1;
		for (let i = 0; i < objects0.length; i++) {
			object0 = objects0[i];
			object1 = objects1[i];
			this.blend(object0, object1, this.pv.blend);
		}
		this.set_core_group(core_group0);
	}

	// 		else
	// 			this.set_error("input 1 required")

	// else
	// 	this.set_error("input 0 required")
	private blend(object0: Object3D, object1: Object3D, blend: number) {
		const geometry0 = (object0 as Mesh).geometry as BufferGeometry;
		const geometry1 = (object1 as Mesh).geometry as BufferGeometry;
		if (geometry0 == null || geometry1 == null) {
			return;
		}

		const attrib0 = geometry0.getAttribute(this.pv.attrib_name);
		const attrib1 = geometry1.getAttribute(this.pv.attrib_name);
		if (attrib0 == null || attrib1 == null) {
			return;
		}

		const attrib0_array = attrib0.array as number[];
		const attrib1_array = attrib1.array as number[];

		let c0, c1;
		for (let i = 0; i < attrib0_array.length; i++) {
			c0 = attrib0_array[i];
			c1 = attrib1_array[i];
			if (c1 != null) {
				attrib0_array[i] = (1 - blend) * c0 + blend * c1;
			}
		}

		geometry0.computeVertexNormals();
	}
}
