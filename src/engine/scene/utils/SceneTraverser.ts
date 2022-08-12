import {UniformName} from './UniformsController';
import {PolyScene} from '../PolyScene';
import {IUniforms} from '../../../core/geometry/Material';
import {Object3D, Light, SpotLight, Vector3, IUniform} from 'three';

const worldPos = new Vector3();
let spotLightIndex = 0;

export interface SpotLightRayMarchingUniformElement {
	worldPos: Vector3;
}
interface SpotLightRayMarchingUniforms extends Array<SpotLightRayMarchingUniformElement> {
	needsUpdate?: boolean;
}

interface SpotLightRayMarchingUniform extends IUniform {
	value: SpotLightRayMarchingUniforms;
}

export class SceneTraverserController {
	private _spotLightsRayMarching: SpotLightRayMarchingUniform = {
		value: [],
		// properties: {
		// 	worldPos: {},
		// },
	};
	constructor(protected scene: PolyScene) {}

	traverseScene() {
		spotLightIndex = 0;
		this.scene.threejsScene().traverse(this._onObjectTraverseBound);
	}
	private _onObjectTraverseBound = this._onObjectTraverse.bind(this);
	private _onObjectTraverse(object: Object3D) {
		if ((object as Light).isLight) {
			if ((object as SpotLight).isSpotLight) {
				(object as SpotLight).getWorldPosition(worldPos);
				// console.log(i, shaderMaterial);
				// console.log(tmpV.toArray());
				this._spotLightsRayMarching.value[spotLightIndex] = this._spotLightsRayMarching.value[
					spotLightIndex
				] || {
					worldPos: new Vector3(),
				};
				this._spotLightsRayMarching.value[spotLightIndex].worldPos.copy(worldPos);
				this._spotLightsRayMarching.value.needsUpdate = true;
				spotLightIndex++;
			}
		}
	}

	addSpotlightsRayMarchingUniform(uniforms: IUniforms) {
		uniforms[UniformName.SPOTLIGHTS_RAYMARCHING] = this._spotLightsRayMarching;
	}
}
