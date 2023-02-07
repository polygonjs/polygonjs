/**
 * cooks a node
 *
 *
 */
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class CookNodeActorParamsConfig extends NodeParamsConfig {
	/** @param  node to cook */
	node = ParamConfig.NODE_PATH('', {
		dependentOnFoundNode: false,
		computeOnDirty: true,
	});
}
const ParamsConfig = new CookNodeActorParamsConfig();

export class CookNodeActorNode extends TypedActorNode<CookNodeActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'cookNode';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}

	public override async receiveTrigger(context: ActorNodeTriggerContext) {
		if (this.p.node.isDirty()) {
			// TODO: investigate occasions
			// where the referenced param is recomputed
			// (such as in a material builder)
			// and this node refers to an old param
			await this.p.node.compute();
		}
		const node = this.p.node.value.node();

		if (node) {
			node.setDirty();
			node.compute();
		} else {
			this.states.error.set('target node not found');
		}

		this.runTrigger(context);
	}
}
