import {UniformName} from './UniformsController';
import {PolyScene} from '../PolyScene';
import {IUniforms} from '../../../core/geometry/Material';
import {
	Object3D,
	Light,
	SpotLight,
	DirectionalLight,
	HemisphereLight,
	IUniform,
	PointLight,
	// RectAreaLight,
} from 'three';
import {
	updateWorldPos,
	updateDirectionFromTarget,
	updateUserDataPenumbra,
	updateDirectionFromMatrix,
	LightType,
	getLightType,
} from './raymarching/_Base';
import {updateSpotLightPenumbra, SpotLightRayMarchingUniform, _createSpotLightUniform} from './raymarching/SpotLight';
import {DirectionalLightRayMarchingUniform, _createDirectionalLightUniform} from './raymarching/DirectionalLight';
import {HemisphereLightRayMarchingUniform, _createHemisphereLightUniform} from './raymarching/HemisphereLight';
import {PointLightRayMarchingUniform, _createPointLightUniform} from './raymarching/PointLight';

let spotLightIndex = 0;
let directionalLightIndex = 0;
let hemisphereLightIndex = 0;
let pointLightIndex = 0;

type AvailableLight = SpotLight | DirectionalLight | HemisphereLight | PointLight;
type UniformsUpdateFunction<L extends AvailableLight> = (object: L, uniforms: IUniform) => void;

const _updateUniformsWithSpotLight: UniformsUpdateFunction<SpotLight> = (
	object: SpotLight,
	spotLightsRayMarching: SpotLightRayMarchingUniform
) => {
	updateWorldPos(object, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	updateDirectionFromTarget(object, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	updateSpotLightPenumbra(object, spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
	spotLightIndex++;
};
const _updateUniformsWithDirectionalLight: UniformsUpdateFunction<DirectionalLight> = (
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
const _updateUniformsWithHemisphereLight: UniformsUpdateFunction<HemisphereLight> = (
	object: HemisphereLight,
	hemisphereLightsRayMarching: HemisphereLightRayMarchingUniform
) => {
	updateDirectionFromMatrix(object, hemisphereLightsRayMarching, hemisphereLightIndex, _createHemisphereLightUniform);
	hemisphereLightIndex++;
};
const _updateUniformsWithPointLight: UniformsUpdateFunction<PointLight> = (
	object: PointLight,
	pointLightsRayMarching: PointLightRayMarchingUniform
) => {
	updateWorldPos(object, pointLightsRayMarching, pointLightIndex, _createPointLightUniform);
	updateUserDataPenumbra(object as PointLight, pointLightsRayMarching, pointLightIndex, _createPointLightUniform);
	pointLightIndex++;
};
function _updateUniformsFunctionForLight<L extends AvailableLight>(
	object: L
): UniformsUpdateFunction<AvailableLight> | undefined {
	const lightType = getLightType(object as Light);
	switch (lightType) {
		case LightType.SPOT: {
			return _updateUniformsWithSpotLight as UniformsUpdateFunction<AvailableLight>;
		}
		case LightType.DIRECTIONAL: {
			return _updateUniformsWithDirectionalLight as UniformsUpdateFunction<AvailableLight>;
		}
		case LightType.HEMISPHERE: {
			return _updateUniformsWithHemisphereLight as UniformsUpdateFunction<AvailableLight>;
		}
		case LightType.POINT: {
			return _updateUniformsWithPointLight as UniformsUpdateFunction<AvailableLight>;
		}
	}
}
export class SceneTraverserController {
	private _spotLightsRayMarching: SpotLightRayMarchingUniform = {
		value: [],
	};
	private _directionalLightsRayMarching: DirectionalLightRayMarchingUniform = {
		value: [],
	};
	private _hemisphereLightsRayMarching: HemisphereLightRayMarchingUniform = {
		value: [],
	};
	private _pointLightsRayMarching: PointLightRayMarchingUniform = {
		value: [],
	};
	// private _areaLightsRayMarching: AreaLightRayMarchingUniform = {
	// 	value: [],
	// 	// properties: {
	// 	// 	worldPos: {},
	// 	// },
	// };
	private _updateUniformsFunctionByLight: WeakMap<AvailableLight, UniformsUpdateFunction<AvailableLight>> =
		new WeakMap();
	private _uniformsByLight: WeakMap<Light, IUniform> = new WeakMap();
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
		let updateFunction = this._updateUniformsFunctionByLight.get(object as AvailableLight);

		if (!updateFunction) {
			if ((object as Light).isLight) {
				updateFunction = _updateUniformsFunctionForLight(object as AvailableLight);
				if (updateFunction) {
					this._updateUniformsFunctionByLight.set(object as AvailableLight, updateFunction);
				}
			}
		}
		if (!updateFunction) {
			return updateFunction;
		}
		let uniforms = this._uniformsByLight.get(object as Light);
		if (!uniforms) {
			uniforms = this._updateUniformsForLight(object as Light);
			if (uniforms) {
				this._uniformsByLight.set(object as Light, uniforms);
			}
		}
		if (!uniforms) {
			return;
		}
		updateFunction(object as AvailableLight, uniforms);

		// if ((object as Light).isLight) {
		// 	const lightType = _lightType(object as Light)
		// 	switch(lightType){
		// 		case LightType.SPOT:{
		// 			updateWorldPos(object, this._spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
		// 			updateDirectionFromTarget(object, this._spotLightsRayMarching, spotLightIndex, _createSpotLightUniform);
		// 			updateSpotLightPenumbra(
		// 				object as SpotLight,
		// 				this._spotLightsRayMarching,
		// 				spotLightIndex,
		// 				_createSpotLightUniform
		// 			);
		// 			spotLightIndex++;
		// 			return
		// 		}
		// 		case LightType.DIRECTIONAL:{

		// 			return
		// 		}
		// 		case LightType.HEMISPHERE:{
		// 			updateDirectionFromMatrix(
		// 				object,
		// 				this._hemisphereLightsRayMarching,
		// 				hemisphereLightIndex,
		// 				_createHemisphereLightUniform
		// 			);
		// 			hemisphereLightIndex++;
		// 			return
		// 		}
		// 		case LightType.POINT:{
		// 			updateWorldPos(object, this._pointLightsRayMarching, pointLightIndex, _createPointLightUniform);
		// 			updateUserDataPenumbra(
		// 				object as PointLight,
		// 				this._pointLightsRayMarching,
		// 				pointLightIndex,
		// 				_createPointLightUniform
		// 			);
		// 			pointLightIndex++;
		// 			return
		// 		}
		// 	}

		// 	// if ((object as RectAreaLight).isRectAreaLight) {
		// 	// 	updateWorldPos(object, this._areaLightsRayMarching, areaLightIndex, _createAreaLightUniform);
		// 	// 	pointLightIndex++;
		// 	// }
		// }
	}
	private _updateUniformsForLight<L extends Light>(object: L) {
		const lightType = getLightType(object as Light);
		switch (lightType) {
			case LightType.SPOT: {
				return this._spotLightsRayMarching;
			}
			case LightType.DIRECTIONAL: {
				return this._directionalLightsRayMarching;
			}
			case LightType.HEMISPHERE: {
				return this._hemisphereLightsRayMarching;
			}
			case LightType.POINT: {
				return this._pointLightsRayMarching;
			}
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
