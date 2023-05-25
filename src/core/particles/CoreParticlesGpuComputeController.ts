import {
	BufferAttribute,
	DataTexture,
	InstancedBufferAttribute,
	Mesh,
	Vector2,
	Vector3,
	Vector4,
	FloatType,
	HalfFloatType,
	ShaderMaterial,
	Object3D,
} from 'three';
import {CoreGeometry} from '../geometry/Geometry';
import {GlConstant} from '../geometry/GlConstant';
import {GlobalsTextureHandler} from '../../engine/nodes/gl/code/globals/Texture';
import {GPUComputationRenderer, GPUComputationRendererVariable} from './gpuCompute/GPUComputationRenderer';
import {CorePoint} from '../geometry/Point';
import {ShaderName} from '../../engine/nodes/utils/shaders/ShaderName';
import {TextureAllocationsController} from '../../engine/nodes/gl/code/utils/TextureAllocationsController';
import {GlParamConfig} from '../../engine/nodes/gl/code/utils/GLParamConfig';
import {TextureAllocation} from '../../engine/nodes/gl/code/utils/TextureAllocation';
import {CoreUserAgent} from '../UserAgent';
import type {CoreParticlesController} from './CoreParticlesController';
import {CoreParticlesAttribute} from './CoreParticlesAttribute';
import {isBooleanTrue} from '../Type';
import {CoreMath} from '../math/_Module';

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

export function coreParticlesGpuComputeControllerPointsCount(object: Object3D): number {
	// let geometries = coreGroup.coreGeometries();
	// const firstGeometry = geometries[0];
	const geometry = (object as Mesh).geometry;

	if (geometry) {
		return CoreGeometry.pointsCount(geometry);
		// const type = CoreGeometry.markedAsInstance(geometry);
		// const attribute =
		// const selectedGeometry:BufferGeometry|undefined;
		// for (let geometry of geometries) {
		// 	if (geometry.markedAsInstance() == type) {
		// 		selectedGeometries.push(geometry);
		// 	}
		// }
		// // TODO: refactor
		// // const selectedGeometry = selectedGeometries[0];
		// return selectedGeometry.points().length;
		// let count=0
		// // for (let geometry of selectedGeometries) {
		// 	const points = selectedGeometry.points()
		// 	for (let point of points) {
		// 		// points.push(point);
		// 	}
		// // }
		// return points;
	} else {
		return 0;
	}
}
// const _autoTexturesSize = new Vector2()
const _maxTexturesSize = new Vector2();
const _texturesSize = new Vector2();
function getTextureSize(object: Object3D, target: Vector2) {
	const pointsCount = coreParticlesGpuComputeControllerPointsCount(object);

	const autoTexturesSize = CoreParticlesAttribute.getAutoTextureSize(object);
	CoreParticlesAttribute.getMaxTextureSize(object, _maxTexturesSize);
	CoreParticlesAttribute.getTextureSize(object, _texturesSize);

	// get texture size
	if (isBooleanTrue(autoTexturesSize)) {
		const nearest_power_of_two = CoreMath.nearestPower2(Math.sqrt(pointsCount));
		target.x = Math.min(nearest_power_of_two, _maxTexturesSize.x);
		target.y = Math.min(nearest_power_of_two, _maxTexturesSize.y);
	} else {
		// if (!(MathUtils.isPowerOfTwo(_texturesSize.x) && MathUtils.isPowerOfTwo(this.pv.texturesSize.y))) {
		// 	this.states.error.set('texture size must be a power of 2');
		// 	return;
		// }

		const maxParticlesCount = _texturesSize.x * _texturesSize.y;
		if (pointsCount > maxParticlesCount) {
			console.warn(
				`max particles is set to (${_texturesSize.x}x${_texturesSize.y}=) ${maxParticlesCount}, which is less than the points count of the input (${pointsCount})`
			);

			return;
		}
		target.copy(_texturesSize);
	}
}

export class CoreParticlesGpuComputeController {
	protected _gpuCompute: GPUComputationRenderer | undefined;
	// protected _simulationRestartRequired: boolean = false;

	// protected _particlesCoreGroup: CoreGroup | undefined;
	// protected _points: CorePoint[] = [];

	private _variablesByName: Map<ShaderName, GPUComputationRendererVariable> = new Map();
	private _allVariables: GPUComputationRendererVariable[] = [];
	private _createdTexturesByName: Map<ShaderName, DataTexture> = new Map();
	// private _shadersByName: Map<ShaderName, string> | undefined;
	protected _lastSimulatedFrame: number | undefined;
	// protected _lastSimulatedTime: number | undefined;
	// protected _deltaTime: number = 0;
	private _texturesSize: Vector2 = new Vector2();
	private _persistedTextureAllocationsController: TextureAllocationsController | undefined;

	// private _callbackName: string;
	// public readonly object: Object3D;
	constructor(private mainController: CoreParticlesController) {
		// this.object = this.mainController.object;
		// this._callbackName = `gpuCompute-${this.node.graphNodeId()}`;
	}

	dispose() {
		// if (this._graph_node) {
		// 	this._graph_node.dispose();
		// 	this._graph_node = undefined;
		// }
		if (this._gpuCompute) {
			this._gpuCompute.dispose();
			this._gpuCompute = undefined;
		}
		// if (this._renderer) {
		// 	this._renderer.dispose();
		// 	this._renderer = undefined;
		// }
		// if (this._particlesCoreGroup) {
		// 	this._particlesCoreGroup.dispose();
		// 	this._particlesCoreGroup = undefined;
		// }
		this._variablesByName.clear();
		this._allVariables.splice(0, this._allVariables.length);
		this._createdTexturesByName.clear();
		// if (this._shadersByName) {
		// 	this._shadersByName.clear();
		// 	this._shadersByName = undefined;
		// }
		if (this._persistedTextureAllocationsController) {
			this._persistedTextureAllocationsController.dispose();
			this._persistedTextureAllocationsController = undefined;
		}
		// this.node.scene().unRegisterOnBeforeTick(this._callbackName);
	}

	setPersistedTextureAllocationController(controller: TextureAllocationsController) {
		this._persistedTextureAllocationsController = controller;
	}

	// setShadersByName(shaders_by_name: Map<ShaderName, string>) {
	// 	this._shadersByName = shaders_by_name;
	// 	this.resetGpuCompute();
	// }
	allVariables() {
		return this._allVariables;
	}

	init() {
		this._initPoints();
		// this.node.debugMessage('GPUComputeController: this.createGPUCompute() START');
		this.createGPUCompute();
		// this.node.debugMessage('GPUComputeController: this.createGPUCompute() END');
	}

	private _initPoints() {
		this.resetGpuCompute();

		// this._particlesCoreGroup = coreGroup;

		// this._points = this._getPoints() || [];
	}
	private _initParticlesUVs(object: Object3D) {
		const pointsCount = coreParticlesGpuComputeControllerPointsCount(object);
		var uvs = new Float32Array(pointsCount * 2);

		let p = 0;
		var cmptr = 0;
		for (var j = 0; j < this._texturesSize.x; j++) {
			for (var i = 0; i < this._texturesSize.y; i++) {
				uvs[p++] = i / (this._texturesSize.x - 1);
				uvs[p++] = j / (this._texturesSize.y - 1);

				cmptr += 2;
				if (cmptr >= uvs.length) {
					break;
				}
			}
		}

		const uv_attrib_name = GlobalsTextureHandler.UV_ATTRIB;
		const geometry = (object as Mesh).geometry;
		const attribute_constructor = CoreGeometry.markedAsInstance(geometry)
			? InstancedBufferAttribute
			: BufferAttribute;
		// if (this._particlesCoreGroup) {
		// for (let core_geometry of this._particlesCoreGroup.coreGeometries()) {
		// const geometry = core_geometry.geometry();

		geometry.setAttribute(uv_attrib_name, new attribute_constructor(uvs, 2));
		// }
		// }
	}
	// computeSimulationIfRequired(delta: number) {
	// 	console.warn('computeSimulationIfRequired');
	// 	const frame = this.node.scene().frame();
	// 	const start_frame: number = this.node.pv.startFrame;
	// 	if (frame >= start_frame) {
	// 		if (this._lastSimulatedFrame == null) {
	// 			this._lastSimulatedFrame = start_frame - 1;
	// 		}
	// 		// if (this._lastSimulatedTime == null) {
	// 		// 	this._lastSimulatedTime = this.node.scene().time();
	// 		// }
	// 		if (frame > this._lastSimulatedFrame) {
	// 			const iterationsCount = frame - this._lastSimulatedFrame;
	// 			this._lastSimulatedFrame = frame;
	// 			if (!isBooleanTrue(this.node.pv.active)) {
	// 				return;
	// 			}
	// 			this._computeSimulation(delta, iterationsCount);
	// 		}
	// 	}
	// }

	createGPUCompute() {
		const object = this.mainController.object();
		const renderer = this.mainController.renderer();
		if (!(object && renderer)) {
			return;
		}
		// const autoTexturesSize = CoreParticlesAttribute.getAutoTextureSize(this.object)
		// CoreParticlesAttribute.getMaxTextureSize(this.object,maxTexturesSize)
		// CoreParticlesAttribute.getTextureSize(object, this._texturesSize);
		getTextureSize(object, this._texturesSize);
		// if (isBooleanTrue(autoTexturesSize)) {
		// 	const nearest_power_of_two = CoreMath.nearestPower2(Math.sqrt(this._points.length));
		// 	this._usedTexturesSize.x = Math.min(nearest_power_of_two, maxTexturesSize.x);
		// 	this._usedTexturesSize.y = Math.min(nearest_power_of_two, maxTexturesSize.y);
		// } else {
		// 	if (
		// 		!(
		// 			MathUtils.isPowerOfTwo(texturesSize.x) &&
		// 			MathUtils.isPowerOfTwo(texturesSize.y)
		// 		)
		// 	) {
		// 		this.node.states.error.set('texture size must be a power of 2');
		// 		return;
		// 	}

		// 	const max_particles_count = texturesSize.x * texturesSize.y;
		// 	if (this._points.length > max_particles_count) {
		// 		this.node.states.error.set(
		// 			`max particles is set to (${texturesSize.x}x${texturesSize.y}=) ${max_particles_count}`
		// 		);
		// 		return;
		// 	}
		// 	this._usedTexturesSize.copy(texturesSize);
		// }

		// this._forceTimeDependent();
		this._initParticlesUVs(object);
		// we need to recreate the material if the texture allocation changes
		this.mainController.renderController.reset();

		// if (!this._renderer) {
		// 	return;
		// }
		if (this._gpuCompute) {
			this._gpuCompute.dispose();
		}
		this._gpuCompute = new GPUComputationRenderer(this._texturesSize.x, this._texturesSize.y, renderer);

		this._gpuCompute.setDataType(dataType(object));

		// if (!this._gpuCompute) {
		// 	this.node.states.error.set('failed to create the GPUComputationRenderer');
		// 	return;
		// }

		this._lastSimulatedFrame = undefined;

		// document.body.style = ''
		// document.body.appendChild( renderer.domElement );

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

		var error = this._gpuCompute.init();

		if (error !== null) {
			console.error(error);
			this.mainController.setError(error);
		}
	}

	// private _graph_node: CoreGraphNode | undefined;
	// private _forceTimeDependent() {
	// 	// using force_time_dependent would force the whole node to recook,
	// 	// but that would also trigger the obj geo node to update its display node.
	// 	// A better way is to just recompute the sim only, outside of the cook method.
	// 	// But we need to be sure that on first frame, we are still recooking the whole node
	// 	// this.node.states.time_dependent.force_time_dependent();
	// 	// if (!this._graph_node) {
	// 	// 	this._graph_node = new CoreGraphNode(this.node.scene(), 'gpu_compute');
	// 	// 	this._graph_node.addGraphInput(this.node.scene().timeController.graphNode);
	// 	// 	this._graph_node.addPostDirtyHook('on_time_change', this._onGraphNodeDirty.bind(this));
	// 	// }
	// 	const callback = this._onTimeUpdate.bind(this);
	// 	if (!this.node.scene().registeredBeforeTickCallbacks().has(this._callbackName)) {
	// 		this.node.scene().registerOnBeforeTick(this._callbackName, callback);
	// 	}
	// }
	// private _onTimeUpdate(delta: number) {
	// 	if (this.node.isOnStartFrame()) {
	// 		this.node.setDirty();
	// 		return;
	// 	} else {
	// 		this.computeSimulationIfRequired(delta);
	// 	}
	// }

	public computeSimulation(delta: number) {
		if (!this._gpuCompute /* || this._lastSimulatedTime == null*/) {
			return;
		}

		this._gpuCompute.compute();
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
		for (let material of all_materials) {
			material.uniforms[GlConstant.TIME] = this.mainController.scene.timeController.timeUniform();
			material.uniforms[GlConstant.DELTA_TIME] = this.mainController.scene.timeController.timeDeltaUniform();
			// and we add the readonly textures
			if (readonlyAllocations) {
				this._assignReadonlyTextures(material, readonlyAllocations);
			}
		}

		if (assembler) {
			for (let material of all_materials) {
				for (let param_config of assembler.param_configs()) {
					material.uniforms[param_config.uniformName()] = param_config.uniform();
				}
			}
		} else {
			const persisted_data = node.persisted_config.loaded_data();
			if (persisted_data) {
				const persisted_uniforms = node.persisted_config.uniforms();
				if (persisted_uniforms) {
					const param_uniform_pairs = persisted_data.param_uniform_pairs;
					for (let pair of param_uniform_pairs) {
						const param_name = pair[0];
						const uniform_name = pair[1];
						const param = node.params.get(param_name);
						const uniform = persisted_uniforms[uniform_name];
						for (let material of all_materials) {
							material.uniforms[uniform_name] = uniform;
							if (readonlyAllocations) {
								this._assignReadonlyTextures(material, readonlyAllocations);
							}
						}
						if (param && uniform) {
							const callback = () => {
								for (let material of all_materials) {
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
		for (let allocation of readonlyAllocations) {
			const shaderName = allocation.shaderName();
			const texture = this._createdTexturesByName.get(shaderName);
			if (texture) {
				const uniformName = this._textureNameForShaderName(shaderName);
				material.uniforms[uniformName] = {value: texture};
			}
		}
	}

	private _updateSimulationMaterialUniforms(delta: number) {
		for (let variable of this._allVariables) {
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
		const pointsCount = coreParticlesGpuComputeControllerPointsCount(object);
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

			for (let texture_variable of texture_variables) {
				const texture_position = texture_variable.position();
				let variable_name = texture_variable.name();

				// const first_point = this._points[0];
				// if (first_point) {
				const has_attrib = CoreGeometry.hasAttrib(geometry, variable_name);
				if (has_attrib) {
					const attrib_size = CoreGeometry.attribSize(geometry, variable_name);
					let cmptr = texture_position;
					for (let i = 0; i < pointsCount; i++) {
						switch (attrib_size) {
							case 1: {
								const val: number = CorePoint.attribValue(geometry, i, variable_name) as number;
								array[cmptr] = val;
								break;
							}
							case 2: {
								CorePoint.attribValue(geometry, i, variable_name, tmpV2);
								tmpV2.toArray(array, cmptr);
								break;
							}
							case 3: {
								CorePoint.attribValue(geometry, i, variable_name, tmpV3);
								tmpV3.toArray(array, cmptr);
								break;
							}
							case 4: {
								CorePoint.attribValue(geometry, i, variable_name, tmpV4);
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
		// this._resetParticleGroups();
	}
	private resetGpuCompute() {
		this._gpuCompute?.dispose();
		this._gpuCompute = undefined;
		// this._simulationRestartRequired = true;
	}
	// setRestartNotRequired() {
	// 	this._simulationRestartRequired = false;
	// }
	// resetGpuComputeAndSetDirty() {
	// 	this.resetGpuCompute();
	// 	// this.node.setDirty();
	// }
	// private resetParticleGroups() {
	// 	this._particlesCoreGroup = undefined;
	// }
	// initialized(): boolean {
	// 	return this._particlesCoreGroup != null && this._gpuCompute != null;
	// }

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
			for (let readonlyAllocation of readonlyAllocations) {
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

	// restartSimulationIfRequired() {
	// 	if (this._simulationRestartRequired) {
	// 		this._restartSimulation();
	// 	}
	// }
	// private _restartSimulation() {
	// 	const object = this.mainController.object();
	// 	if (!object) {
	// 		return;
	// 	}
	// 	this.mainController.debugMessage(`restartSimulation`);

	// 	// this._lastSimulatedTime = undefined;

	// 	this._createTextureRenderTargets();
	// 	// const points = this._getPoints(); // TODO: typescript - not sure that's right
	// 	// if (!points) {
	// 	// 	return;
	// 	// }

	// 	this._fillTextures(object);

	// 	this._variablesByName.forEach((variable, shader_name) => {
	// 		const texture = this._createdTexturesByName.get(shader_name);
	// 		if (this._gpuCompute && texture) {
	// 			this._gpuCompute.renderTexture(texture, variable.renderTargets[0]);
	// 			this._gpuCompute.renderTexture(texture, variable.renderTargets[1]);
	// 		}
	// 	});
	// }

	// if we have a mix of marked_as_instance and non marked_as_instance
	// we take all geos that are the type that comes first
	// private _getPoints() {
	// 	if (!this._particlesCoreGroup) {
	// 		return;
	// 	}

	// 	let geometries = this._particlesCoreGroup.coreGeometries();
	// 	const first_geometry = geometries[0];
	// 	if (first_geometry) {
	// 		const type = first_geometry.markedAsInstance();
	// 		const selected_geometries = [];
	// 		for (let geometry of geometries) {
	// 			if (geometry.markedAsInstance() == type) {
	// 				selected_geometries.push(geometry);
	// 			}
	// 		}
	// 		const points = [];
	// 		for (let geometry of selected_geometries) {
	// 			for (let point of geometry.points()) {
	// 				points.push(point);
	// 			}
	// 		}
	// 		return points;
	// 	} else {
	// 		return [];
	// 	}
	// }
}
