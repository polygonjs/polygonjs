import {IUniform, SpotLight} from 'three';
import {
	PenumbraUniformElement,
	ShadowUniformElement,
	UniformsUpdateFunction,
	updateUserDataPenumbra,
	updateUserDataShadowBias,
} from './_Base';

export interface SpotLightRayMarchingUniformElement extends PenumbraUniformElement, ShadowUniformElement {}
interface SpotLightRayMarchingUniforms extends Array<SpotLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface SpotLightRayMarchingUniform extends IUniform {
	value: SpotLightRayMarchingUniforms;
}
export function _createSpotLightUniform(): SpotLightRayMarchingUniformElement {
	return {
		penumbra: 0,
		shadowBiasAngle: 0,
		shadowBiasDistance: 0,
	};
}

// export function updateSpotLightPenumbra(
// 	object: SpotLight,
// 	uniforms: UniformsWithPenumbra,
// 	index: number,
// 	defaultUniformCreate: () => PenumbraUniformElement
// ) {
// 	updateUserDataPenumbra(object as SpotLight, uniforms, pointLightIndex, _createPointLightUniform);
// 	// uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
// 	// if(uniforms.value[index].penumbra != object.penumbra){
// 	// 	uniforms.value[index].penumbra = object.penumbra;
// 	// 	uniforms.value.needsUpdate = true;
// 	// 	console.log(uniforms.value);
// 	// }
// }

let spotLightIndex = 0;
export const _updateUniformsWithSpotLight: UniformsUpdateFunction<SpotLight> = (
	object: SpotLight,
	spotLightsRayMarching: SpotLightRayMarchingUniform
) => {
	// updateSpotLightPenumbra(object, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	updateUserDataPenumbra(object as SpotLight, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	updateUserDataShadowBias(object as SpotLight, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	spotLightIndex++;
};
export function _resetSpotLightIndex() {
	spotLightIndex = 0;
}
