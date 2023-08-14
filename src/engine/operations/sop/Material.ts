import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {BaseBuilderMatNodeType} from '../../../engine/nodes/mat/_BaseBuilder';
import {applyRenderHook, applyCustomMaterials, cloneMaterial} from '../../../core/geometry/Material';
import {Group, Material, Object3D, Mesh, Texture, ShaderMaterial} from 'three';
import {GlobalsGeometryHandler} from '../../../engine/nodes/gl/code/globals/Geometry';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreMask} from '../../../core/geometry/Mask';
import {BaseMatNodeType} from '../../nodes/mat/_Base';
import {MaterialSopNode} from '../../nodes/sop/Material';

interface MaterialSopParams extends DefaultOperationParams {
	group: string;
	assignMat: boolean;
	material: TypedNodePathParamValue;
	cloneMat: boolean;
	shareCustomUniforms: boolean;
	swapCurrentTex: boolean;
	texSrc0: string;
	texDest0: string;
}
// type TraverseCallback = (coreObject: CoreObject) => void;
let _nextId = 0;
export class MaterialSopOperation extends BaseSopOperation {
	private _materialSopOperationId = _nextId++;
	static override readonly DEFAULT_PARAMS: MaterialSopParams = {
		group: '',
		assignMat: true,
		material: new TypedNodePathParamValue(''),
		cloneMat: false,
		shareCustomUniforms: true,
		swapCurrentTex: false,
		texSrc0: 'emissiveMap',
		texDest0: 'map',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'material'> {
		return 'material';
	}

	private _globalsHandler: GlobalsGeometryHandler = new GlobalsGeometryHandler();

	override async cook(inputCoreGroups: CoreGroup[], params: MaterialSopParams) {
		const coreGroup = inputCoreGroups[0];

		this._oldMatByOldNewId.clear();
		await this._applyMaterials(coreGroup, params);
		this._swapTextures(coreGroup, params);
		return coreGroup;
	}

	private async _getMaterial(params: MaterialSopParams) {
		const materialNode = params.material.nodeWithContext(NodeContext.MAT, this.states?.error);
		if (materialNode) {
			this._watchMaterialNode(materialNode);
			const material = await materialNode.material();
			const baseBuilderMatNode = materialNode as BaseBuilderMatNodeType;
			if (baseBuilderMatNode.assemblerController) {
				baseBuilderMatNode.assemblerController()?.setAssemblerGlobalsHandler(this._globalsHandler);
			}

			if (!material) {
				this.states?.error.set(`material invalid. (error: '${materialNode.states.error.message()}')`);
			}

			return material;
		} else {
			this.states?.error.set(`no material node found`);
		}
	}
	private _watchedMaterialNode: BaseMatNodeType | undefined;
	private _watchedMaterialNodeMaterial: Material | undefined;
	private _watchMaterialNode(materialNode: BaseMatNodeType) {
		if (this._watchedMaterialNode == materialNode) {
			return;
		}
		const hookName = this._watchHookName();
		materialNode.addPostDirtyHook(hookName, this._onMaterialUpdateBound);
		materialNode.cookController.registerOnCookEnd(hookName, this._onMaterialUpdateBound);
		if (this._watchedMaterialNode) {
			this._watchedMaterialNode.removePostDirtyHook(hookName);
			this._watchedMaterialNode.cookController.deregisterOnCookEnd(hookName);
		}
		this._watchedMaterialNode = materialNode;
	}
	private _onMaterialUpdateBound = this._onMaterialUpdate.bind(this);
	private async _onMaterialUpdate() {
		if (!this._watchedMaterialNode) {
			return;
		}
		const container = await this._watchedMaterialNode.compute();
		const material = container.material();
		if (material != this._watchedMaterialNodeMaterial) {
			this._watchedMaterialNodeMaterial = material;
			(this._node as MaterialSopNode).p.material.setDirty();
		}
	}
	private _watchHookName() {
		return `MaterialSopOperationId-${this._materialSopOperationId}`;
	}

	private async _applyMaterials(coreGroup: CoreGroup, params: MaterialSopParams) {
		if (!isBooleanTrue(params.assignMat)) {
			return;
		}

		const material = await this._getMaterial(params);
		if (!material) {
			return;
		}

		const selectedObjects = CoreMask.filterThreejsObjects(coreGroup, params);

		for (let selectedObject of selectedObjects) {
			this._applyMaterial(selectedObject, material, params);
		}

		return coreGroup;
	}

	private _oldMatByOldNewId: Map<string, Material> = new Map();
	private _materialByUuid: Map<string, Material> = new Map();
	private _swapTextures(coreGroup: CoreGroup, params: MaterialSopParams) {
		if (!isBooleanTrue(params.swapCurrentTex)) {
			return;
		}

		this._materialByUuid.clear();

		const objects = CoreMask.filterObjects(coreGroup, params, coreGroup.allCoreObjects());
		for (let object of objects) {
			const mat = (object as Mesh).material as Material;
			this._materialByUuid.set(mat.uuid, mat);
		}

		this._materialByUuid.forEach((mat, mat_uuid) => {
			this._swapTexture(mat, params);
		});
	}

	private _applyMaterial(object: Object3D, srcMaterial: Material, params: MaterialSopParams) {
		const usedMaterial = isBooleanTrue(params.cloneMat)
			? cloneMaterial(this.scene(), srcMaterial, {
					shareCustomUniforms: params.shareCustomUniforms,
					addCustomMaterials: true,
			  })
			: srcMaterial;

		if (srcMaterial instanceof ShaderMaterial && usedMaterial instanceof ShaderMaterial) {
			for (let uniform_name in srcMaterial.uniforms) {
				usedMaterial.uniforms[uniform_name] = srcMaterial.uniforms[uniform_name];
			}
		}

		if ((object as Group).isGroup) {
			// do not assign material to a group, as this could cause render errors
			return;
		}

		const object_with_material = object as Mesh;
		// const current_mat = object_with_material.material as Material | undefined;
		// if (current_mat && params.swapCurrentTex) {
		// 	this._swap_texture(used_material, current_mat, params);
		// }
		this._oldMatByOldNewId.set(usedMaterial.uuid, object_with_material.material as Material);
		object_with_material.material = usedMaterial;

		applyRenderHook(object, usedMaterial);
		applyCustomMaterials(object, usedMaterial);
	}

	private _swapTexture(target_mat: Material, params: MaterialSopParams) {
		if (params.texSrc0 == '' || params.texDest0 == '') {
			return;
		}
		let src_mat = this._oldMatByOldNewId.get(target_mat.uuid);
		src_mat = src_mat || target_mat;

		const src_tex: Texture | null = (src_mat as any)[params.texSrc0];
		if (src_tex) {
			// swap mat param
			(target_mat as any)[params.texDest0] = src_tex;
			// (src_mat as any)[params.texSrc0] = null;
			// swap uniforms
			const uniforms = (target_mat as any).uniforms;
			if (uniforms) {
				const uniforms_map = uniforms[params.texDest0];
				if (uniforms_map) {
					uniforms[params.texDest0] = {value: src_tex};
					// uniforms[params.texSrc0] = {value: null};
				}
			}
		}
	}
}
