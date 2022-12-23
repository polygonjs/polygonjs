/**
 * get a the camera default scene
 *
 *
 */
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';

class GetDefaultCameraActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GetDefaultCameraActorParamsConfig();

export class GetDefaultCameraActorNode extends TypedActorNode<GetDefaultCameraActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getDefaultCamera';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('camera', ActorConnectionPointType.CAMERA),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType.CAMERA] {
		return (
			this.scene().root().mainCameraController.cameraSync() ||
			this.scene().viewersRegister.lastRenderedViewer()?.camera() ||
			this.scene().root().mainCameraController.dummyPerspectiveCamera()
		);
	}
}
