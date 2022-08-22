import {UniformName} from './UniformsController';
import {PolyScene} from '../PolyScene';
import {IUniforms} from '../../../core/geometry/Material';
import {Object3D, Light, SpotLight, DirectionalLight, Vector3, IUniform} from 'three';

const worldPos = new Vector3();
let spotLightIndex = 0;
let directionalLightIndex = 0;

export interface SpotLightRayMarchingUniformElement {
	worldPos: Vector3;
}
export interface DirectionalLightRayMarchingUniformElement {
	direction: Vector3;
}
interface SpotLightRayMarchingUniforms extends Array<SpotLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
interface DirectionalLightRayMarchingUniforms extends Array<DirectionalLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}
interface SpotLightRayMarchingUniform extends IUniform {
	value: SpotLightRayMarchingUniforms;
}
interface DirectionalLightRayMarchingUniform extends IUniform {
	value: DirectionalLightRayMarchingUniforms;
}
const direction = new Vector3();
const tmpV = new Vector3();
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
	constructor(protected scene: PolyScene) {}

	traverseScene() {
		spotLightIndex = 0;
		directionalLightIndex = 0;
		this.scene.threejsScene().traverse(this._onObjectTraverseBound);
	}
	private _onObjectTraverseBound = this._onObjectTraverse.bind(this);
	private _onObjectTraverse(object: Object3D) {
		if ((object as Light).isLight) {
			if ((object as SpotLight).isSpotLight) {
				(object as SpotLight).getWorldPosition(worldPos);
				this._spotLightsRayMarching.value[spotLightIndex] = this._spotLightsRayMarching.value[
					spotLightIndex
				] || {
					worldPos: new Vector3(),
				};
				this._spotLightsRayMarching.value[spotLightIndex].worldPos.copy(worldPos);
				this._spotLightsRayMarching.value.needsUpdate = true;
				spotLightIndex++;
			}
			if ((object as DirectionalLight).isDirectionalLight) {
				direction.setFromMatrixPosition(object.matrixWorld);
				tmpV.setFromMatrixPosition((object as DirectionalLight).target.matrixWorld);
				direction.sub(tmpV);

				this._directionalLightsRayMarching.value[directionalLightIndex] = this._directionalLightsRayMarching
					.value[directionalLightIndex] || {
					direction: new Vector3(),
				};
				this._directionalLightsRayMarching.value[directionalLightIndex].direction.copy(direction);
				this._directionalLightsRayMarching.value.needsUpdate = true;
				directionalLightIndex++;
			}
		}
	}

	addlightsRayMarchingUniform(uniforms: IUniforms) {
		uniforms[UniformName.SPOTLIGHTS_RAYMARCHING] = this._spotLightsRayMarching;
		uniforms[UniformName.DIRECTIONALLIGHTS_RAYMARCHING] = this._directionalLightsRayMarching;
	}
}
