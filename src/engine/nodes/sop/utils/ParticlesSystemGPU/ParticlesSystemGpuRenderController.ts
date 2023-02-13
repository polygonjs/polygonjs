// import {ObjectUtils} from '../../../../../core/ObjectUtils';
// import {Material} from 'three';
// import {Object3D} from 'three';
// import {BaseBuilderMatNodeType} from '../../../mat/_BaseBuilder';
// import {ParticlesSystemGpuSopNode} from '../../ParticlesSystemGpu';
// import {CoreMaterial, ShaderMaterialWithCustomMaterials} from '../../../../../core/geometry/Material';
// import {CoreGroup} from '../../../../../core/geometry/Group';
// import {Mesh} from 'three';
// import {ShaderName} from '../../../utils/shaders/ShaderName';
// import {TextureAllocationsControllerData} from '../../../gl/code/utils/TextureAllocationsController';
// import {GlobalsTextureHandler, GlobalsTextureHandlerPurpose} from '../../../gl/code/globals/Texture';
// import {NodeContext} from '../../../../poly/NodeContext';
// import {ShaderAssemblerMaterial} from '../../../gl/code/assemblers/materials/_BaseMaterial';
// import {IUniformTexture} from '../../../utils/code/gl/Uniforms';

// export class ParticlesSystemGpuRenderController {
// 	private _renderMaterial: Material | undefined;
// 	protected _particlesGroupObjects: Object3D[] = [];
// 	private _allShaderNames: ShaderName[] = [];
// 	private _uniformByShaderName: Map<ShaderName, IUniformTexture> = new Map();
// 	private _allUniformNames: string[] = [];
// 	private _texture_allocations_json: TextureAllocationsControllerData | undefined;
// 	private _materialGlobalsHandler = new GlobalsTextureHandler(
// 		GlobalsTextureHandler.UV_VARYING,
// 		GlobalsTextureHandlerPurpose.MATERIAL
// 	);
// 	private _matNodeAssembler: ShaderAssemblerMaterial | undefined;

// 	constructor(private node: ParticlesSystemGpuSopNode) {}

// 	setShadersByName(shadersByName: Map<ShaderName, string>) {
// 		this._allShaderNames = [];
// 		this._uniformByShaderName.clear();
// 		this._allUniformNames = [];
// 		shadersByName.forEach((shader, name) => {
// 			this._allShaderNames.push(name);
// 			this._allUniformNames.push(`texture_${name}`);
// 		});

// 		this.resetRenderMaterial();
// 	}

// 	assignRenderMaterial() {
// 		if (!this._renderMaterial) {
// 			return;
// 		}
// 		for (let object3d of this._particlesGroupObjects) {
// 			const object = object3d as Mesh;
// 			if (object.geometry) {
// 				object.material = this._renderMaterial;
// 				CoreMaterial.applyCustomMaterials(object, this._renderMaterial as ShaderMaterialWithCustomMaterials);
// 				object.matrixAutoUpdate = false;
// 				object.updateMatrix();
// 			}
// 		}
// 		// if this material is recomputed on a frame after the frame_start
// 		// we need to:
// 		// - mark the material as needsUpdate (to ensure it gets recompiled by the renderer)
// 		// - update the uniforms (to ensure the material gets the right values, as the uniforms have been reset)
// 		this._renderMaterial.needsUpdate = true;
// 		this.updateRenderMaterialUniforms();
// 	}
// 	updateRenderMaterialUniforms() {
// 		if (!this._renderMaterial) {
// 			console.warn('no renderMaterial');
// 			return;
// 		}

// 		let uniformName: string;
// 		let shaderName: ShaderName;
// 		for (let i = 0; i < this._allShaderNames.length; i++) {
// 			shaderName = this._allShaderNames[i];
// 			uniformName = this._allUniformNames[i];
// 			let uniform = this._uniformByShaderName.get(shaderName);
// 			if (!uniform) {
// 				uniform = {value: null};
// 				this._uniformByShaderName.set(shaderName, uniform);
// 			}
// 			const texture = this.node.gpuController.getCurrentRenderTarget(shaderName)?.texture;
// 			uniform.value = texture || null;
// 			// Setting needsUpdate to true was an attempt at fixing the bug
// 			// where a particle system with no output on scene load
// 			// fails to render when adding outputs later.
// 			// At least until the scene is fully reloaded
// 			// texture.needsUpdate = true;
// 			CoreMaterial.assignUniforms(this._renderMaterial, uniformName, uniform, this._matNodeAssembler);
// 			// this._renderMaterial.uniforms[uniformName].value = texture;
// 			// CoreMaterial.assignCustomUniforms(this._renderMaterial, uniformName, texture);
// 		}
// 	}

// 	resetRenderMaterial() {
// 		this._renderMaterial = undefined;
// 		this._particlesGroupObjects = [];
// 	}
// 	material() {
// 		return this._renderMaterial;
// 	}
// 	initialized(): boolean {
// 		return this._renderMaterial != null;
// 	}

// 	initCoreGroup(core_group: CoreGroup) {
// 		for (let child of core_group.objectsWithGeo()) {
// 			this._particlesGroupObjects.push(child);
// 		}
// 	}
// 	async initRenderMaterial() {
// 		const assembler = this.node.assemblerController()?.assembler;

// 		if (this._renderMaterial) {
// 			return;
// 		}

// 		if (this.node.p.material.isDirty()) {
// 			this.node.debugMessage('renderController: this.node.p.material.compute() START');
// 			await this.node.p.material.compute();
// 			this.node.debugMessage('renderController: this.node.p.material.compute() END');
// 		}
// 		const matNode = this.node.pv.material.nodeWithContext(
// 			NodeContext.MAT,
// 			this.node.states.error
// 		) as BaseBuilderMatNodeType;

// 		if (matNode) {
// 			if (assembler) {
// 				const new_texture_allocations_json: TextureAllocationsControllerData = assembler
// 					.textureAllocationsController()
// 					.toJSON(this.node.scene());

// 				const matNodeAssemblerController = matNode.assemblerController();
// 				if (matNodeAssemblerController) {
// 					this._materialGlobalsHandler.set_texture_allocations_controller(
// 						assembler.textureAllocationsController()
// 					);
// 					matNodeAssemblerController.setAssemblerGlobalsHandler(this._materialGlobalsHandler);
// 					this._matNodeAssembler = matNodeAssemblerController.assembler; //.setAdditionalUniformNames(this._allUniformNames);
// 				}

// 				if (
// 					!this._texture_allocations_json ||
// 					JSON.stringify(this._texture_allocations_json) != JSON.stringify(new_texture_allocations_json)
// 				) {
// 					// we need to set the node to dirty if a recompile is needed
// 					// otherwise it won't cook
// 					// but we also need to check if the texture_allocation has changed,
// 					// otherwise we'll have an infinite loop
// 					this._texture_allocations_json = ObjectUtils.cloneDeep(new_texture_allocations_json);
// 					// setting the material to dirty is not enough. We need to make it clear a recompile is required.
// 					// This is necessary since if inputs of output or any export note are changed, the texture allocation will change. If the mat node was to not recompile, it would fetch attributes such as position from an incorrect or non existing texture.
// 					if (matNodeAssemblerController) {
// 						matNodeAssemblerController.setCompilationRequiredAndDirty();
// 					}
// 				}
// 			}
// 			this.node.debugMessage('renderController: matNode.compute() START');
// 			const container = await matNode.compute();
// 			this.node.debugMessage('renderController: matNode.compute() END');
// 			this._renderMaterial = container.material();
// 		} else {
// 			this.node.states.error.set('render material not valid');
// 		}

// 		// add uniforms
// 		// if (this._renderMaterial) {
// 		// 	const uniforms = this._renderMaterial.uniforms;
// 		// 	console.log('this._allUniformNames', this._allUniformNames);
// 		// 	for (let uniformName of this._allUniformNames) {
// 		// 		const uniformValue = {value: null};
// 		// 		uniforms[uniformName] = uniformValue;
// 		// 		if (this._renderMaterial) {
// 		// 			CoreMaterial.initCustomMaterialUniforms(this._renderMaterial, uniformName, uniformValue);
// 		// 		}
// 		// 	}
// 		// }

// 		this.assignRenderMaterial();
// 	}
// }
