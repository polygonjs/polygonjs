/**
 * created a sphere
 *
 * @remarks
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Sphere} from 'three';
import {ParamType} from '../../poly/ParamType';

const OUTPUT_NAME = 'sphere';
class SphereActorParamsConfig extends NodeParamsConfig {
	/** @param sphere center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param sphere radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SphereActorParamsConfig();
export class SphereActorNode extends TypedActorNode<SphereActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sphere';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.SPHERE),
		]);
	}

	private _sphere = new Sphere();
	public override outputValue(context: ActorNodeTriggerContext) {
		const center = this._inputValueFromParam<ParamType.VECTOR3>(this.p.center, context);
		const radius = this._inputValueFromParam<ParamType.FLOAT>(this.p.radius, context);
		this._sphere.center.copy(center);
		this._sphere.radius = radius;
		return this._sphere;
	}
}
