/**
 * Creates an empty group.
 *
 * @remarks
 * This node also has its own transforms. And if it is set as input of other nodes, their objects will be added as children to the object of this node.
 *
 */
import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {HierarchyController} from './utils/HierarchyController';
class NullObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {}
const ParamsConfig = new NullObjParamConfig();

export class NullObjNode extends TypedObjNode<Group, NullObjParamConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'null';
	}
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	readonly transformController: TransformController = new TransformController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = new AxesHelper(1);

	createObject() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	initializeNode() {
		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();
		this._updateHelperHierarchy();
		this._helper.matrixAutoUpdate = false;
		this.flags.display.onUpdate(() => {
			this._updateHelperHierarchy();
		});
	}
	private _updateHelperHierarchy() {
		if (this.flags.display.active()) {
			this.object.add(this._helper);
		} else {
			this.object.remove(this._helper);
		}
	}

	cook() {
		this.transformController.update();
		this.cookController.endCook();
	}
}
