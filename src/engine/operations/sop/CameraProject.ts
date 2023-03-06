import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Camera, OrthographicCamera, PerspectiveCamera, Vector3} from 'three';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface CameraProjectSopParams extends DefaultOperationParams {
	project: boolean;
}

export class CameraProjectSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraProjectSopParams = {
		project: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'cameraProject'> {
		return 'cameraProject';
	}
	private _pointPosition = new Vector3();
	override cook(inputCoreGroups: CoreGroup[], params: CameraProjectSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const cameraCoreGroup = inputCoreGroups[1];

		let cameraObject: Camera | undefined;
		const cameraCoreGroupObjects = cameraCoreGroup.threejsObjects();
		for (let cameraCoreGroupObject of cameraCoreGroupObjects) {
			cameraCoreGroupObject.traverse((childObject) => {
				if (!cameraObject) {
					if ((childObject as Camera).isCamera) {
						cameraObject = childObject as Camera;
					}
				}
			});
		}
		if (!cameraObject) {
			this.states?.error.set(`camera not found.`);
			return inputCoreGroup;
		}
		// update cam
		cameraObject.updateMatrix();
		if (
			(cameraObject as PerspectiveCamera).isPerspectiveCamera ||
			(cameraObject as OrthographicCamera).isOrthographicCamera
		) {
			(cameraObject as PerspectiveCamera).updateProjectionMatrix();
		}

		const points = inputCoreGroup.points();
		const project = isBooleanTrue(params.project);
		for (let point of points) {
			point.getPosition(this._pointPosition);
			if (project) {
				this._pointPosition.project(cameraObject);
			} else {
				this._pointPosition.unproject(cameraObject);
			}
			point.setPosition(this._pointPosition);
		}

		return inputCoreGroup;
	}
}
