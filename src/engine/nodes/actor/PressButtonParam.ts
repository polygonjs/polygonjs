/**
 * Presses a param button
 *
 *
 */
import {ButtonParam} from './../../params/Button';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PressButtonParamActorParamsConfig extends NodeParamsConfig {
	/** @param the parameter to update */
	param = ParamConfig.PARAM_PATH('', {
		dependentOnFoundParam: false,
		paramSelection: ParamType.BUTTON,
		computeOnDirty: true,
	});
}
const ParamsConfig = new PressButtonParamActorParamsConfig();

export class PressButtonParamActorNode extends TypedActorNode<PressButtonParamActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'pressButtonParam';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override async receiveTrigger(context: ActorNodeTriggerContext) {
		if (this.p.param.isDirty()) {
			// TODO: investigate occasions
			// where the referenced param is recomputed
			// (such as in a material builder)
			// and this node refers to an old param
			await this.p.param.compute();
		}
		const param = this.p.param.value.param();

		if (param) {
			if (param instanceof ButtonParam) {
				param.pressButton();
			} else {
				this.states.error.set('target param is not a button param');
			}
		} else {
			this.states.error.set('target param not found');
		}

		this.runTrigger(context);
	}
}
