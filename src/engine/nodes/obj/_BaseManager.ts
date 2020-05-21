import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class BaseManagerObjParamsConfig extends NodeParamsConfig {}
export class BaseManagerObjNode extends TypedObjNode<Group, BaseManagerObjParamsConfig> {
	protected _attachable_to_hierarchy: boolean = false;

	create_object() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	cook() {
		this.cook_controller.end_cook();
	}
}
