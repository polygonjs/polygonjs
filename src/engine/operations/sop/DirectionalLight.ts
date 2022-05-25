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

export class DirectionalLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: DirectionalLightParams = DEFAULT_DIRECTIONAL_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'directionalLight'> {
		return 'directionalLight';
	}
	override cook(input_contents: CoreGroup[], params: DirectionalLightParams) {
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
	}
	updateShadowParams<NC extends NodeContext>(container: DirectionalLightContainer, params: DirectionalLightParams) {
		const light = container.light();
		light.shadow.autoUpdate = isBooleanTrue(params.shadowAutoUpdate);
		light.shadow.needsUpdate = isBooleanTrue(params.shadowUpdateOnNextRender);

		light.castShadow = isBooleanTrue(params.castShadow);
		light.shadow.mapSize.copy(params.shadowRes);
		const map = light.shadow.map;
		if (map) {
			map.setSize(params.shadowRes.x, params.shadowRes.y);
		}

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
}
