import {IUniform, PointLight} from 'three';
import {PenumbraUniformElement, updateUserDataPenumbra, UniformsUpdateFunction} from './_Base';

export interface PointLightRayMarchingUniformElement extends PenumbraUniformElement {}
interface PointLightRayMarchingUniforms extends Array<PointLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface PointLightRayMarchingUniform extends IUniform {
	value: PointLightRayMarchingUniforms;
}
export function _createPointLightUniform(): PointLightRayMarchingUniformElement {
	return {
		penumbra: 0,
	};
}

let pointLightIndex = 0;

export const _updateUniformsWithPointLight: UniformsUpdateFunction<PointLight> = (
	object: PointLight,
	pointLightsRayMarching: PointLightRayMarchingUniform
) => {
	updateUserDataPenumbra(object as PointLight, pointLightsRayMarching, pointLightIndex, _createPointLightUniform);
	pointLightIndex++;
};
export function _resetPointLightIndex() {
	pointLightIndex = 0;
}
