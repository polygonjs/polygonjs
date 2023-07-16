/**
 * Adds post processing effects to a camera
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraPostProcessSopOperation} from '../../operations/sop/CameraPostProcess';
import {HierarchyParamConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType, NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BasePostProcessNodeType} from '../post/_Base';
import {EffectComposerController, PostProcessNetworkParamsConfigMixin} from '../post/utils/EffectComposerController';
import {DisplayNodeController} from '../utils/DisplayNodeController';
const DEFAULT = CameraPostProcessSopOperation.DEFAULT_PARAMS;

export function CameraPostProcessParamsMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param set to true to define the post process nodes from a different node than this one */
		useOtherNode = ParamConfig.BOOLEAN(DEFAULT.useOtherNode);
		/** @param other parent node containing the post process nodes that will make up the passes used */
		node = ParamConfig.NODE_PATH('', {
			visibleIf: {useOtherNode: 1},
			nodeSelection: {
				types: [NetworkNodeType.POST, CameraSopNodeType.POST_PROCESS],
			},
			dependentOnFoundNode: true,
			separatorAfter: true,
		});
	};
}

class CameraPostProcessSopParamsConfig extends PostProcessNetworkParamsConfigMixin(
	CameraPostProcessParamsMixin(HierarchyParamConfig)
) {}
const ParamsConfig = new CameraPostProcessSopParamsConfig();

export class CameraPostProcessSopNode extends TypedSopNode<CameraPostProcessSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.POST_PROCESS;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraPostProcessSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraPostProcessSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraPostProcessSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(core_group);
	}
	/*
	children
	*/
	readonly effectsComposerController: EffectComposerController = new EffectComposerController(this);
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.effectsComposerController.displayNodeControllerCallbacks()
	);
	protected override _childrenControllerContext = NodeContext.POST;
	override createNode<S extends keyof PostNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): PostNodeChildrenMap[S];
	override createNode<K extends valueof<PostNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<PostNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BasePostProcessNodeType[];
	}
	override nodesByType<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][] {
		return super.nodesByType(type) as PostNodeChildrenMap[K][];
	}
}
