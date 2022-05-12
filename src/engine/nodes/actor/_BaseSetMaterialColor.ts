/**
 * Update the material color
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Color} from 'three';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {Material} from 'three';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class BaseSetMaterialColorActorParamsConfig extends NodeParamsConfig {
	/** @param color */
	color = ParamConfig.COLOR([1, 1, 1]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new BaseSetMaterialColorActorParamsConfig();

export abstract class BaseSetMaterialColorActorNode extends TypedActorNode<BaseSetMaterialColorActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.MATERIAL,
				ActorConnectionPointType.MATERIAL,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const material = this._inputValue<ActorConnectionPointType.MATERIAL>(
			ActorConnectionPointType.MATERIAL,
			context
		);

		if (material) {
			const color = this._inputValueFromParam<ParamType.COLOR>(this.p.color, context);
			const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);

			this._updateMaterial(material, color, lerp);

			this.runTrigger(context);
		}
	}
	protected abstract _getMaterialColorProperty(material: Material): Color;
	private _updateMaterial(material: Material, targetColor: Color, lerp: number) {
		const color = this._getMaterialColorProperty(material);
		if (!color) {
			return;
		}
		if (lerp >= 1) {
			color.copy(targetColor);
		} else {
			color.lerp(targetColor, lerp);
		}
	}
}
