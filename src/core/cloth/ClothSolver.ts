import {Object3D, Mesh} from 'three';
import {clothControllerFromObject} from './ClothControllerRegister';
import {
	ClothMaterialUniformConfig,
	ClothMaterialUniformConfigRef,
	ClothMaterialUniformNameConfig,
} from './modules/ClothFBOController';
import {MaterialUserDataUniforms} from '../../engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {isArray} from '../Type';
import {UNIFORM_PARAM_PREFIX, UNIFORM_TEXTURE_PREFIX} from '../material/uniform';

function _addParamPrefix(uniformName: string): string {
	return `${UNIFORM_PARAM_PREFIX}${uniformName}`;
}
function _addTexturePrefix(uniformName: string): string {
	return `${UNIFORM_TEXTURE_PREFIX}${uniformName}`;
}

export function clothSolverStepSimulation(
	clothObject: Object3D,
	delta: number,
	stepsCount: number,
	selectedVertexInfluence: number,
	viscosity: number,
	spring: number,
	uniformConfig: ClothMaterialUniformConfigRef
) {
	const controller = clothControllerFromObject(clothObject);
	if (!controller) {
		console.log('no controller for', clothObject.uuid);
		return;
	}
	controller.stepsCount = stepsCount;
	controller.selectedVertexInfluence = selectedVertexInfluence;
	controller.viscosity = viscosity;
	controller.spring = spring;

	controller.update(delta, uniformConfig);
}
export function clothSolverUpdateMaterial(
	clothObject: Object3D,
	uniformConfig: ClothMaterialUniformConfig,
	uniformNameConfig: ClothMaterialUniformNameConfig
) {
	const material = (clothObject as Mesh).material;
	if (!material) {
		return;
	}
	if (isArray(material)) {
		return;
	}
	const uniforms = MaterialUserDataUniforms.getUniforms(material);
	if (!uniforms) {
		return;
	}

	uniforms[_addParamPrefix(uniformNameConfig.tSize)].value = uniformConfig.tSize;
	uniforms[_addTexturePrefix(uniformNameConfig.tPosition0)].value = uniformConfig.tPosition0;
	uniforms[_addTexturePrefix(uniformNameConfig.tPosition1)].value = uniformConfig.tPosition1;
	uniforms[_addTexturePrefix(uniformNameConfig.tNormal)].value = uniformConfig.tNormal;
}
