import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MathUtils, Object3D, PerspectiveCamera, Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CameraNodeType} from '../../poly/NodeContext';
import {PERSPECTIVE_CAMERA_DEFAULT, registerPerspectiveCamera} from '../../../core/camera/CorePerspectiveCamera';
import {CameraAttribute, CORE_CAMERA_DEFAULT, PerspectiveCameraAttribute} from '../../../core/camera/CoreCamera';
import {isBooleanTrue} from '../../../core/Type';
import {CameraHelper} from '../../../core/helpers/CameraHelper';
import {CoreObject} from '../../../core/geometry/Object';
import type {BaseNodeType} from '../../nodes/_Base';

interface CreatePerspectiveCameraParams {
	fov: number;
	near: number;
	far: number;
}
interface PerspectiveCameraSopParams extends CreatePerspectiveCameraParams, DefaultOperationParams {
	position: Vector3;
	rotation: Vector3;
	showHelper: boolean;
	matrixAutoUpdate: boolean;
}
interface AttributeOptions {
	fov: number;
}

export class PerspectiveCameraSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PerspectiveCameraSopParams = {
		fov: PERSPECTIVE_CAMERA_DEFAULT.fov,
		near: CORE_CAMERA_DEFAULT.near,
		far: CORE_CAMERA_DEFAULT.far,
		position: new Vector3(0, 0, 0),
		rotation: new Vector3(0, 0, 0),
		showHelper: false,
		matrixAutoUpdate: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<CameraNodeType.PERSPECTIVE> {
		return CameraNodeType.PERSPECTIVE;
	}
	static override onRegister = registerPerspectiveCamera;
	override cook(inputCoreGroups: CoreGroup[], params: PerspectiveCameraSopParams) {
		const camera = PerspectiveCameraSopOperation.createCamera(params, this._node);
		camera.name = CameraNodeType.PERSPECTIVE;

		camera.position.copy(params.position);
		camera.rotation.set(
			MathUtils.degToRad(params.rotation.x),
			MathUtils.degToRad(params.rotation.y),
			MathUtils.degToRad(params.rotation.z)
		);

		camera.updateMatrix();
		camera.updateProjectionMatrix();
		camera.matrixAutoUpdate = params.matrixAutoUpdate;

		PerspectiveCameraSopOperation.setCameraAttributes(camera, params);

		const objects: Object3D[] = [camera];
		if (isBooleanTrue(params.showHelper)) {
			const helper = new CameraHelper(camera);
			helper.update();
			camera.add(helper);
		}

		return this.createCoreGroupFromObjects(objects);
	}
	static createCamera(params: CreatePerspectiveCameraParams, nodeGenerator?: BaseNodeType) {
		const camera = new PerspectiveCamera(params.fov, 1, params.near, params.far);
		if (nodeGenerator) {
			CoreObject.addAttribute(camera, CameraAttribute.NODE_ID, nodeGenerator.graphNodeId());
		}
		return camera;
	}
	static setCameraAttributes(camera: PerspectiveCamera, options: AttributeOptions) {
		CoreObject.addAttribute(camera, PerspectiveCameraAttribute.FOV, options.fov);
	}
}
