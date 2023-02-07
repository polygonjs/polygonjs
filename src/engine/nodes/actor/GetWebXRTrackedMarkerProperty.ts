/**
 * get the matrix of a tracked marker
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Matrix4} from 'three';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypeAssert} from '../../poly/Assert';
import {Poly} from '../../Poly';

enum GetWebXRTrackedMarkerActorNodeInputName {
	matrix = 'matrix',
}

const tmpMatrix = new Matrix4();

class GetWebXRTrackedMarkerActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GetWebXRTrackedMarkerActorParamsConfig();

export class GetWebXRTrackedMarkerPropertyActorNode extends TypedActorNode<GetWebXRTrackedMarkerActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'getWebXRTrackedMarkerProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(GetWebXRTrackedMarkerActorNodeInputName.matrix, ActorConnectionPointType.MATRIX4),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetWebXRTrackedMarkerActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const controller = Poly.thirdParty.markerTracking().controller();

		switch (outputName) {
			case GetWebXRTrackedMarkerActorNodeInputName.matrix: {
				controller?.trackedMatrix(tmpMatrix);
				return tmpMatrix;
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
