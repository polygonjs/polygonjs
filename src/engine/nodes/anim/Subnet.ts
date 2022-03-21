/**
 * A subnet to create ANIM nodes
 *
 */
import {TypedAnimNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseAnimNodeType} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {SubnetOutputAnimNode} from './SubnetOutput';
class ParamLessSubnetAnimParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ParamLessSubnetAnimParamsConfig();

export class BaseSubnetAnimNode<K extends NodeParamsConfig> extends TypedAnimNode<K> {
	override initializeNode() {
		this.io.inputs.setCount(0, 4);
	}

	protected override _childrenControllerContext = NodeContext.ANIM;

	override createNode<S extends keyof AnimNodeChildrenMap>(
		nodeClass: S,
		options?: NodeCreateOptions
	): AnimNodeChildrenMap[S];
	override createNode<K extends valueof<AnimNodeChildrenMap>>(
		nodeClass: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<AnimNodeChildrenMap>>(
		nodeClass: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(nodeClass, options) as K;
	}
	override children() {
		return super.children() as BaseAnimNodeType[];
	}
	override nodesByType<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
		return super.nodesByType(type) as AnimNodeChildrenMap[K][];
	}

	override async cook(inputContents: TimelineBuilder[]) {
		const subnetOutput = this.nodesByType(SubnetOutputAnimNode.type())[0];
		if (!subnetOutput) {
			this.states.error.set('no output node found inside subnet');
			return this.cookController.endCook();
		}
		const container = await subnetOutput.compute();
		const timelineBuilder = container.coreContent();
		if (!timelineBuilder) {
			this.states.error.set('invalid subnetOutput');
			return this.cookController.endCook();
		}
		this.setTimelineBuilder(timelineBuilder);
	}
}

export class SubnetAnimNode extends BaseSubnetAnimNode<ParamLessSubnetAnimParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.SUBNET;
	}
}
