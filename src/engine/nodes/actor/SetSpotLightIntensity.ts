/**
 * Update the spotlight intensity
 *
 *
 */
import {SpotLightContainer} from './../../../core/lights/SpotLight';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetSpotLightIntensityActorParamsConfig extends NodeParamsConfig {
	/** @param intensity */
	intensity = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetSpotLightIntensityActorParamsConfig();

export class SetSpotLightIntensityActorNode extends TypedActorNode<SetSpotLightIntensityActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'SetSpotLightIntensity';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const intensity = this._inputValueFromParam<ParamType.FLOAT>(this.p.intensity, context);
		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);

		if (Object3D instanceof SpotLightContainer) {
			const spotLight = (Object3D as SpotLightContainer).light();
			const newIntensity = lerp * intensity + (1 - lerp) * spotLight.intensity;
			spotLight.intensity = newIntensity;
		}

		this.runTrigger(context);
	}
}
