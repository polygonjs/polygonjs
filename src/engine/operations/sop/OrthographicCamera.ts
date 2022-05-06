import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MathUtils, Object3D, OrthographicCamera, Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CameraNodeType} from '../../poly/NodeContext';
import {CORE_CAMERA_DEFAULT, OrthographicCameraAttribute} from '../../../core/camera/CoreCamera';
import {isBooleanTrue} from '../../../core/Type';
import {CameraHelper} from '../../../core/helpers/CameraHelper';
import {ORTHOGRAPHIC_CAMERA_DEFAULT, registerOrthographicCamera} from '../../../core/camera/CoreOrthographicCamera';
import {CoreObject} from '../../../core/geometry/Object';

interface OrthographicCameraSopParams extends DefaultOperationParams {
	size: number;
	near: number;
	far: number;
	position: Vector3;
	rotation: Vector3;
	showHelper: boolean;
	matrixAutoUpdate: boolean;
}
interface AttributeOptions {
	size: number;
}

export class OrthographicCameraSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: OrthographicCameraSopParams = {
		size: 1,
		near: CORE_CAMERA_DEFAULT.near,
		far: CORE_CAMERA_DEFAULT.far,
		position: new Vector3(0, 0, 0),
		rotation: new Vector3(0, 0, 0),
		showHelper: false,
		matrixAutoUpdate: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<CameraNodeType.ORTHOGRAPHIC> {
		return CameraNodeType.ORTHOGRAPHIC;
	}
	static override onRegister = registerOrthographicCamera;
	override cook(inputCoreGroups: CoreGroup[], params: OrthographicCameraSopParams) {
		const camera = new OrthographicCamera(
			params.size * 2,
			params.size * 2,
			params.size * 2,
			params.size * 2,
			CORE_CAMERA_DEFAULT.near,
			CORE_CAMERA_DEFAULT.far
		);
		camera.left = ORTHOGRAPHIC_CAMERA_DEFAULT.left * params.size;
		camera.right = ORTHOGRAPHIC_CAMERA_DEFAULT.right * params.size;
		camera.top = ORTHOGRAPHIC_CAMERA_DEFAULT.top * params.size;
		camera.bottom = ORTHOGRAPHIC_CAMERA_DEFAULT.bottom * params.size;
		camera.name = CameraNodeType.ORTHOGRAPHIC;

		camera.position.copy(params.position);
		camera.rotation.set(
			MathUtils.degToRad(params.rotation.x),
			MathUtils.degToRad(params.rotation.y),
			MathUtils.degToRad(params.rotation.z)
		);

		OrthographicCameraSopOperation.setCameraAttributes(camera, params);

		camera.updateMatrix();
		camera.updateProjectionMatrix();
		camera.matrixAutoUpdate = params.matrixAutoUpdate;

		const objects: Object3D[] = [camera];
		if (isBooleanTrue(params.showHelper)) {
			const helper = new CameraHelper(camera);
			helper.update();
			camera.add(helper);
		}

		return this.createCoreGroupFromObjects(objects);
	}
	static setCameraAttributes(camera: OrthographicCamera, options: AttributeOptions) {
		CoreObject.addAttribute(camera, OrthographicCameraAttribute.SIZE, options.size);
	}
}
