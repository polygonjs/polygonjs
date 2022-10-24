import {Vector3, IUniform, DirectionalLight} from 'three';
import {
	DirectionUniformElement,
	PenumbraUniformElement,
	updateUserDataPenumbra,
	UniformsUpdateFunction,
	updateDirectionFromTarget,
} from './_Base';

export interface DirectionalLightRayMarchingUniformElement extends DirectionUniformElement, PenumbraUniformElement {}
interface DirectionalLightRayMarchingUniforms extends Array<DirectionalLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface DirectionalLightRayMarchingUniform extends IUniform {
	value: DirectionalLightRayMarchingUniforms;
}
export function _createDirectionalLightUniform(): DirectionalLightRayMarchingUniformElement {
	return {
		direction: new Vector3(),
		penumbra: 0,
	};
}

let directionalLightIndex = 0;
export const _updateUniformsWithDirectionalLight: UniformsUpdateFunction<DirectionalLight> = (
	object: DirectionalLight,
	directionalLightsRayMarching: DirectionalLightRayMarchingUniform
) => {
	updateDirectionFromTarget(
		object,
		directionalLightsRayMarching,
		directionalLightIndex,
		_createDirectionalLightUniform
	);
	updateUserDataPenumbra(
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
