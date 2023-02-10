import {LIGHT_USER_DATA_RAYMARCHING_PENUMBRA} from './../../../core/lights/Common';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {
	DirectionalLightParams,
	DEFAULT_DIRECTIONAL_LIGHT_PARAMS,
	DirectionalLightContainer,
	DirectionalLightContainerParams,
} from '../../../core/lights/DirectionalLight';
import {NodeContext} from '../../poly/NodeContext';
// import {Mesh, PlaneGeometry, MeshBasicMaterial, Color, DoubleSide, DirectionalLight} from 'three';
export class DirectionalLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: DirectionalLightParams = DEFAULT_DIRECTIONAL_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'directionalLight'> {
		return 'directionalLight';
	}
	override cook(_: CoreGroup[], params: DirectionalLightParams) {
		const container = this.createLight(params);
		if (!container) {
			return this.createCoreGroupFromObjects([]);
		}
		container.light().name = params.name;
		this.updateLightParams(container, params);
		this.updateShadowParams(container, params);

		return this.createCoreGroupFromObjects([container]);
	}

	createLight(params: DirectionalLightContainerParams) {
		const nodeName = this._node?.name();
		const container = new DirectionalLightContainer({showHelper: params.showHelper}, nodeName || '');
		const light = container.light();

		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		return container;
	}
	updateLightParams(container: DirectionalLightContainer, params: DirectionalLightParams) {
		const light = container.light();
		light.color = params.color;
		light.intensity = params.intensity;
		light.shadow.camera.far = params.distance;

		light.userData[LIGHT_USER_DATA_RAYMARCHING_PENUMBRA] = params.raymarchingPenumbra;
	}
	updateShadowParams<NC extends NodeContext>(container: DirectionalLightContainer, params: DirectionalLightParams) {
		const light = container.light();
		light.shadow.autoUpdate = isBooleanTrue(params.shadowAutoUpdate);
		light.shadow.needsUpdate = isBooleanTrue(params.shadowUpdateOnNextRender);

		light.castShadow = isBooleanTrue(params.castShadow);
		light.shadow.mapSize.copy(params.shadowRes);
		// const map = light.shadow.map;
		// if (map) {
		// 	map.setSize(params.shadowRes.x, params.shadowRes.y);
		// 	if (isBooleanTrue(params.debugShadow)) {
		// 		light.add(this._debugShadowMesh(light));
		// 	} else {
		// 		if (this.__debugShadowMesh) {
		// 			light.remove(this.__debugShadowMesh);
		// 		}
		// 	}
		// }

		light.shadow.bias = params.shadowBias;
		light.shadow.radius = params.shadowRadius;

		const shadowCamera = light.shadow.camera;
		const shadowSize = params.shadowSize;
		shadowCamera.left = -shadowSize.x * 0.5;
		shadowCamera.right = shadowSize.x * 0.5;
		shadowCamera.top = shadowSize.y * 0.5;
		shadowCamera.bottom = -shadowSize.y * 0.5;
		shadowCamera.updateProjectionMatrix();

		container.updateHelper();
	}
	// private __debugShadowMesh: Mesh<PlaneGeometry, MeshBasicMaterial> | undefined;
	// private _debugShadowMesh(light: DirectionalLight) {
	// 	return (this.__debugShadowMesh = this.__debugShadowMesh || this._createDebugShadowMesh(light));
	// }
	// private _createDebugShadowMesh(light: DirectionalLight) {
	// 	const material = new MeshBasicMaterial({
	// 		color: new Color(1, 1, 1),
	// 		map: light.shadow.map.texture,
	// 		side: DoubleSide,
	// 	});
	// 	const mesh = new Mesh(new PlaneGeometry(5, 5, 2, 2), material);
	// 	mesh.position.z = 1;
	// 	mesh.castShadow = false;
	// 	mesh.receiveShadow = false;
	// 	return mesh;
	// }
}
