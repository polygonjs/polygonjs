import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
export class BaseManagerObjNode<K extends NodeParamsConfig> extends TypedObjNode<Group, K> {
	protected _attachable_to_hierarchy: boolean = false;

	create_object() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	cook() {
		this.cookController.end_cook();
	}
}

class ParamLessObjParamsConfig extends NodeParamsConfig {}
export class ParamLessBaseManagerObjNode extends BaseManagerObjNode<ParamLessObjParamsConfig> {}
