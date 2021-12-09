/**
 * Parent for SOP nodes
 *
 * @remarks
 * This node also has its own transforms. And if it is set as input of other nodes, their objects will be added as children to the object of this node.
 *
 */
import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {BaseNodeType} from '../_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {NodeContext} from '../../poly/NodeContext';
import {BaseSopNodeType} from '../sop/_Base';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {FlagsControllerD} from '../utils/FlagsController';
import {HierarchyController} from './utils/HierarchyController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ChildrenDisplayController} from './utils/ChildrenDisplayController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
class GeoObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	/** @param toggle off to hide */
	display = ParamConfig.BOOLEAN(1);
	/** @param set render order */
	renderOrder = ParamConfig.INTEGER(0, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new GeoObjParamConfig();

export class GeoObjNode extends TypedObjNode<Group, GeoObjParamConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return ObjType.GEO;
	}
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	readonly transformController: TransformController = new TransformController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	createObject() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	// display_node and children_display controllers
	public readonly childrenDisplayController: ChildrenDisplayController = new ChildrenDisplayController(this);
	public readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.childrenDisplayController.displayNodeControllerCallbacks()
	);
	//

	protected _childrenControllerContext = NodeContext.SOP;

	private _onChildAddBound = this._onChildAdd.bind(this);
	initializeNode() {
		// this.lifecycle.add_on_create_hook(this._on_create_bound);
		this.lifecycle.add_on_child_add_hook(this._onChildAddBound);

		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();

		this.childrenDisplayController.initializeNode();
	}

	isDisplayNodeCooking(): boolean {
		if (this.flags.display.active()) {
			const display_node = this.displayNodeController.displayNode();
			return display_node ? display_node.isDirty() : false;
		} else {
			return false;
		}
	}

	createNode<S extends keyof GeoNodeChildrenMap>(node_class: S, options?: NodeCreateOptions): GeoNodeChildrenMap[S];
	createNode<K extends valueof<GeoNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<GeoNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodesByType<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodesByType(type) as GeoNodeChildrenMap[K][];
	}

	//
	//
	// HOOK
	//
	//
	private _onChildAdd(node: BaseNodeType) {
		if (this.scene().loadingController.loaded()) {
			if (this.children().length == 1) {
				node.flags?.display?.set(true);
			}
		}
	}

	//
	//
	// COOK
	//
	//
	cook() {
		this.transformController.update();
		this.object.visible = isBooleanTrue(this.pv.display);
		this.object.renderOrder = this.pv.renderOrder;
		this.cookController.endCook();
	}
}
