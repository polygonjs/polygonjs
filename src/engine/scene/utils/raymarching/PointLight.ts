import {Vector3, IUniform, PointLight} from 'three';
import {
	WorldPosUniformElement,
	PenumbraUniformElement,
	updateWorldPos,
	updateUserDataPenumbra,
	UniformsUpdateFunction,
} from './_Base';

export interface PointLightRayMarchingUniformElement extends WorldPosUniformElement, PenumbraUniformElement {}
interface PointLightRayMarchingUniforms extends Array<PointLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
export interface PointLightRayMarchingUniform extends IUniform {
	value: PointLightRayMarchingUniforms;
}
export function _createPointLightUniform(): PointLightRayMarchingUniformElement {
	return {
		worldPos: new Vector3(),
		penumbra: 0,
	};
}

let pointLightIndex = 0;

export const _updateUniformsWithPointLight: UniformsUpdateFunction<PointLight> = (
	object: PointLight,
	pointLightsRayMarching: PointLightRayMarchingUniform
) => {
	updateWorldPos(object, pointLightsRayMarching, pointLightIndex, _createPointLightUniform);
	updateUserDataPenumbra(object as PointLight, pointLightsRayMarching, pointLightIndex, _createPointLightUniform);
	pointLightIndex++;
};
export function _resetPointLightIndex() {
	pointLightIndex = 0;
}
