import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MathUtils, Object3D, OrthographicCamera, Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CameraNodeType} from '../../poly/NodeContext';
import {CameraAttribute, CORE_CAMERA_DEFAULT, OrthographicCameraAttribute} from '../../../core/camera/CoreCamera';
import {isBooleanTrue} from '../../../core/Type';
import {CameraHelper} from '../../../core/helpers/CameraHelper';
import {ORTHOGRAPHIC_CAMERA_DEFAULT, registerOrthographicCamera} from '../../../core/camera/CoreOrthographicCamera';
import {ThreejsCoreObject} from '../../../core/geometry/modules/three/ThreejsCoreObject';
import type {BaseNodeType} from '../../nodes/_Base';
import {ObjectType, registerObjectType} from '../../../core/geometry/Constant';
interface CreateOrthographicCameraParams {
	size: number;
	near: number;
	far: number;
}
interface OrthographicCameraSopParams extends CreateOrthographicCameraParams, DefaultOperationParams {
	size: number;
	position: Vector3;
	rotation: Vector3;
	showHelper: boolean;
	matrixAutoUpdate: boolean;
	name: string;
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
		name: CameraNodeType.ORTHOGRAPHIC,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<CameraNodeType.ORTHOGRAPHIC> {
		return CameraNodeType.ORTHOGRAPHIC;
	}
	static override onRegister = registerOrthographicCamera;
	override cook(inputCoreGroups: CoreGroup[], params: OrthographicCameraSopParams) {
		const camera = OrthographicCameraSopOperation.createCamera(params, this._node);
		camera.left = ORTHOGRAPHIC_CAMERA_DEFAULT.left * params.size;
		camera.right = ORTHOGRAPHIC_CAMERA_DEFAULT.right * params.size;
		camera.top = ORTHOGRAPHIC_CAMERA_DEFAULT.top * params.size;
		camera.bottom = ORTHOGRAPHIC_CAMERA_DEFAULT.bottom * params.size;
		camera.name = params.name || CameraNodeType.ORTHOGRAPHIC;

		camera.position.copy(params.position);
		camera.rotation.set(
			MathUtils.degToRad(params.rotation.x),
			MathUtils.degToRad(params.rotation.y),
			MathUtils.degToRad(params.rotation.z)
		);

		OrthographicCameraSopOperation.setCameraAttributes(camera, params);

		camera.updateWorldMatrix(false, false);
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
	static createCamera(params: CreateOrthographicCameraParams, nodeGenerator?: BaseNodeType) {
		registerObjectType({
			type: ObjectType.ORTHOGRAPHIC_CAMERA,
			ctor: OrthographicCamera,
			humanName: 'OrthographicCamera',
		});
		const camera = new OrthographicCamera(
			params.size * 2,
			params.size * 2,
			params.size * 2,
			params.size * 2,
			params.near,
			params.far
		);
		if (nodeGenerator) {
			ThreejsCoreObject.addAttribute(camera, CameraAttribute.NODE_ID, nodeGenerator.graphNodeId());
		}
		return camera;
	}
	static setCameraAttributes(camera: OrthographicCamera, options: AttributeOptions) {
		ThreejsCoreObject.addAttribute(camera, OrthographicCameraAttribute.SIZE, options.size);
	}
}
