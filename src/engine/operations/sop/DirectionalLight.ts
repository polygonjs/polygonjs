import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DirectionalLight} from 'three/src/lights/DirectionalLight';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Group} from 'three/src/objects/Group';
import {
	CoreDirectionalLightHelper,
	DirectionalLightParams,
	DEFAULT_DIRECTIONAL_LIGHT_PARAMS,
} from '../../../core/lights/DirectionalLight';
import {Object3D} from 'three/src/core/Object3D';

export class DirectionalLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: DirectionalLightParams = DEFAULT_DIRECTIONAL_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'directionalLight'> {
		return 'directionalLight';
	}
	override cook(input_contents: CoreGroup[], params: DirectionalLightParams) {
		const light = this.createLight();

		this.updateLightParams(light, params);
		this.updateShadowParams(light, params);

		if (isBooleanTrue(params.showHelper)) {
			const group = new Group();
			group.add(light);
			group.add(this._createHelper(light, params));
			return this.createCoreGroupFromObjects([group]);
		} else {
			return this.createCoreGroupFromObjects([light]);
		}
	}

	private _helper: CoreDirectionalLightHelper | undefined;
	private _createHelper(light: DirectionalLight, params: DirectionalLightParams) {
		this._helper = this._helper || new CoreDirectionalLightHelper();
		return this._helper.createAndBuildObject({light});
	}

	public readonly _targetObject!: Object3D;
	createLight() {
		const light = new DirectionalLight();
		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		// light.add(light.target);
		// light.target.position.z = -1;
		// this._targetObject = light.target;
		// this._targetObject.name = 'DirectionalLight Default Target';
		// this.object.add(this._targetObject);

		return light;
	}
	updateLightParams(light: DirectionalLight, params: DirectionalLightParams) {
		light.color = params.color;
		light.intensity = params.intensity;
		light.shadow.camera.far = params.distance;
	}
	updateShadowParams(light: DirectionalLight, params: DirectionalLightParams) {
		light.castShadow = isBooleanTrue(params.castShadow);
		light.shadow.mapSize.copy(params.shadowRes);

		light.shadow.bias = params.shadowBias;
		light.shadow.radius = params.shadowRadius;

		const shadowCamera = light.shadow.camera;
		const shadowSize = params.shadowSize;
		shadowCamera.left = -shadowSize.x * 0.5;
		shadowCamera.right = shadowSize.x * 0.5;
		shadowCamera.top = shadowSize.y * 0.5;
		shadowCamera.bottom = -shadowSize.y * 0.5;
		light.shadow.camera.updateProjectionMatrix();
	}
}
