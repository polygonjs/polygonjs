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

export function assignUniformViaUserData(material: Material, uniformName: string, newUniform: IUniform) {
	const uniforms = material.userData.uniforms;
	if (uniforms) {
		const currentUniform = uniforms[uniformName];
		if (currentUniform) {
			currentUniform.value = newUniform.value;
		} else {
			uniforms[uniformName] = newUniform;
		}
	}
}
export function materialUniforms(material: Material): PolyDictionary<IUniform> | undefined {
	return material.userData?.uniforms;
}
export function assignOnBeforeCompileDataAndFunction(scene: PolyScene, material: Material, data: OnBeforeCompileData) {
	_setOnBeforeCompileData(material, data);
	material.onBeforeCompile = _createOnBeforeCompile(scene, material);
}
interface CopyParams {
	src: Material;
	dest: Material;
	shareCustomUniforms: boolean;
}
export function copyOnBeforeCompileData(scene: PolyScene, params: CopyParams) {
	const {src, dest, shareCustomUniforms} = params;
	const data = _getOnBeforeCompileData(src);
	if (data) {
		function cloneData(data: OnBeforeCompileData) {
			const json = onBeforeCompileDataToJSON(data);
			return onBeforeCompileDataFromJSON(json);
		}
		const newData = shareCustomUniforms ? data : cloneData(data);
		assignOnBeforeCompileDataAndFunction(scene, dest, newData);
	}
}

function _createOnBeforeCompile(scene: PolyScene, material: Material): OnBeforeCompile {
	const onBeforeCompile = (shader: Shader) => {
		const data = _getOnBeforeCompileData(material);
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
		material.userData.uniforms = shader.uniforms;
	};

	return onBeforeCompile;
}

function _setOnBeforeCompileData(material: Material, data: OnBeforeCompileData) {
	material.userData.onBeforeCompileData = data;
}
function _getOnBeforeCompileData(material: Material): OnBeforeCompileData | undefined {
	return material.userData.onBeforeCompileData;
}
// from https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
type RemoveParamConfigField<Type> = {
	[Property in keyof Type as Exclude<Property, 'paramConfigs' | 'additionalTextureUniforms'>]: Type[Property];
};
export interface OnBeforeCompileDataJSON extends RemoveParamConfigField<OnBeforeCompileData> {
	paramConfigs: GlParamConfigJSON<ParamType>[];
}
export function onBeforeCompileDataToJSON(onBeforeCompileData: OnBeforeCompileData): OnBeforeCompileDataJSON {
	const onBeforeCompileDataJSON: OnBeforeCompileDataJSON = {
		vertexShader: onBeforeCompileData.vertexShader,
		fragmentShader: onBeforeCompileData.fragmentShader,
		timeDependent: onBeforeCompileData.timeDependent,
		resolutionDependent: onBeforeCompileData.resolutionDependent,
		paramConfigs: onBeforeCompileData.paramConfigs.map((pc) => pc.toJSON()),
	};
	return onBeforeCompileDataJSON;
}
export function onBeforeCompileDataFromJSON(json: OnBeforeCompileDataJSON): OnBeforeCompileData {
	const onBeforeCompileData: OnBeforeCompileData = {
		...json,
		additionalTextureUniforms: {},
		paramConfigs: json.paramConfigs.map((json) => GlParamConfig.fromJSON(json)),
	};
	return onBeforeCompileData;
}
