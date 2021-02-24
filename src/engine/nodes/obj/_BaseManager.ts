import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
export class BaseManagerObjNode<K extends NodeParamsConfig> extends TypedObjNode<Group, K> {
	protected _attachableToHierarchy: boolean = false;

	createObject() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	cook() {
		this.cookController.endCook();
	}
}

class ParamLessObjParamsConfig extends NodeParamsConfig {}
export class ParamLessBaseManagerObjNode extends BaseManagerObjNode<ParamLessObjParamsConfig> {}
