import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {
	SpotLightParams,
	DEFAULT_SPOT_LIGHT_PARAMS,
	SpotLightContainer,
	SpotLightContainerParams,
} from '../../../core/lights/SpotLight';

export class SpotLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SpotLightParams = DEFAULT_SPOT_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'spotLight'> {
		return 'spotLight';
	}
	override cook(inputCoreGroups: CoreGroup[], params: SpotLightParams) {
		const container = this.createLight(params);

		this.updateLightParams(container, params);
		this.updateShadowParams(container, params);
		container.updateParams(params);
		container.updateHelper();
		container.updateVolumetric();

		return this.createCoreGroupFromObjects([container]);
	}

	createLight(params: SpotLightContainerParams) {
		const container = new SpotLightContainer(params, this._node?.name() || '_');
		const light = container.light();
		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		return container;
	}
	updateLightParams(container: SpotLightContainer, params: SpotLightParams) {
		const light = container.light();

		light.color = params.color;
		light.intensity = params.intensity;
		light.angle = params.angle * (Math.PI / 180);
		light.penumbra = params.penumbra;
		light.decay = params.decay;
		light.distance = params.distance;
		// TODO: consider allow power to be edited
		// (maybe it will need a setting to toggle physicallyCorrect, which would then show the power param)
		// this.light.power = 1;

		// this._helperController.update();
		// this._volumetricController.update();
	}
	updateShadowParams(container: SpotLightContainer, params: SpotLightParams) {
		const light = container.light();

		light.castShadow = isBooleanTrue(params.castShadow);
		light.shadow.autoUpdate = isBooleanTrue(params.shadowAutoUpdate);
		light.shadow.needsUpdate = isBooleanTrue(params.shadowUpdateOnNextRender);

		light.shadow.mapSize.copy(params.shadowRes);
		const map = light.shadow.map;
		if (map) {
			map.setSize(params.shadowRes.x, params.shadowRes.y);
		}

		light.shadow.bias = params.shadowBias;
		light.shadow.radius = params.shadowRadius;
		light.shadow.camera.near = params.shadowNear;
		light.shadow.camera.far = params.shadowFar;

		light.shadow.camera.updateProjectionMatrix();

		container.updateHelper();
	}
}
