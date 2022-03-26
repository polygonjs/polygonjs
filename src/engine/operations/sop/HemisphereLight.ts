import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {HemisphereLight} from 'three/src/lights/HemisphereLight';
import {HemisphereLightParams, DEFAULT_POINT_LIGHT_PARAMS} from '../../../core/lights/HemisphereLight';

export class HemisphereLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: HemisphereLightParams = DEFAULT_POINT_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'hemisphereLight'> {
		return 'hemisphereLight';
	}
	override cook(inputCoreGroups: CoreGroup[], params: HemisphereLightParams) {
		const light = this.createLight();

		this.updateLightParams(light, params);
		this.updateLightParams(light, params);
		return this.createCoreGroupFromObjects([light]);
	}

	createLight() {
		const light = new HemisphereLight();
		light.name = `HemisphereLight_${this._node?.name() || ''}`;
		light.matrixAutoUpdate = false;
		light.updateMatrix();
		// make sure the light is initialized with same defaults as the node parameters
		light.color.copy(DEFAULT_POINT_LIGHT_PARAMS.skyColor);
		light.groundColor.copy(DEFAULT_POINT_LIGHT_PARAMS.groundColor);
		return light;
	}
	updateLightParams(light: HemisphereLight, params: HemisphereLightParams) {
		light.color.copy(params.skyColor);
		light.groundColor.copy(params.groundColor);
		light.intensity = params.intensity;
	}
}
