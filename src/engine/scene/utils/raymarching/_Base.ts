import {Vector3, IUniform, Light, SpotLight, DirectionalLight, HemisphereLight, PointLight, Object3D} from 'three';
import {LIGHT_USER_DATA_RAYMARCHING_PENUMBRA} from './../../../../core/lights/Common';
export interface WorldPosUniformElement {
	worldPos: Vector3;
}
export interface DirectionUniformElement {
	direction: Vector3;
}
export interface PenumbraUniformElement {
	penumbra: number;
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
export interface UniformsWithPenumbra extends IUniform {
	value: UniformWithPenumbraArray;
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
const worldPos = new Vector3();
const direction = new Vector3();
const tmpV = new Vector3();
export function updateWorldPos(
	object: Object3D,
	uniforms: UniformsWithWorldPos,
	index: number,
	defaultUniformCreate: () => WorldPosUniformElement
) {
	object.updateMatrixWorld(true);
	object.updateMatrix();
	object.getWorldPosition(worldPos);
	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	uniforms.value[index].worldPos.copy(worldPos);
	uniforms.value.needsUpdate = true;
}
export function updateDirectionFromTarget(
	object: Object3D,
	uniforms: UniformsWithDirection,
	index: number,
	defaultUniformCreate: () => DirectionUniformElement
) {
	(object as DirectionalLight).target.updateMatrixWorld(true);
	(object as DirectionalLight).target.updateMatrix();
	direction.setFromMatrixPosition(object.matrixWorld);
	tmpV.setFromMatrixPosition((object as DirectionalLight).target.matrixWorld);
	direction.sub(tmpV);

	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	uniforms.value[index].direction.copy(direction);
	uniforms.value.needsUpdate = true;
}
export function updateDirectionFromMatrix(
	object: Object3D,
	uniforms: UniformsWithDirection,
	index: number,
	defaultUniformCreate: () => DirectionUniformElement
) {
	direction.setFromMatrixPosition(object.matrixWorld);

	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	uniforms.value[index].direction.copy(direction);
	uniforms.value.needsUpdate = true;
}

export function updateUserDataPenumbra(
	object: PointLight | DirectionalLight,
	uniforms: UniformsWithPenumbra,
	index: number,
	defaultUniformCreate: () => PenumbraUniformElement
) {
	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	uniforms.value[index].penumbra = object.userData[LIGHT_USER_DATA_RAYMARCHING_PENUMBRA];
	uniforms.value.needsUpdate = true;
}
