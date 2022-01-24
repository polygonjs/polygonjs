import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
export class BaseManagerObjNode<K extends NodeParamsConfig> extends TypedObjNode<Group, K> {
	protected override _attachableToHierarchy: boolean = false;

	override createObject() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	override cook() {
		this.cookController.endCook();
	}
}

class ParamLessObjParamsConfig extends NodeParamsConfig {}
export class ParamLessBaseManagerObjNode extends BaseManagerObjNode<ParamLessObjParamsConfig> {}
