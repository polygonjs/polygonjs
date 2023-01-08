import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {Object3D} from 'three';
import {PolyScene} from '../../scene/PolyScene';
import {CoreARjsController} from '../../../core/webXR/arjs/CoreARjsController';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';

interface CameraTrackMarkerSopParams extends DefaultOperationParams {
	marker: string;
}

interface UpdateObjectOptions {
	scene: PolyScene;
	objects: Object3D[];
	params: CameraTrackMarkerSopParams;
	active: boolean;
}

export class CameraTrackMarkerSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraTrackMarkerSopParams = {
		marker: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.TRACK_MARKER> {
		return CameraSopNodeType.TRACK_MARKER;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraTrackMarkerSopParams) {
		const objects = inputCoreGroups[0].objects();

		if (this._node) {
			CameraTrackMarkerSopOperation.updateObject({scene: this._node.scene(), objects, params, active: true});
		}

		return this.createCoreGroupFromObjects(objects);
	}
	static updateObject(options: UpdateObjectOptions) {
		const {scene, objects, params, active} = options;

		scene.arjs.setControllerCreationFunction((options) => {
			return new CoreARjsController(options);
		});

		for (let object of objects) {
			CoreObject.addAttribute(object, CameraAttribute.ARJS_TRACK_MARKER, active);
			CoreObject.addAttribute(object, CameraAttribute.ARJS_TRACK_MARKER_MARKER_URL, params.marker);
		}
	}
}
