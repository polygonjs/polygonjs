import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {AttribClassMenuEntries, AttribClass} from '../../../core/geometry/Constant';

import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three/src/core/Object3D';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttribDeleteSopParamsConfig extends NodeParamsConfig {
	class = ParamConfig.INTEGER(AttribClass.VERTEX, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	name = ParamConfig.STRING('');
}
const ParamsConfig = new AttribDeleteSopParamsConfig();

export class AttribDeleteSopNode extends TypedSopNode<AttribDeleteSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_delete';
	}

	static displayed_input_names(): string[] {
		return ['geometry to delete attributes from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const attrib_names = core_group.attrib_names_matching_mask(this.pv.name);

		for (let attrib_name of attrib_names) {
			switch (this.pv.class) {
				case AttribClass.VERTEX:
					this.delete_vertex_attribute(core_group, attrib_name);
				case AttribClass.OBJECT:
					this.delete_object_attribute(core_group, attrib_name);
			}
		}

		this.set_core_group(core_group);
	}

	delete_vertex_attribute(core_group: CoreGroup, attrib_name: string) {
		for (let object of core_group.objects()) {
			object.traverse((object3d: Object3D) => {
				const child = object3d as Mesh;
				if (child.geometry) {
					const core_geometry = new CoreGeometry(child.geometry as BufferGeometry);
					core_geometry.delete_attribute(attrib_name);
				}
			});
		}
	}
	delete_object_attribute(core_group: CoreGroup, attrib_name: string) {
		for (let object of core_group.objects()) {
			let index = 0;
			object.traverse((object3d: Object3D) => {
				const child = object3d as Mesh;
				const core_object = new CoreObject(child, index);
				core_object.delete_attribute(attrib_name);
				index++;
			});
		}
	}
}
