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
import {ParamsInitData} from '../utils/io/IOController';
class GeoObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	/** @param toggle off to hide */
	display = ParamConfig.BOOLEAN(1);
	/** @param set render order */
	render_order = ParamConfig.INTEGER(0, {
		range: [0, 10],
		range_locked: [true, false],
	});
}
const ParamsConfig = new GeoObjParamConfig();

export class GeoObjNode extends TypedObjNode<Group, GeoObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'geo';
	}
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	readonly transform_controller: TransformController = new TransformController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	create_object() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	// display_node and children_display controllers
	public readonly children_display_controller: ChildrenDisplayController = new ChildrenDisplayController(this);
	public readonly display_node_controller: DisplayNodeController = new DisplayNodeController(
		this,
		this.children_display_controller.display_node_controller_callbacks()
	);
	//

	protected _children_controller_context = NodeContext.SOP;

	private _on_child_add_bound = this._on_child_add.bind(this);
	initialize_node() {
		// this.lifecycle.add_on_create_hook(this._on_create_bound);
		this.lifecycle.add_on_child_add_hook(this._on_child_add_bound);

		this.hierarchy_controller.initialize_node();
		this.transform_controller.initialize_node();

		this.children_display_controller.initialize_node();
	}

	is_display_node_cooking(): boolean {
		if (this.flags.display.active) {
			const display_node = this.display_node_controller.display_node;
			return display_node ? display_node.is_dirty : false;
		} else {
			return false;
		}
	}

	createNode<S extends keyof GeoNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): GeoNodeChildrenMap[S];
	createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GeoNodeChildrenMap[K][];
	}

	//
	//
	// HOOK
	//
	//

	_on_child_add(node: BaseNodeType) {
		if (this.scene.loading_controller.loaded) {
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
		this.transform_controller.update();
		this.object.visible = this.pv.display;
		this.object.renderOrder = this.pv.render_order;
		this.cook_controller.end_cook();
	}
}
