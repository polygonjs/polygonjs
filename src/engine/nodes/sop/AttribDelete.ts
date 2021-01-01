/**
 * Deletes an attribute from the geometry or object.
 *
 *
 */
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
	/** @param attribute class (geometry or object) */
	class = ParamConfig.INTEGER(AttribClass.VERTEX, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param attribute name to delete */
	name = ParamConfig.STRING('');
}
const ParamsConfig = new AttribDeleteSopParamsConfig();

export class AttribDeleteSopNode extends TypedSopNode<AttribDeleteSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribDelete';
	}

	static displayed_input_names(): string[] {
		return ['geometry to delete attributes from'];
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

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const attrib_names = core_group.attribNamesMatchingMask(this.pv.name);

		for (let attrib_name of attrib_names) {
			switch (this.pv.class) {
				case AttribClass.VERTEX:
					this.delete_vertex_attribute(core_group, attrib_name);
				case AttribClass.OBJECT:
					this.delete_object_attribute(core_group, attrib_name);
			}
		}

		this.setCoreGroup(core_group);
	}

	delete_vertex_attribute(core_group: CoreGroup, attrib_name: string) {
		for (let object of core_group.objects()) {
			object.traverse((object3d: Object3D) => {
				const child = object3d as Mesh;
				if (child.geometry) {
					const core_geometry = new CoreGeometry(child.geometry as BufferGeometry);
					core_geometry.deleteAttribute(attrib_name);
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
				core_object.deleteAttribute(attrib_name);
				index++;
			});
		}
	}
}
