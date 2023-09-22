import {ClothMaterialController} from './modules/ClothMaterialsController';
import {ClothGeometryInitController} from './modules/ClothGeometryInitController';
import {ClothFBOController, ClothMaterialUniformConfigRef} from './modules/ClothFBOController';
import {WebGLRenderer, Mesh, Vector3, ShaderMaterial, Texture} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import type {ClothSolverSopNode} from '../../engine/nodes/sop/ClothSolver';
import {TextureAllocationsController} from '../../engine/nodes/gl/code/utils/TextureAllocationsController';
import {GlParamConfig} from '../../engine/nodes/gl/code/utils/GLParamConfig';

export class ClothController {
	public readonly materials: ClothMaterialController;
	public readonly geometryInit: ClothGeometryInitController;
	private _persistedTextureAllocationsController: TextureAllocationsController | undefined;
	public readonly fbo: ClothFBOController;
	//
	public stepsCount = 40;
	public constraintInfluence = 0.1;
	public viscosity = 0.1;
	public spring = 1;

	constructor(public scene: PolyScene, private _node: ClothSolverSopNode, public clothObject: Mesh) {
		this._node.initCoreClothControllerFromPersistedConfig(this);
		this.materials = new ClothMaterialController(this);
		this.geometryInit = new ClothGeometryInitController(this.clothObject);
		this.fbo = new ClothFBOController(this);
	}
	dispose() {
		if (this._persistedTextureAllocationsController) {
			this._persistedTextureAllocationsController.dispose();
			this._persistedTextureAllocationsController = undefined;
		}
	}

	setPersistedTextureAllocationController(controller: TextureAllocationsController) {
		this._persistedTextureAllocationsController = controller;
	}
	integrationFragmentShader() {
		let fragmentShader: string | undefined;
		this._node.shadersByName().forEach((shader, shaderName) => {
			fragmentShader = shader;
		});
		return fragmentShader;
	}
	textureAllocationsController() {
		const node = this._node;
		return (
			node.assemblerController()?.assembler.textureAllocationsController() ||
			this._persistedTextureAllocationsController
		);
	}
	assignReadonlyTextures(material: ShaderMaterial, texturesByName: Record<string, Texture>) {
		const textureNames = Object.keys(texturesByName);
		for (const textureName of textureNames) {
			const texture = texturesByName[textureName];
			const uniformName = textureName;
			material.uniforms[uniformName] = {value: texture};
		}
	}
	addMaterialUniforms(material: ShaderMaterial) {
		const node = this._node;
		// const all_materials = [material]
		const assembler = node.assemblerController()?.assembler;
		if (assembler) {
			// for (let material of all_materials) {
			for (const param_config of assembler.param_configs()) {
				material.uniforms[param_config.uniformName()] = param_config.uniform();
			}
			// }
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
						// for (let material of all_materials) {
						material.uniforms[uniform_name] = uniform;
						// if (readonlyAllocations) {
						// 	this._assignReadonlyTextures(material, readonlyAllocations);
						// }
						// }
						if (param && uniform) {
							const callback = () => {
								// for (let material of all_materials) {
								GlParamConfig.callback(param, material.uniforms[uniform_name]);
								// }
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

	init(renderer: WebGLRenderer) {
		this.fbo.init(renderer);
		// this.onBeforeRender.init(this.clothObject);
	}

	update(config: ClothMaterialUniformConfigRef) {
		this.fbo.update(config);
	}

	private _selectedVertexIndex = -1;
	private _selectedVertexPosition = new Vector3();
	private _setSelectedVertexIndex(index: number | null) {
		if (index == null) {
			this._selectedVertexIndex = -1;
		} else {
			this._selectedVertexIndex = index;
		}
	}
	createConstraint(index: number) {
		this._setSelectedVertexIndex(index);
	}
	deleteConstraint() {
		this._setSelectedVertexIndex(null);
	}
	selectedVertexIndex() {
		return this._selectedVertexIndex;
	}
	setConstraintPosition(position: Vector3) {
		this._selectedVertexPosition.copy(position);
	}
	constraintPosition(target: Vector3) {
		target.copy(this._selectedVertexPosition);
	}
}
