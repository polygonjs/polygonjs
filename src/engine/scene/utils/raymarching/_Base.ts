import {Vector3, IUniform, Light, SpotLight, DirectionalLight, HemisphereLight, PointLight} from 'three';
import {LightUserDataRaymarching} from './../../../../core/lights/Common';
export interface WorldPosUniformElement {
	worldPos: Vector3;
}
export interface DirectionUniformElement {
	direction: Vector3;
}
export interface PenumbraUniformElement {
	penumbra: number;
}
export interface ShadowUniformElement {
	shadowBiasAngle: number;
	shadowBiasDistance: number;
}

interface UniformWithWorldPosArray extends Array<WorldPosUniformElement> {
	needsUpdate?: boolean;
}
export interface UniformsWithWorldPos extends IUniform {
	value: UniformWithWorldPosArray;
}

interface UniformWithDirectionArray extends Array<DirectionUniformElement> {
	needsUpdate?: boolean;
}
export interface UniformsWithDirection extends IUniform {
	value: UniformWithDirectionArray;
}
interface UniformWithPenumbraArray extends Array<PenumbraUniformElement> {
	needsUpdate?: boolean;
}
interface UniformWithShadowBiasArray extends Array<ShadowUniformElement> {
	needsUpdate?: boolean;
}
export interface UniformsWithPenumbra extends IUniform {
	value: UniformWithPenumbraArray;
}
export interface UniformsWithShadowBias extends IUniform {
	value: UniformWithShadowBiasArray;
}

export enum LightType {
	SPOT = 0,
	DIRECTIONAL = 1,
	HEMISPHERE = 2,
	POINT = 3,
}
export function getLightType(object: Light): LightType | undefined {
	if ((object as SpotLight).isSpotLight) {
		return LightType.SPOT;
	}
	if ((object as DirectionalLight).isDirectionalLight) {
		return LightType.DIRECTIONAL;
	}
	if ((object as HemisphereLight).isHemisphereLight) {
		return LightType.HEMISPHERE;
	}
	if ((object as PointLight as any).isPointLight) {
		return LightType.POINT;
	}
}
// update functions
// const worldPos = new Vector3();
// const direction = new Vector3();
// const tmpV = new Vector3();
// export function updateWorldPos(
// 	object: Object3D,
// 	uniforms: UniformsWithWorldPos,
// 	index: number,
// 	defaultUniformCreate: () => WorldPosUniformElement
// ) {
// 	object.updateMatrixWorld(true);
// 	object.updateMatrix();
// 	object.getWorldPosition(worldPos);
// 	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
// 	if(!uniforms.value[index].worldPos.equals(direction)){
// 		uniforms.value[index].worldPos.copy(worldPos);
// 		uniforms.value.needsUpdate = true;
// 	}
// }
// export function updateDirectionFromTarget(
// 	object: Object3D,
// 	uniforms: UniformsWithDirection,
// 	index: number,
// 	defaultUniformCreate: () => DirectionUniformElement
// ) {
// 	(object as DirectionalLight).target.updateMatrixWorld(true);
// 	(object as DirectionalLight).target.updateMatrix();
// 	direction.setFromMatrixPosition(object.matrixWorld);
// 	tmpV.setFromMatrixPosition((object as DirectionalLight).target.matrixWorld);
// 	direction.sub(tmpV);

// 	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
// 	if(!uniforms.value[index].direction.equals(direction)){
// 		uniforms.value[index].direction.copy(direction);
// 		uniforms.value.needsUpdate = true;
// 	}
// }
// export function updateDirectionFromMatrix(
// 	object: Object3D,
// 	uniforms: UniformsWithDirection,
// 	index: number,
// 	defaultUniformCreate: () => DirectionUniformElement
// ) {
// 	direction.setFromMatrixPosition(object.matrixWorld);

// 	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
// 	if(!uniforms.value[index].direction.equals(direction)){
// 		uniforms.value[index].direction.copy(direction);
// 		uniforms.value.needsUpdate = true;
// 	}
// }

export function updateUserDataPenumbra(
	object: SpotLight | PointLight | DirectionalLight,
	uniforms: UniformsWithPenumbra,
	index: number,
	defaultUniformCreate: () => PenumbraUniformElement
) {
	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	const uniformName = LightUserDataRaymarching.PENUMBRA;
	if (uniforms.value[index].penumbra != object.userData[uniformName]) {
		uniforms.value[index].penumbra = object.userData[uniformName];
		uniforms.value.needsUpdate = true;
	}
}
export function updateUserDataShadowBias(
	object: SpotLight | PointLight | DirectionalLight,
	uniforms: UniformsWithShadowBias,
	index: number,
	defaultUniformCreate: () => ShadowUniformElement
) {
	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	if (uniforms.value[index].shadowBiasAngle != object.userData[LightUserDataRaymarching.SHADOW_BIAS_ANGLE]) {
		uniforms.value[index].shadowBiasAngle = object.userData[LightUserDataRaymarching.SHADOW_BIAS_ANGLE];
		uniforms.value.needsUpdate = true;
	}
	if (uniforms.value[index].shadowBiasDistance != object.userData[LightUserDataRaymarching.SHADOW_BIAS_DISTANCE]) {
		uniforms.value[index].shadowBiasDistance = object.userData[LightUserDataRaymarching.SHADOW_BIAS_DISTANCE];
		uniforms.value.needsUpdate = true;
	}
}

export type AvailableLight = SpotLight | DirectionalLight | HemisphereLight | PointLight;
export type UniformsUpdateFunction<L extends AvailableLight> = (object: L, uniforms: IUniform) => void;
