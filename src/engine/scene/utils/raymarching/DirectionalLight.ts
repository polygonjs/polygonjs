import {IUniform, DirectionalLight} from 'three';
import {
	PenumbraUniformElement,
	updateUserDataPenumbra,
	UniformsUpdateFunction,
	ShadowUniformElement,
	updateUserDataShadowBias,
} from './_Base';

export interface DirectionalLightRayMarchingUniformElement extends PenumbraUniformElement, ShadowUniformElement {}
interface DirectionalLightRayMarchingUniforms extends Array<DirectionalLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface DirectionalLightRayMarchingUniform extends IUniform {
	value: DirectionalLightRayMarchingUniforms;
}
export function _createDirectionalLightUniform(): DirectionalLightRayMarchingUniformElement {
	return {
		penumbra: 0,
		shadowBiasAngle: 0,
		shadowBiasDistance: 0,
	};
}

let directionalLightIndex = 0;
export const _updateUniformsWithDirectionalLight: UniformsUpdateFunction<DirectionalLight> = (
	object: DirectionalLight,
	directionalLightsRayMarching: DirectionalLightRayMarchingUniform
) => {
	updateUserDataPenumbra(
		object as DirectionalLight,
		directionalLightsRayMarching,
		directionalLightIndex,
		_createDirectionalLightUniform
	);
	updateUserDataShadowBias(
		object as DirectionalLight,
		directionalLightsRayMarching,
		directionalLightIndex,
		_createDirectionalLightUniform
	);
	directionalLightIndex++;
};
export function _resetDirectionalLightIndex() {
	directionalLightIndex = 0;
}
