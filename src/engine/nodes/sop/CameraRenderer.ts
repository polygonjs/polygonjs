/**
 * overrides the renderer used by the camera
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraRendererSopOperation} from '../../operations/sop/CameraRenderer';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType, NodeContext} from '../../poly/NodeContext';
import {RopNodeChildrenMap} from '../../poly/registers/nodes/Rop';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseRopNodeType} from '../rop/_Base';
const DEFAULT = CameraRendererSopOperation.DEFAULT_PARAMS;
class CameraRendererSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param sets if this node should search through the materials inside the whole hierarchy */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {separatorAfter: true});
	/** @param renderer */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.ROP,
		},
		dependentOnFoundNode: true,
	});
}
const ParamsConfig = new CameraRendererSopParamsConfig();

export class CameraRendererSopNode extends TypedSopNode<CameraRendererSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.RENDERER;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraRendererSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraRendererSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraRendererSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}

	/*
	children
	*/
	protected override _childrenControllerContext = NodeContext.ROP;
	override createNode<S extends keyof RopNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): RopNodeChildrenMap[S];
	override createNode<K extends valueof<RopNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<RopNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseRopNodeType[];
	}
	override nodesByType<K extends keyof RopNodeChildrenMap>(type: K): RopNodeChildrenMap[K][] {
		return super.nodesByType(type) as RopNodeChildrenMap[K][];
	}
}
