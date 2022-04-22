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
import {Object3D} from 'three';
import {BufferGeometry} from 'three';
import {Mesh} from 'three';

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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribDelete';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to delete attributes from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(input_contents: CoreGroup[]) {
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
