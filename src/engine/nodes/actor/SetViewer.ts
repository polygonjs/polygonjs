/**
 * Update the viewer
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
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetViewerActorParamsConfig extends NodeParamsConfig {
	/** @param sets the class of the viewer */
	className = ParamConfig.STRING('active');
	/** @param set or unset */
	set = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetViewerActorParamsConfig();

export class SetViewerActorNode extends TypedActorNode<SetViewerActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setViewer';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const viewer = this.scene().viewersRegister.firstViewer();
		const canvas = viewer?.canvas();
		if (!canvas) {
			return;
		}
		const className = this._inputValueFromParam<ParamType.STRING>(this.p.className, context);
		const setValue: boolean = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.set, context);
		if (viewer) {
			if (setValue) {
				canvas.classList.add(className);
			} else {
				canvas.classList.remove(className);
			}
		}
	}
}
