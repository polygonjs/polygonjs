import {PolyScene} from '../PolyScene';
import {Vector2} from 'three';
import {IUniformN, IUniformTexture, IUniformV2} from '../../nodes/utils/code/gl/Uniforms';
import {GlParamConfig} from '../../nodes/gl/code/utils/GLParamConfig';
import {ParamType} from '../../poly/ParamType';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {IUniforms} from '../../../core/geometry/Material';

export enum UniformName {
	TIME = 'time',
	RESOLUTION = 'resolution',
	SPOTLIGHTS_RAYMARCHING = 'spotLightsRayMarching',
	DIRECTIONALLIGHTS_RAYMARCHING = 'directionalLightsRayMarching',
	HEMISPHERELIGHTS_RAYMARCHING = 'hemisphereLightsRayMarching',
	POINTLIGHTS_RAYMARCHING = 'pointLightsRayMarching',
	// AREALIGHTS_RAYMARCHING = 'areaLightsRayMarching',
}

export interface IUniformsWithTime extends IUniforms {
	time: IUniformN;
}
export interface IUniformsWithResolution extends IUniforms {
	resolution: IUniformV2;
}
// interface IUniformsWithResolutionOnly {
// 	resolution: IUniformV2;
// }
interface AddUniformOptions {
	paramConfigs: readonly GlParamConfig<ParamType>[];
	additionalTextureUniforms: PolyDictionary<IUniformTexture>;
	timeDependent: boolean;
	resolutionDependent: boolean;
}
interface GlobalUniforms {
	// time: IUniformN;
	resolution: IUniformV2;
}

const GLOBAL_UNIFORMS: GlobalUniforms = {
	// [UniformName.TIME]: {value: 0},
	[UniformName.RESOLUTION]: {value: new Vector2(1000, 1000)},
};
export class UniformsController {
	constructor(private scene: PolyScene) {}

	// private _resolution: Vector2 = new Vector2(1, 1);
	// private _resolutionDependentUniformsMap: Map<string, IUniformsWithResolutionOnly> = new Map();
	// private _resolutionDependentUniforms: IUniformsWithResolutionOnly[] = [];

	// add uniforms from assemblers
	addUniforms(uniforms: IUniforms, options: AddUniformOptions) {
		const {paramConfigs, additionalTextureUniforms, timeDependent, resolutionDependent} = options;
		for (let paramConfig of paramConfigs) {
			uniforms[paramConfig.uniformName()] = paramConfig.uniform();
		}
		const additionalUniformNames = Object.keys(additionalTextureUniforms);
		for (let uniformName of additionalUniformNames) {
			const uniformValue = additionalTextureUniforms[uniformName];
			uniforms[uniformName] = uniformValue;
		}
		if (timeDependent) {
			this.addTimeUniform(uniforms);
		} else {
			this.removeTimeUniform(uniforms);
		}
		if (resolutionDependent) {
			this.addResolutionUniforms(uniforms);
		} else {
			this.removeResolutionUniform(uniforms);
		}
	}
	addTimeUniform(uniforms: IUniforms) {
		uniforms[UniformName.TIME] = this.scene.timeController.timeUniform();
	}
	removeTimeUniform(uniforms: IUniforms) {
		delete uniforms[UniformName.TIME];
	}
	timeUniformValue() {
		return this.scene.timeController.timeUniform().value;
	}

	// public updateTime() {
	// 	GLOBAL_UNIFORMS[UniformName.TIME].value = this.scene.time();
	// }

	// resolution
	addResolutionUniforms(uniforms: IUniforms) {
		uniforms[UniformName.RESOLUTION] = GLOBAL_UNIFORMS[UniformName.RESOLUTION];
	}
	removeResolutionUniform(uniforms: IUniforms) {
		delete uniforms[UniformName.RESOLUTION];
	}
	// private _updateResolutionDependentUniformsCache() {
	// 	this._resolutionDependentUniforms.splice(0, this._resolutionDependentUniforms.length);
	// 	this._resolutionDependentUniformsMap.forEach((uniforms) => {
	// 		this._resolutionDependentUniforms.push(uniforms);
	// 	});
	// }

	updateResolution(resolution: Vector2) {
		GLOBAL_UNIFORMS[UniformName.RESOLUTION].value.copy(resolution);
		// for (let uniforms of this._resolutionDependentUniforms) {
		// 	this.updateResolutionDependentUniforms(uniforms);
		// }
	}
	// updateResolutionDependentUniforms(uniforms: IUniformsWithResolutionOnly) {
	// 	const resolutionUniform = uniforms[UniformName.RESOLUTION];
	// 	resolutionUniform.value.x = this._resolution.x; // * window.devicePixelRatio;
	// 	resolutionUniform.value.y = this._resolution.y; // * window.devicePixelRatio;
	// }
}
