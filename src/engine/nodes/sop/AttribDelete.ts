/**
 * Deletes an attribute from the geometry or object.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {AttribClassMenuEntries, AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';

import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three';
import {BufferGeometry} from 'three';
import {Mesh} from 'three';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttribDeleteSopParamsConfig extends NodeParamsConfig {
	/** @param attribute class (geometry or object) */
	class = ParamConfig.INTEGER(ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX), {
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

	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}

	override cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const attrib_names = core_group.attribNamesMatchingMask(this.pv.name);

		const attribClass = ATTRIBUTE_CLASSES[this.pv.class];
		for (let attrib_name of attrib_names) {
			switch (attribClass) {
				case AttribClass.VERTEX:
					this._deleteVertexAttribute(core_group, attrib_name);
				case AttribClass.OBJECT:
					this._deleteObjectAttribute(core_group, attrib_name);
			}
		}

		this.setCoreGroup(core_group);
	}

	private _deleteVertexAttribute(core_group: CoreGroup, attrib_name: string) {
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
	private _deleteObjectAttribute(core_group: CoreGroup, attrib_name: string) {
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
