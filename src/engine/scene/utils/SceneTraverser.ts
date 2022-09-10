import {UniformName} from './UniformsController';
import {PolyScene} from '../PolyScene';
import {IUniforms} from '../../../core/geometry/Material';
import {
	Object3D,
	Light,
	SpotLight,
	DirectionalLight,
	HemisphereLight,
	Vector3,
	IUniform,
	PointLight,
	// RectAreaLight,
} from 'three';

const worldPos = new Vector3();
const direction = new Vector3();
const tmpV = new Vector3();

// base
interface WorldPosUniformElement {
	worldPos: Vector3;
}
interface DirectionUniformElement {
	direction: Vector3;
}

// spotlights
let spotLightIndex = 0;
export interface SpotLightRayMarchingUniformElement extends WorldPosUniformElement, DirectionUniformElement {}
interface SpotLightRayMarchingUniforms extends Array<SpotLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
interface SpotLightRayMarchingUniform extends IUniform {
	value: SpotLightRayMarchingUniforms;
}
function _createSpotLightUniform() {
	return {
		worldPos: new Vector3(),
		direction: new Vector3(),
	};
}

// directionallights
let directionalLightIndex = 0;
export interface DirectionalLightRayMarchingUniformElement extends DirectionUniformElement {}
interface DirectionalLightRayMarchingUniforms extends Array<DirectionalLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
interface DirectionalLightRayMarchingUniform extends IUniform {
	value: DirectionalLightRayMarchingUniforms;
}
function _createDirectionalLightUniform() {
	return {
		direction: new Vector3(),
	};
}

// hemispherelights
let hemisphereLightIndex = 0;
export interface HemisphereLightRayMarchingUniformElement extends DirectionUniformElement {}
interface HemisphereLightRayMarchingUniforms extends Array<HemisphereLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
interface HemisphereLightRayMarchingUniform extends IUniform {
	value: HemisphereLightRayMarchingUniforms;
}
function _createHemisphereLightUniform() {
	return {
		direction: new Vector3(),
	};
}

// pointlights
let pointLightIndex = 0;
export interface PointLightRayMarchingUniformElement extends WorldPosUniformElement {}
interface PointLightRayMarchingUniforms extends Array<PointLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
interface PointLightRayMarchingUniform extends IUniform {
	value: PointLightRayMarchingUniforms;
}
function _createPointLightUniform() {
	return {
		worldPos: new Vector3(),
	};
}

// arealights
// let areaLightIndex = 0;
// export interface AreaLightRayMarchingUniformElement extends WorldPosUniformElement {}
// interface AreaLightRayMarchingUniforms extends Array<AreaLightRayMarchingUniformElement> {
// 	needsUpdate?: boolean;
// }
// interface AreaLightRayMarchingUniform extends IUniform {
// 	value: AreaLightRayMarchingUniforms;
// }
// function _createAreaLightUniform() {
// 	return {
// 		worldPos: new Vector3(),
// 	};
// }

// update functions

interface UniformWithWorldPosArray extends Array<WorldPosUniformElement> {
	needsUpdate?: boolean;
}
interface UniformsWithWorldPos extends IUniform {
	value: UniformWithWorldPosArray;
}

interface UniformWithDirectionArray extends Array<DirectionUniformElement> {
	needsUpdate?: boolean;
}
interface UniformsWithDirection extends IUniform {
	value: UniformWithDirectionArray;
}
function updateWorldPos(
	object: Object3D,
	uniforms: UniformsWithWorldPos,
	index: number,
	defaultUniformCreate: () => WorldPosUniformElement
) {
	object.getWorldPosition(worldPos);
	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	uniforms.value[index].worldPos.copy(worldPos);
	uniforms.value.needsUpdate = true;
}
function updateDirectionFromTarget(
	object: Object3D,
	uniforms: UniformsWithDirection,
	index: number,
	defaultUniformCreate: () => DirectionUniformElement
) {
	direction.setFromMatrixPosition(object.matrixWorld);
	tmpV.setFromMatrixPosition((object as DirectionalLight).target.matrixWorld);
	direction.sub(tmpV);

	uniforms.value[index] = uniforms.value[index] || defaultUniformCreate();
	uniforms.value[index].direction.copy(direction);
	uniforms.value.needsUpdate = true;
}
function updateDirectionFromMatrix(
	object: Object3D,
	uniforms: UniformsWithDirection,
	index: number,
	defaultUniformCreate: () => DirectionUniformElement
) {
	direction.setFromMatrixPosition(object.matrixWorld);

	uniforms.value[hemisphereLightIndex] = uniforms.value[index] || defaultUniformCreate();
	uniforms.value[index].direction.copy(direction);
	uniforms.value.needsUpdate = true;
}

export class SceneTraverserController {
	private _spotLightsRayMarching: SpotLightRayMarchingUniform = {
		value: [],
		// properties: {
		// 	worldPos: {},
		// },
	};
	private _directionalLightsRayMarching: DirectionalLightRayMarchingUniform = {
		value: [],
		// properties: {
		// 	worldPos: {},
		// },
	};
	private _hemisphereLightsRayMarching: HemisphereLightRayMarchingUniform = {
		value: [],
		// properties: {
		// 	worldPos: {},
		// },
	};
	private _pointLightsRayMarching: PointLightRayMarchingUniform = {
		value: [],
		// properties: {
		// 	worldPos: {},
		// },
	};
	// private _areaLightsRayMarching: AreaLightRayMarchingUniform = {
	// 	value: [],
	// 	// properties: {
	// 	// 	worldPos: {},
	// 	// },
	// };
	constructor(protected scene: PolyScene) {}

	traverseScene() {
		spotLightIndex = 0;
		directionalLightIndex = 0;
		hemisphereLightIndex = 0;
		pointLightIndex = 0;
		this.scene.threejsScene().traverse(this._onObjectTraverseBound);
	}
	private _onObjectTraverseBound = this._onObjectTraverse.bind(this);
	private _onObjectTraverse(object: Object3D) {
		if ((object as Light).isLight) {
			if ((object as SpotLight).isSpotLight) {
				updateWorldPos(object, this._spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
				updateDirectionFromTarget(object, this._spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
				spotLightIndex++;
			}
			if ((object as DirectionalLight).isDirectionalLight) {
				updateDirectionFromTarget(
					object,
					this._directionalLightsRayMarching,
					directionalLightIndex,
					_createDirectionalLightUniform
				);
				directionalLightIndex++;
			}
			if ((object as HemisphereLight).isHemisphereLight) {
				updateDirectionFromMatrix(
					object,
					this._hemisphereLightsRayMarching,
					hemisphereLightIndex,
					_createHemisphereLightUniform
				);
				hemisphereLightIndex++;
			}
			if ((object as PointLight as any).isPointLight) {
				updateWorldPos(object, this._pointLightsRayMarching, pointLightIndex, _createPointLightUniform);
				pointLightIndex++;
			}
			// if ((object as RectAreaLight).isRectAreaLight) {
			// 	updateWorldPos(object, this._areaLightsRayMarching, areaLightIndex, _createAreaLightUniform);
			// 	pointLightIndex++;
			// }
		}
	}

	addlightsRayMarchingUniform(uniforms: IUniforms) {
		uniforms[UniformName.SPOTLIGHTS_RAYMARCHING] = this._spotLightsRayMarching;
		uniforms[UniformName.DIRECTIONALLIGHTS_RAYMARCHING] = this._directionalLightsRayMarching;
		uniforms[UniformName.HEMISPHERELIGHTS_RAYMARCHING] = this._hemisphereLightsRayMarching;
		uniforms[UniformName.POINTLIGHTS_RAYMARCHING] = this._pointLightsRayMarching;
		// uniforms[UniformName.AREALIGHTS_RAYMARCHING] = this._areaLightsRayMarching;
	}
}
