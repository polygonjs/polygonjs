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
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export function createPolyObjNode(nodeType: string, definition: PolyNodeDefinition): typeof TypedObjNode {
	class PolyObjParamConfig extends NodeParamsConfig {
		display = ParamConfig.BOOLEAN(1);
		template = ParamConfig.NODE_PATH('');
		debug = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				BasePolyObjNode.PARAM_CALLBACK_debug(node as BasePolyObjNode);
			},
		});
	}
	const ParamsConfig = new PolyObjParamConfig();

	class BasePolyObjNode extends TypedObjNode<Group, PolyObjParamConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return nodeType;
		}
		override readonly hierarchyController: HierarchyController = new HierarchyController(this);
		public override readonly flags: FlagsControllerD = new FlagsControllerD(this);
		override createObject() {
			const group = new Group();
			group.matrixAutoUpdate = false;
			return group;
		}

		// display_node and children_display controllers
		public override readonly childrenDisplayController: ChildrenDisplayController = new ChildrenDisplayController(
			this
		);
		public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
			this,
			this.childrenDisplayController.displayNodeControllerCallbacks()
		);
		//

		protected override _childrenControllerContext = NodeContext.SOP;

		override initializeNode() {
			this.hierarchyController.initializeNode();
			this.childrenDisplayController.initializeNode();
		}

		override isDisplayNodeCooking(): boolean {
			if (this.flags.display.active()) {
				const display_node = this.displayNodeController.displayNode();
				return display_node ? display_node.isDirty() : false;
			} else {
				return false;
			}
		}

		override createNode<S extends keyof GeoNodeChildrenMap>(
			node_class: S,
			options?: NodeCreateOptions
		): GeoNodeChildrenMap[S];
		override createNode<K extends valueof<GeoNodeChildrenMap>>(
			node_class: Constructor<K>,
			options?: NodeCreateOptions
		): K;
		override createNode<K extends valueof<GeoNodeChildrenMap>>(
			node_class: Constructor<K>,
			options?: NodeCreateOptions
		): K {
			return super.createNode(node_class, options) as K;
		}
		override children() {
			return super.children() as BaseSopNodeType[];
		}
		override nodesByType<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
			return super.nodesByType(type) as GeoNodeChildrenMap[K][];
		}

		//
		//
		// COOK
		//
		//
		override cook() {
			this.object.visible = isBooleanTrue(this.pv.display);
			this.cookController.endCook();
		}

		//
		//
		// POLY
		//
		//
		public override readonly polyNodeController: PolyNodeController = new PolyNodeController(this, definition);

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
	return BasePolyObjNode as typeof TypedObjNode;
}

export const BasePolyObjNode = createPolyObjNode('poly', {nodeContext: NodeContext.OBJ});
export class PolyObjNode extends BasePolyObjNode<any, any> {}
