import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Material} from 'three/src/materials/Material';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {Shader} from 'three/src/renderers/shaders/ShaderLib';
import {PolyScene} from '../../../../../scene/PolyScene';
import {GlParamConfig, GlParamConfigJSON} from '../../utils/GLParamConfig';
import {ParamType} from '../../../../../poly/ParamType';
import {PolyDictionary} from '../../../../../../types/GlobalTypes';
import {IUniformTexture} from '../../../../utils/code/gl/Uniforms';

export interface OnBeforeCompileData {
	vertexShader: string;
	fragmentShader: string;
	paramConfigs: readonly GlParamConfig<ParamType>[];
	// additionalUniformNames: string[];
	additionalTextureUniforms: PolyDictionary<IUniformTexture>;
	timeDependent: boolean;
	resolutionDependent: boolean;
}
type OnBeforeCompile = (shader: Shader) => void;

export function assignUniformViaUserData(material: Material, uniformName: string, newUniform: IUniformTexture) {
	const uniforms = MaterialUserDataUniforms.getUniforms(material);
	if (uniforms) {
		const currentUniform = uniforms[uniformName];
		if (currentUniform) {
			currentUniform.value = newUniform.value;
		} else {
			uniforms[uniformName] = newUniform;
		}
	} else {
		// if there are no uniforms, the material has not been compiled yet.
		// we therefore must add those to userData so that they are picked up in onBeforeCompile.
		// For instance, this can be the case for materials assigned to particles, when run without assemblers.
		// Since the assembler is responsible for assigning the additionalTextures, this is not done when they are not loaded.
		// But for this to work, we also need to make sure that the persistedConfig will not contain the uniforms in the userData
		// so those must be stripped out when saving it
		OnBeforeCompileDataHandler.addAdditionalTexture(material, uniformName, newUniform);
	}
}

export class MaterialUserDataUniforms {
	static getUniforms(material: Material): PolyDictionary<IUniform> | undefined {
		return material.userData?.uniforms;
	}
	static setUniforms(material: Material, uniforms: PolyDictionary<IUniform>) {
		material.userData.uniforms = uniforms;
	}
	static removeUniforms(material: Material) {
		const uniforms = this.getUniforms(material);
		if (uniforms) {
			const userData = material.userData;
			delete userData['uniforms'];
		}
		return uniforms;
	}
}

export function assignOnBeforeCompileDataAndFunction(scene: PolyScene, material: Material, data: OnBeforeCompileData) {
	OnBeforeCompileDataHandler.setData(material, data);
	material.onBeforeCompile = _createOnBeforeCompile(scene, material);
	// it is important that customProgramCacheKey is also set when there are no assemblers
	// as otherwise the material will all use the same key, and will override each other
	const key = `${material.uuid}:${performance.now()}`;
	material.customProgramCacheKey = () => key;
}
interface CopyParams {
	src: Material;
	dest: Material;
	shareCustomUniforms: boolean;
}
export function copyOnBeforeCompileData(scene: PolyScene, params: CopyParams) {
	const {src, dest, shareCustomUniforms} = params;
	const data = OnBeforeCompileDataHandler.getData(src);
	if (data) {
		function cloneData(data: OnBeforeCompileData) {
			const json = OnBeforeCompileDataConverter.toJSON(data);
			return OnBeforeCompileDataConverter.fromJSON(json);
		}
		const newData = shareCustomUniforms ? data : cloneData(data);
		assignOnBeforeCompileDataAndFunction(scene, dest, newData);
	}
}

function _createOnBeforeCompile(scene: PolyScene, material: Material): OnBeforeCompile {
	const onBeforeCompile = (shader: Shader) => {
		const data = OnBeforeCompileDataHandler.getData(material);
		if (!data) {
			return;
		}
		const {
			vertexShader,
			fragmentShader,
			paramConfigs,
			additionalTextureUniforms,
			timeDependent,
			resolutionDependent,
		} = data;
		shader.vertexShader = vertexShader;
		shader.fragmentShader = fragmentShader;
		scene.uniformsController.addUniforms(shader.uniforms, {
			paramConfigs,
			additionalTextureUniforms,
			timeDependent,
			resolutionDependent,
		});

		// also add to the material itself so that the material is easy to debug in the console, as well as in tests
		const shaderMaterial = material as ShaderMaterial;
		shaderMaterial.vertexShader = shader.vertexShader;
		shaderMaterial.fragmentShader = shader.fragmentShader;
		MaterialUserDataUniforms.setUniforms(material, shader.uniforms);
		shaderMaterial.userData.compilationsCount = shaderMaterial.userData.compilationsCount || 0;
		shaderMaterial.userData.compilationsCount++;
	};

	return onBeforeCompile;
}

export class OnBeforeCompileDataHandler {
	static setData(material: Material, data: OnBeforeCompileData) {
		material.userData.onBeforeCompileData = data;
	}
	static addAdditionalTexture(material: Material, uniformName: string, newUniform: IUniformTexture) {
		const data = this.getData(material);
		if (data) {
			const currentUniform = data.additionalTextureUniforms[uniformName];
			if (currentUniform == null) {
				data.additionalTextureUniforms[uniformName] = newUniform;
			}
		} else {
			console.warn('no data found on material', material);
		}
	}
	static getData(material: Material): OnBeforeCompileData | undefined {
		return material.userData.onBeforeCompileData;
	}
	static removeData(material: Material): OnBeforeCompileData | undefined {
		const data = this.getData(material);
		if (data) {
			const userData = material.userData;
			delete userData['onBeforeCompileData'];
		}
		return data;
	}
}

// from https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
type RemoveParamConfigField<Type> = {
	[Property in keyof Type as Exclude<Property, 'paramConfigs' | 'additionalTextureUniforms'>]: Type[Property];
};
export interface OnBeforeCompileDataJSON extends RemoveParamConfigField<OnBeforeCompileData> {
	paramConfigs: GlParamConfigJSON<ParamType>[];
}

export class OnBeforeCompileDataConverter {
	static toJSON(onBeforeCompileData: OnBeforeCompileData): OnBeforeCompileDataJSON {
		const onBeforeCompileDataJSON: OnBeforeCompileDataJSON = {
			vertexShader: onBeforeCompileData.vertexShader,
			fragmentShader: onBeforeCompileData.fragmentShader,
			timeDependent: onBeforeCompileData.timeDependent,
			resolutionDependent: onBeforeCompileData.resolutionDependent,
			paramConfigs: onBeforeCompileData.paramConfigs.map((pc) => pc.toJSON()),
		};
		return onBeforeCompileDataJSON;
	}
	static fromJSON(json: OnBeforeCompileDataJSON): OnBeforeCompileData {
		const onBeforeCompileData: OnBeforeCompileData = {
			...json,
			additionalTextureUniforms: {},
			paramConfigs: json.paramConfigs.map((json) => GlParamConfig.fromJSON(json)),
		};
		return onBeforeCompileData;
	}
}
