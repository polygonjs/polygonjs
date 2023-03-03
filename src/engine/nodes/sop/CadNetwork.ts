/**
 * parent node for CAD children nodes
 *
 * @remarks
 *
 * This nodes converts the CAD operations created by its children into a geometry format compatible with all other geometry nodes
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {CadNodeChildrenMap} from '../../poly/registers/nodes/Cad';
import {BaseCadNodeType} from '../cad/_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {CadChildrenDisplayController} from './utils/cad/CadChildrenNodesController';
// import {BaseNodeType} from '../_Base';

class CadNetworkParamsConfig extends NodeParamsConfig {
	/** @param linear Tolerance */
	linearTolerance = ParamConfig.FLOAT(0.1, {
		range: [0.001, 1],
		rangeLocked: [true, false],
		// cook: false,
		// callback: (node: BaseNodeType) => {
		// 	CadNetworkSopNode.PARAM_CALLBACK_displayNodeSetDirty(node as CadNetworkSopNode);
		// },
	});
	/** @param angular Tolerance */
	angularTolerance = ParamConfig.FLOAT(0.1, {
		range: [0.001, 1],
		rangeLocked: [true, false],
		// cook: false,
		// callback: (node: BaseNodeType) => {
		// 	CadNetworkSopNode.PARAM_CALLBACK_displayNodeSetDirty(node as CadNetworkSopNode);
		// },
	});
	/** @param curve Abscissa */
	curveAbscissa = ParamConfig.FLOAT(0.1, {
		range: [0.001, 1],
		rangeLocked: [true, false],
		// cook: false,
		// callback: (node: BaseNodeType) => {
		// 	CadNetworkSopNode.PARAM_CALLBACK_displayNodeSetDirty(node as CadNetworkSopNode);
		// },
	});
	/** @param curve Tolerance */
	curveTolerance = ParamConfig.FLOAT(0.1, {
		range: [0.001, 1],
		rangeLocked: [true, false],
		// cook: false,
		// callback: (node: BaseNodeType) => {
		// 	CadNetworkSopNode.PARAM_CALLBACK_displayNodeSetDirty(node as CadNetworkSopNode);
		// },
	});
	/** @param display edges */
	displayEdges = ParamConfig.BOOLEAN(true, {
		separatorBefore: true,
	});
	/** @param edges color */
	edgesColor = ParamConfig.COLOR([0, 0, 0]);
	/** @param display meshes */
	displayMeshes = ParamConfig.BOOLEAN(true);
	/** @param meshes color */
	meshesColor = ParamConfig.COLOR([1, 1, 1], {
		visibleIf: {
			displayMeshes: true,
		},
	});
	/** @param wireframe */
	wireframe = ParamConfig.BOOLEAN(false, {
		visibleIf: {
			displayMeshes: true,
		},
	});
}
const ParamsConfig = new CadNetworkParamsConfig();

export class CadNetworkSopNode extends TypedSopNode<CadNetworkParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.CAD;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const displayNode = this.displayNodeController.displayNode() as BaseCadNodeType | undefined;
		if (!displayNode) {
			this.states.error.set(`at least 1 display node is required`);
			return;
		}
		// if (!displayNode.isDirty()) {
		// 	displayNode.setDirty();
		// }
		const container = await displayNode.compute();
		const cadCoreGroup = container.coreContent();
		if (!cadCoreGroup) {
			this.states.error.set(`displayNode ${displayNode.path()} is invalid`);
			return;
		}
		const objects = await cadCoreGroup.toObject3Ds(this.pv);

		return this.setObjects(objects);
	}

	/*
	 display node force recook
	 */
	// static PARAM_CALLBACK_displayNodeSetDirty(node: CadNetworkSopNode) {
	// 	node._displayNodeSetDirty();
	// }
	// private _displayNodeSetDirty() {
	// 	//
	// 	//
	// 	// I haven't yet found a reliable way to have updated tesselation params
	// 	// refresh the mesh as expected,
	// 	// so for now, I make the displayNode dirty, which will force a new shape
	// 	//
	// 	//
	// 	const displayNode = this.displayNodeController.displayNode() as BaseCadNodeType | undefined;
	// 	if (!displayNode) {
	// 		this.states.error.set(`at least 1 display node is required`);
	// 		return;
	// 	}
	// 	displayNode.setDirty();
	// }

	/*
	 children
	 */
	// display_node and children_display controllers
	public readonly childrenDisplayController: CadChildrenDisplayController = new CadChildrenDisplayController(this);
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.childrenDisplayController.displayNodeControllerCallbacks()
	);
	//
	protected override _childrenControllerContext = NodeContext.CAD;
	override createNode<S extends keyof CadNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): CadNodeChildrenMap[S];
	override createNode<K extends valueof<CadNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<CadNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseCadNodeType[];
	}
	override nodesByType<K extends keyof CadNodeChildrenMap>(type: K): CadNodeChildrenMap[K][] {
		return super.nodesByType(type) as CadNodeChildrenMap[K][];
	}
}
