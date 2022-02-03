import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Material} from 'three/src/materials/Material';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {Shader} from 'three/src/renderers/shaders/ShaderLib';
import {PolyScene} from '../../../../../scene/PolyScene';
import {GlParamConfig} from '../../utils/GLParamConfig';
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

export function createOnBeforeCompile(
	scene: PolyScene,
	material: Material,
	data: OnBeforeCompileData
): OnBeforeCompile {
	const onBeforeCompile = (shader: Shader) => {
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
