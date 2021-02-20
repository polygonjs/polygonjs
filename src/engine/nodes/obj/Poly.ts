import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {BaseNodeType} from '../_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {NodeContext} from '../../poly/NodeContext';
import {BaseSopNodeType} from '../sop/_Base';
import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {FlagsControllerD} from '../utils/FlagsController';
import {HierarchyController} from './utils/HierarchyController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ChildrenDisplayController} from './utils/ChildrenDisplayController';
import {PolyNodeController, PolyNodeDefinition} from '../utils/poly/PolyNodeController';
import {ParamsInitData} from '../utils/io/IOController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../core/BooleanValue';

export function createPolyObjNode(node_type: string, definition: PolyNodeDefinition) {
	class PolyObjParamConfig extends NodeParamsConfig {
		display = ParamConfig.BOOLEAN(1);
		template = ParamConfig.OPERATOR_PATH('../template');
		debug = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				BasePolyObjNode.PARAM_CALLBACK_debug(node as BasePolyObjNode);
			},
		});
	}
	const ParamsConfig = new PolyObjParamConfig();

	class BasePolyObjNode extends TypedObjNode<Group, PolyObjParamConfig> {
		params_config = ParamsConfig;
		static type() {
			return node_type;
		}
		readonly hierarchyController: HierarchyController = new HierarchyController(this);
		public readonly flags: FlagsControllerD = new FlagsControllerD(this);
		create_object() {
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

		protected _children_controller_context = NodeContext.SOP;

		initializeNode() {
			this.hierarchyController.initializeNode();
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
		nodesByType<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
			return super.nodesByType(type) as GeoNodeChildrenMap[K][];
		}

		//
		//
		// COOK
		//
		//
		cook() {
			this.object.visible = isBooleanTrue(this.pv.display);
			this.cookController.end_cook();
		}

		//
		//
		// POLY
		//
		//
		public readonly polyNodeController: PolyNodeController = new PolyNodeController(this, definition);

		//
		//
		// POLY TESTS
		//
		//
		static PARAM_CALLBACK_debug(node: BasePolyObjNode) {
			node._debug();
		}

		private _debug() {
			this.polyNodeController.debug(this.p.template);
		}
	}
	return BasePolyObjNode;
}

const BasePolyObjNode = createPolyObjNode('poly', {nodeContext: NodeContext.OBJ});
export class PolyObjNode extends BasePolyObjNode {}
