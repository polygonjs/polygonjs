/**
 * created a sphere
 *
 * @remarks
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Sphere} from 'three/src/math/Sphere';
import {BaseNodeType} from '../_Base';

const OUTPUT_NAME = 'sphere';
class SphereActorParamsConfig extends NodeParamsConfig {
	/** @param sphere center */
	center = ParamConfig.VECTOR3([0, 0, 0], {
		callback: (node: BaseNodeType) => {
			SphereActorNode.PARAM_CALLBACK_updateSphere(node as SphereActorNode);
		},
	});
	/** @param sphere radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		callback: (node: BaseNodeType) => {
			SphereActorNode.PARAM_CALLBACK_updateSphere(node as SphereActorNode);
		},
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

		this.io.connection_points.initializeNode();
		// this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function((index: number) => OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.SPHERE]);
	}

	private _sphere = new Sphere();
	private _sphereUpdated = false;
	public override outputValue(context: ActorNodeTriggerContext) {
		if (!this._sphereUpdated) {
			this._updateSphere();
			this._sphereUpdated = true;
		}
		return this._sphere;
	}

	static PARAM_CALLBACK_updateSphere(node: SphereActorNode) {
		node._updateSphere();
	}
	private _updateSphere() {
		this._sphere.center.copy(this.pv.center);
		this._sphere.radius = this.pv.radius;
	}
}
