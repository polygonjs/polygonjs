/**
 * creates a plane
 *
 * @remarks
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Plane} from 'three';
import {BaseNodeType} from '../_Base';

const OUTPUT_NAME = 'plane';
class PlaneActorParamsConfig extends NodeParamsConfig {
	/** @param a unit length vector defining the normal of the plane */
	normal = ParamConfig.VECTOR3([0, 1, 0], {
		callback: (node: BaseNodeType) => {
			PlaneActorNode.PARAM_CALLBACK_updatePlane(node as PlaneActorNode);
		},
	});
	/** @param the signed distance from the origin to the plane */
	constant = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
		callback: (node: BaseNodeType) => {
			PlaneActorNode.PARAM_CALLBACK_updatePlane(node as PlaneActorNode);
		},
	});
}
const ParamsConfig = new PlaneActorParamsConfig();
export class PlaneActorNode extends TypedActorNode<PlaneActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'plane';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.initializeNode();
		// this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function((index: number) => OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.PLANE]);
	}

	private _plane = new Plane();
	private _planeUpdated = false;
	public override outputValue(context: ActorNodeTriggerContext) {
		if (!this._planeUpdated) {
			this._updatePlane();
			this._planeUpdated = true;
		}
		return this._plane;
	}

	static PARAM_CALLBACK_updatePlane(node: PlaneActorNode) {
		node._updatePlane();
	}
	private _updatePlane() {
		this._plane.normal.copy(this.pv.normal);
		this._plane.constant = this.pv.constant;
	}
}
