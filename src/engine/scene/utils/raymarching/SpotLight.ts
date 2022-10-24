import {Vector3, IUniform, SpotLight} from 'three';
import {
	WorldPosUniformElement,
	DirectionUniformElement,
	PenumbraUniformElement,
	UniformsWithPenumbra,
	UniformsUpdateFunction,
	updateWorldPos,
	updateDirectionFromTarget,
} from './_Base';

export interface SpotLightRayMarchingUniformElement
	extends WorldPosUniformElement,
		DirectionUniformElement,
		PenumbraUniformElement {}
interface SpotLightRayMarchingUniforms extends Array<SpotLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface SpotLightRayMarchingUniform extends IUniform {
	value: SpotLightRayMarchingUniforms;
}
export function _createSpotLightUniform(): SpotLightRayMarchingUniformElement {
	return {
		worldPos: new Vector3(),
		direction: new Vector3(),
		penumbra: 0,
	};
}

export function updateSpotLightPenumbra(
	object: SpotLight,
	uniforms: UniformsWithPenumbra,
	index: number,
	defaultUniformCreate: () => PenumbraUniformElement
) {
	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	uniforms.value[index].penumbra = object.penumbra;
	uniforms.value.needsUpdate = true;
}

let spotLightIndex = 0;
export const _updateUniformsWithSpotLight: UniformsUpdateFunction<SpotLight> = (
	object: SpotLight,
	spotLightsRayMarching: SpotLightRayMarchingUniform
) => {
	updateWorldPos(object, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	updateDirectionFromTarget(object, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	updateSpotLightPenumbra(object, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	spotLightIndex++;
};
export function _resetSpotLightIndex() {
	spotLightIndex = 0;
}
