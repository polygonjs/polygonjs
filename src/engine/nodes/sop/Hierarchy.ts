import {Object3D} from 'three/src/core/Object3D';
import {Group} from 'three/src/objects/Group';
const THREE = {Group, Object3D};
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
// import {CoreGroup} from '../../../Core/Geometry/Group';
// import {CoreConstant} from '../../../Core/Geometry/Constant'

export enum HierarchyMode {
	ADD_PARENT = 'add_parent',
	REMOVE_PARENT = 'remove_parent',
}
export const HIERARCHY_MODES: Array<HierarchyMode> = [HierarchyMode.ADD_PARENT, HierarchyMode.REMOVE_PARENT];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class HierarchySopParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(0, {
		menu: {
			entries: HIERARCHY_MODES.map((m, i) => {
				return {name: m, value: i};
			}),
		},
	});
	levels = ParamConfig.INTEGER(1, {range: [0, 5]});
}
const ParamsConfig = new HierarchySopParamsConfig();

export class HierarchySopNode extends TypedSopNode<HierarchySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'hierarchy';
	}

	static displayed_input_names(): string[] {
		return ['geometry to add or remove parents to/from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		// const group_wrapper = new CoreGroup(group);

		if (HIERARCHY_MODES[this.pv.mode] == HierarchyMode.ADD_PARENT) {
			const objects = this._add_parent_to_core_group(core_group);
			this.set_objects(objects);
		} else {
			const objects = this._remove_parent_from_core_group(core_group);
			this.set_objects(objects);
		}
	}

	private _add_parent_to_core_group(core_group: CoreGroup): THREE.Object3D[] {
		if (this.pv.levels == 0) {
			return core_group.objects();
		} else {
			const new_objects: Object3D[] = [];
			let new_object;
			for (let object of core_group.objects()) {
				new_object = this._add_parent_to_object(object);
				if (new_object) {
					new_objects.push(new_object);
				}
			}

			return new_objects;
		}
	}
	private _add_parent_to_object(object: THREE.Object3D): THREE.Object3D {
		let new_parent = new THREE.Group();
		new_parent.matrixAutoUpdate = false;

		// while(child = object.children[0]){
		new_parent.add(object);
		// }

		if (this.pv.levels > 0) {
			for (let i = 0; i < this.pv.levels - 1; i++) {
				// for (let i of lodash_range(this.pv.levels - 1)) {
				new_parent = this._add_new_parent(new_parent);
			}
		}

		return new_parent;
	}

	private _add_new_parent(object: THREE.Object3D): THREE.Group {
		const new_parent2 = new THREE.Group();
		new_parent2.matrixAutoUpdate = false;
		new_parent2.add(object);
		return new_parent2;
	}

	private _remove_parent_from_core_group(core_group: CoreGroup): THREE.Object3D[] {
		if (this.pv.levels == 0) {
			return core_group.objects();
		} else {
			const new_objects: Object3D[] = [];
			for (let object of core_group.objects()) {
				const new_children = this._remove_parent_from_object(object);
				for (let new_child of new_children) {
					new_objects.push(new_child);
				}
			}
			return new_objects;
		}
	}

	private _remove_parent_from_object(object: THREE.Object3D): THREE.Object3D[] {
		let current_children = object.children;

		for (let i = 0; i < this.pv.levels - 1; i++) {
			current_children = this._get_children_from_objects(current_children);
		}

		return current_children;
	}

	private _get_children_from_objects(objects: THREE.Object3D[]): THREE.Object3D[] {
		let object;
		const children: Object3D[] = [];
		while ((object = objects.pop())) {
			if (object.children) {
				for (let child of object.children) {
					children.push(child);
				}
			}
		}
		return children;
	}
}
