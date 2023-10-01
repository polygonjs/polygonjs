import {DataTexture, Mesh, Vector2, Vector3, Vector4, FloatType, HalfFloatType, ShaderMaterial, Object3D} from 'three';
import {GlConstant} from '../geometry/GlConstant';
import {
	GPUComputationConfigRef,
	GPUComputationRenderer,
	GPUComputationRendererVariable,
} from './gpuCompute/GPUComputationRenderer';
import {ShaderName} from '../../engine/nodes/utils/shaders/ShaderName';
import {TextureAllocationsController} from '../../engine/nodes/gl/code/utils/TextureAllocationsController';
import {GlParamConfig} from '../../engine/nodes/gl/code/utils/GLParamConfig';
import {TextureAllocation} from '../../engine/nodes/gl/code/utils/TextureAllocation';
import {CoreUserAgent} from '../UserAgent';
import type {CoreParticlesController} from './CoreParticlesController';
import {CoreParticlesAttribute} from './CoreParticlesAttribute';
import {coreParticlesInitParticlesUVs} from './CoreParticlesInit';
import {textureFromAttributePointsCount, textureSizeFromPointsCount} from '../geometry/operation/TextureFromAttribute';
import {corePointClassFactory} from '../geometry/CoreObjectFactory';

export enum ParticlesDataType {
	AUTO = 'Auto',
	FLOAT = 'Float',
	HALF_FLOAT = 'HalfFloat',
}
export const PARTICLE_DATA_TYPES: ParticlesDataType[] = [
	ParticlesDataType.AUTO,
	ParticlesDataType.FLOAT,
	ParticlesDataType.HALF_FLOAT,
];
const DATA_TYPE_BY_ENUM = {
	[ParticlesDataType.AUTO]: CoreUserAgent.isiOS() ? HalfFloatType : FloatType,
	[ParticlesDataType.FLOAT]: FloatType,
	[ParticlesDataType.HALF_FLOAT]: HalfFloatType,
};

function dataType(object: Object3D) {
	const dataType = CoreParticlesAttribute.getDataType(object);
	const dataTypeName = PARTICLE_DATA_TYPES[dataType];
	return DATA_TYPE_BY_ENUM[dataTypeName];
}
const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();

export class CoreParticlesGpuComputeController {
	protected _gpuCompute: GPUComputationRenderer | undefined;
	private _variablesByName: Map<ShaderName, GPUComputationRendererVariable> = new Map();
	private _allVariables: GPUComputationRendererVariable[] = [];
	private _createdTexturesByName: Map<ShaderName, DataTexture> = new Map();
	protected _lastSimulatedFrame: number | undefined;
	private _texturesSize: Vector2 = new Vector2();
	private _persistedTextureAllocationsController: TextureAllocationsController | undefined;

	constructor(private mainController: CoreParticlesController) {}

	dispose() {
		if (this._gpuCompute) {
			this._gpuCompute.dispose();
			this._gpuCompute = undefined;
		}

		this._variablesByName.clear();
		this._allVariables.splice(0, this._allVariables.length);
		this._createdTexturesByName.clear();

		if (this._persistedTextureAllocationsController) {
			this._persistedTextureAllocationsController.dispose();
			this._persistedTextureAllocationsController = undefined;
		}
	}

	setPersistedTextureAllocationController(controller: TextureAllocationsController) {
		this._persistedTextureAllocationsController = controller;
	}

	allVariables() {
		return this._allVariables;
	}

	init() {
		this._initPoints();
		return this.createGPUCompute();
	}

	private _initPoints() {
		this.resetGpuCompute();
	}
	private _initParticlesUVs(object: Object3D) {
		coreParticlesInitParticlesUVs(object, this._texturesSize);
	}

	createGPUCompute() {
		const object = this.mainController.object();
		const renderer = this.mainController.renderer();
		if (!(object && renderer)) {
			return;
		}
		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			return;
		}

		textureSizeFromPointsCount(geometry, this._texturesSize);
		this._initParticlesUVs(object);
		// we need to recreate the material if the texture allocation changes
		this.mainController.renderController.reset();

		if (this._gpuCompute) {
			this._gpuCompute.dispose();
		}
		this._gpuCompute = new GPUComputationRenderer(this._texturesSize.x, this._texturesSize.y, renderer);

		this._gpuCompute.setDataType(dataType(object));

		this._lastSimulatedFrame = undefined;

		this._variablesByName.forEach((variable, shader_name) => {
			variable.renderTargets[0].dispose();
			variable.renderTargets[1].dispose();
			this._variablesByName.delete(shader_name);
		});
		// for (let shader_name of Object.keys(this._shaders_by_name)) {
		this._allVariables = [];
		this.mainController.shadersByName().forEach((shader, shader_name) => {
			if (this._gpuCompute) {
				const gpuVariable = this._gpuCompute.addVariable(
					this._textureNameForShaderName(shader_name),
					shader,
					this._createdTexturesByName.get(shader_name)!
				);
				this._variablesByName.set(shader_name, gpuVariable);
				this._allVariables.push(gpuVariable);
			}
		});

		this._variablesByName?.forEach((variable, shader_name) => {
			if (this._gpuCompute) {
				this._gpuCompute.setVariableDependencies(
					variable,
					this._allVariables // currently all depend on all
				);
			}
		});

		this._createTextureRenderTargets();
		this._fillTextures(object);
		this._createSimulationMaterialUniforms();

		const configRef = this._gpuCompute.init();

		if (!configRef) {
			// console.error(error);
			this.mainController.setError(`failed to generate the simulation shader`);
		}
		return configRef;
	}

	public computeSimulation(delta: number, configRef: GPUComputationConfigRef) {
		if (!this._gpuCompute /* || this._lastSimulatedTime == null*/) {
			return;
		}

		this._gpuCompute.compute(configRef);
		this.mainController.renderController.updateRenderMaterialUniforms();
		this._updateSimulationMaterialUniforms(delta);
	}

	getCurrentRenderTarget(shader_name: ShaderName) {
		const variable = this._variablesByName.get(shader_name);
		if (variable) {
			return this._gpuCompute?.getCurrentRenderTarget(variable);
		}
	}
	private _textureNameForShaderName(shaderName: ShaderName) {
		return `texture_${shaderName}`;
	}
	materials() {
		const materials: ShaderMaterial[] = [];
		this._variablesByName.forEach((variable, shader_name) => {
			materials.push(variable.material);
		});
		return materials;
	}

	private _createSimulationMaterialUniforms() {
		const node = this.mainController.node();
		const assemblerController = node.assemblerController();
		const assembler = assemblerController?.assembler;
		if (!assembler && !this._persistedTextureAllocationsController) {
			return;
		}
		const all_materials: ShaderMaterial[] = [];
		this._variablesByName.forEach((variable, shader_name) => {
			// const uniforms = variable.material.uniforms;
			all_materials.push(variable.material);
		});
		const readonlyAllocations = this._readonlyAllocations();
		for (const material of all_materials) {
			material.uniforms[GlConstant.TIME] = this.mainController.scene.timeController.timeUniform();
			material.uniforms[GlConstant.DELTA_TIME] = this.mainController.scene.timeController.timeDeltaUniform();
			// and we add the readonly textures
			if (readonlyAllocations) {
				this._assignReadonlyTextures(material, readonlyAllocations);
			}
		}

		if (assembler) {
			for (const material of all_materials) {
				for (const param_config of assembler.param_configs()) {
					material.uniforms[param_config.uniformName()] = param_config.uniform();
				}
			}
		} else {
			const persisted_data = node.persisted_config.loaded_data();
			if (persisted_data) {
				const persisted_uniforms = node.persisted_config.uniforms();
				if (persisted_uniforms) {
					const param_uniform_pairs = persisted_data.param_uniform_pairs;
					for (const pair of param_uniform_pairs) {
						const param_name = pair[0];
						const uniform_name = pair[1];
						const param = node.params.get(param_name);
						const uniform = persisted_uniforms[uniform_name];
						for (const material of all_materials) {
							material.uniforms[uniform_name] = uniform;
							if (readonlyAllocations) {
								this._assignReadonlyTextures(material, readonlyAllocations);
							}
						}
						if (param && uniform) {
							const callback = () => {
								for (const material of all_materials) {
									GlParamConfig.callback(param, material.uniforms[uniform_name]);
								}
							};
							param.options.setOption('callback', callback);
							// just like texture and material persistedconfigs
							// the callback should be run a first time
							// so that ramp params can be set correctly
							callback();
						}
					}
				}
			}
		}
	}
	private _assignReadonlyTextures(material: ShaderMaterial, readonlyAllocations: TextureAllocation[]) {
		for (const allocation of readonlyAllocations) {
			const shaderName = allocation.shaderName();
			const texture = this._createdTexturesByName.get(shaderName);
			if (texture) {
				const uniformName = this._textureNameForShaderName(shaderName);
				material.uniforms[uniformName] = {value: texture};
			}
		}
	}

	private _updateSimulationMaterialUniforms(delta: number) {
		for (const variable of this._allVariables) {
			variable.material.uniforms[GlConstant.TIME].value += delta;
			variable.material.uniforms[GlConstant.DELTA_TIME].value = delta;
		}
	}

	createdTexturesByName(): Readonly<Map<ShaderName, DataTexture>> {
		return this._createdTexturesByName;
	}

	private _fillTextures(object: Object3D) {
		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const corePointClass = corePointClassFactory(object);
		const pointsCount = textureFromAttributePointsCount(geometry);
		const texture_allocations_controller = this._textureAllocationsController();
		if (!texture_allocations_controller) {
			return;
		}
		this._createdTexturesByName.forEach((texture, shader_name) => {
			const texture_allocation = texture_allocations_controller.allocationForShaderName(shader_name);
			if (!texture_allocation) {
				console.warn(`no allocation found for shader ${shader_name}`);
				return;
			}
			const texture_variables = texture_allocation.variables();
			if (!texture_variables) {
				console.warn(`allocation has no variables`);
				return;
			}

			const array = texture.image.data;

			for (const texture_variable of texture_variables) {
				const texture_position = texture_variable.position();
				let variable_name = texture_variable.name();

				// const first_point = this._points[0];
				// if (first_point) {
				const has_attrib = corePointClass.hasAttribute(object, variable_name);
				if (has_attrib) {
					const attrib_size = corePointClass.attribSize(object, variable_name);
					let cmptr = texture_position;
					for (let i = 0; i < pointsCount; i++) {
						switch (attrib_size) {
							case 1: {
								const val: number = corePointClass.attribValue(object, i, variable_name) as number;
								array[cmptr] = val;
								break;
							}
							case 2: {
								corePointClass.attribValue(object, i, variable_name, tmpV2);
								tmpV2.toArray(array, cmptr);
								break;
							}
							case 3: {
								corePointClass.attribValue(object, i, variable_name, tmpV3);
								tmpV3.toArray(array, cmptr);
								break;
							}
							case 4: {
								corePointClass.attribValue(object, i, variable_name, tmpV4);
								tmpV4.toArray(array, cmptr);
								break;
							}
						}
						// if (attrib_size == 1) {
						// } else {
						// 	(CorePoint.attribValue(geometry, i,variable_name) as Vector2).toArray(array, cmptr);
						// }
						cmptr += 4;
					}
				}
				// }
			}
			texture.needsUpdate = true;
		});
	}
	reset() {
		this.resetGpuCompute();
	}
	private resetGpuCompute() {
		this._gpuCompute?.dispose();
		this._gpuCompute = undefined;
	}

	private _createTextureRenderTargets() {
		this._createdTexturesByName.forEach((texture, shader_name) => {
			texture.dispose();
		});

		this._createdTexturesByName.clear();
		this._variablesByName.forEach((texture_variable, shader_name) => {
			if (this._gpuCompute) {
				this._createdTexturesByName.set(shader_name, this._gpuCompute.createTexture());
			}
		});
		// we also need to create textures for readonly variables
		const readonlyAllocations = this._readonlyAllocations();
		if (readonlyAllocations && this._gpuCompute) {
			for (const readonlyAllocation of readonlyAllocations) {
				this._createdTexturesByName.set(readonlyAllocation.shaderName(), this._gpuCompute.createTexture());
			}
		}
	}
	private _textureAllocationsController() {
		const node = this.mainController.node();
		return (
			node.assemblerController()?.assembler.textureAllocationsController() ||
			this._persistedTextureAllocationsController
		);
	}
	private _readonlyAllocations() {
		return this._textureAllocationsController()?.readonlyAllocations();
	}
}
