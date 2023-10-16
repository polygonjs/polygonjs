import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MathUtils, Object3D, PerspectiveCamera, Vector3, CubeCamera, WebGLCubeRenderTarget} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CameraNodeType} from '../../poly/NodeContext';
import {CameraAttribute, CORE_CAMERA_DEFAULT} from '../../../core/camera/CoreCamera';
import {CUBE_CAMERA_DEFAULT, registerCubeCamera} from '../../../core/camera/CoreCubeCamera';
import {isBooleanTrue} from '../../../core/Type';
import {CameraHelper} from '../../../core/helpers/CameraHelper';
import {ThreejsCoreObject} from '../../../core/geometry/modules/three/ThreejsCoreObject';
import type {BaseNodeType} from '../../nodes/_Base';
import {DefaultObjectContentConstructor, ObjectType, registerObjectType} from '../../../core/geometry/Constant';
interface CreateCubeCameraParams {
	near: number;
	far: number;
	resolution: number;
}
interface UpdateCubeCameraParams {
	showHelper: boolean;
	matrixAutoUpdate: boolean;
	name: string;
}
interface CubeCameraSopParams extends CreateCubeCameraParams, UpdateCubeCameraParams, DefaultOperationParams {
	position: Vector3;
	rotation: Vector3;
}
interface AttributeOptions {}

export class CubeCameraExtended extends CubeCamera {
	override copy(source: CubeCamera, recursive: boolean) {
		const clonedCubeCamera = super.copy(source as this, recursive);
		// remove current children
		let child: Object3D | undefined;
		while ((child = clonedCubeCamera.children[0])) {
			clonedCubeCamera.remove(child);
		}

		// then re-add the source ones only (and not the ones created in the constructor)
		for (let srcChild of source.children) {
			clonedCubeCamera.add(srcChild.clone());
		}

		// copy the renderTarget
		clonedCubeCamera.renderTarget = source.renderTarget;

		return clonedCubeCamera;
	}
}

export class CubeCameraSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CubeCameraSopParams = {
		near: CORE_CAMERA_DEFAULT.near,
		far: CORE_CAMERA_DEFAULT.far,
		resolution: CUBE_CAMERA_DEFAULT.resolution,
		position: new Vector3(0, 0, 0),
		rotation: new Vector3(0, 0, 0),
		showHelper: false,
		matrixAutoUpdate: true,
		name: CameraNodeType.CUBE,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<CameraNodeType.CUBE> {
		return CameraNodeType.CUBE;
	}
	static override onRegister = registerCubeCamera;
	override cook(inputCoreGroups: CoreGroup[], params: CubeCameraSopParams) {
		const camera = CubeCameraSopOperation.createCamera(params, this._node);
		camera.name = params.name || CameraNodeType.CUBE;

		camera.position.copy(params.position);
		camera.rotation.set(
			MathUtils.degToRad(params.rotation.x),
			MathUtils.degToRad(params.rotation.y),
			MathUtils.degToRad(params.rotation.z)
		);

		CubeCameraSopOperation.updateCamera(camera, params);

		const objects: Object3D[] = [camera];
		return this.createCoreGroupFromObjects(objects);
	}
	static updateCamera(camera: CubeCamera, params: UpdateCubeCameraParams) {
		// this needs to be .updateWorldMatrix and not .updateMatrix
		// as otherwise the camera appears to behave find in most cases,
		// except when using the sop/cameraRenderScene
		camera.updateWorldMatrix(false, true);
		const childCameras = camera.children.filter(
			(c) => (c as PerspectiveCamera).isPerspectiveCamera
		) as PerspectiveCamera[];
		let i = 0;
		for (const childCamera of childCameras) {
			childCamera.name = `${camera.name}-perspectiveCamera-${i}`;
			childCamera.updateProjectionMatrix();
			i++;
		}
		camera.matrixAutoUpdate = params.matrixAutoUpdate;

		CubeCameraSopOperation.setCameraAttributes(camera, params);

		if (isBooleanTrue(params.showHelper)) {
			this._addHelper(childCameras);
		} else {
			this._removeHelper(childCameras);
		}
	}
	private static _addHelper(childCameras: PerspectiveCamera[]) {
		for (const childCamera of childCameras) {
			const helper = new CameraHelper(childCamera);
			helper.update();
			childCamera.add(helper);
		}
	}
	private static _removeHelper(childCameras: PerspectiveCamera[]) {
		for (const childCamera of childCameras) {
			const helpers = childCamera.children.filter((c) => c instanceof CameraHelper);
			for (const helper of helpers) {
				childCamera.remove(helper);
			}
		}
	}

	static createCamera(params: CreateCubeCameraParams, nodeGenerator?: BaseNodeType) {
		const cubeRenderTarget = new WebGLCubeRenderTarget(params.resolution);
		registerObjectType({
			type: ObjectType.CUBE_CAMERA,
			ctor: CubeCameraExtended as any as DefaultObjectContentConstructor,
			humanName: ObjectType.CUBE_CAMERA,
		});
		const camera = new CubeCameraExtended(params.near, params.far, cubeRenderTarget);
		if (nodeGenerator) {
			ThreejsCoreObject.addAttribute(camera, CameraAttribute.NODE_ID, nodeGenerator.graphNodeId());
		}
		return camera;
	}
	static setCameraAttributes(camera: CubeCamera, options: AttributeOptions) {}
}
