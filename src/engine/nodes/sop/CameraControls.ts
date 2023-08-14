/**
 * sets the controls used by the camera
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraControlsSopOperation} from '../../operations/sop/CameraControls';
import {HierarchyParamConfigAll, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType, NodeContext} from '../../poly/NodeContext';
import {EventNodeChildrenMap} from '../../poly/registers/nodes/Event';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseEventNodeType} from '../event/_Base';
class CameraControlsSopParamsConfig extends HierarchyParamConfigAll {
	/** @param renderer */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.EVENT,
		},
		dependentOnFoundNode: true,
	});
}
const ParamsConfig = new CameraControlsSopParamsConfig();

export class CameraControlsSopNode extends TypedSopNode<CameraControlsSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.CONTROLS;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraControlsSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraControlsSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraControlsSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
	/*
	children
	*/
	protected override _childrenControllerContext = NodeContext.EVENT;
	override createNode<S extends keyof EventNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): EventNodeChildrenMap[S];
	override createNode<K extends valueof<EventNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<EventNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseEventNodeType[];
	}
	override nodesByType<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][] {
		return super.nodesByType(type) as EventNodeChildrenMap[K][];
	}
}
