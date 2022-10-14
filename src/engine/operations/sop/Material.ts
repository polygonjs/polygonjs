import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {BaseBuilderMatNodeType} from '../../../engine/nodes/mat/_BaseBuilder';
import {CoreMaterial} from '../../../core/geometry/Material';
import {Group, Material} from 'three';
import {Mesh} from 'three';
import {Texture} from 'three';
import {GlobalsGeometryHandler} from '../../../engine/nodes/gl/code/globals/Geometry';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {ShaderMaterial} from 'three';
import {CoreObject} from '../../../core/geometry/Object';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface MaterialSopParams extends DefaultOperationParams {
	group: string;
	assignMat: boolean;
	material: TypedNodePathParamValue;
	applyToChildren: boolean;
	cloneMat: boolean;
	shareCustomUniforms: boolean;
	swapCurrentTex: boolean;
	texSrc0: string;
	texDest0: string;
}
type TraverseCallback = (coreObject: CoreObject) => void;
export class MaterialSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: MaterialSopParams = {
		group: '',
		assignMat: true,
		material: new TypedNodePathParamValue(''),
		applyToChildren: true,
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

		this._old_mat_by_old_new_id.clear();

		await this._applyMaterials(coreGroup, params);
		this._swapTextures(coreGroup, params);
		return coreGroup;
	}

	private async _applyMaterials(coreGroup: CoreGroup, params: MaterialSopParams) {
		if (!isBooleanTrue(params.assignMat)) {
			return;
		}

		const materialNode = params.material.nodeWithContext(NodeContext.MAT, this.states?.error);
		if (materialNode) {
			const material = materialNode.material;
			const baseBuilderMatNode = materialNode as BaseBuilderMatNodeType;
			if (baseBuilderMatNode.assemblerController) {
				baseBuilderMatNode.assemblerController()?.setAssemblerGlobalsHandler(this._globalsHandler);
			}

			await materialNode.compute();
			if (material) {
				const coreObjects = coreGroup.coreObjectsFromGroup(params.group);
				for (let coreObject of coreObjects) {
					if (params.group == '' || CoreObject.isInGroup(params.group, coreObject)) {
						this._applyMaterial(coreObject, material, params);
					}
				}

				if (isBooleanTrue(params.applyToChildren)) {
					// if we apply to children, the group will be tested inside _apply_material
					function _traverseCoreObject(
						coreObject: CoreObject,
						callback: TraverseCallback,
						level: number = 0
					) {
						if (params.group == '' || CoreObject.isInGroup(params.group, coreObject)) {
							callback(coreObject);
						}
						const childCoreObjects = coreObject
							.object()
							.children.map((child, i) => new CoreObject(child, i));
						for (let childCoreObject of childCoreObjects) {
							_traverseCoreObject(childCoreObject, callback, level + 1);
						}
					}

					for (let coreObject of coreGroup.coreObjects()) {
						_traverseCoreObject(coreObject, (childCoreObject) => {
							this._applyMaterial(childCoreObject, material, params);
						});
					}
				}

				return coreGroup;
			} else {
				this.states?.error.set(`material invalid. (error: '${materialNode.states.error.message()}')`);
			}
		} else {
			this.states?.error.set(`no material node found`);
		}
	}

	private _old_mat_by_old_new_id: Map<string, Material> = new Map();
	private _materials_by_uuid: Map<string, Material> = new Map();
	private _swapTextures(core_group: CoreGroup, params: MaterialSopParams) {
		if (!isBooleanTrue(params.swapCurrentTex)) {
			return;
		}

		this._materials_by_uuid.clear();

		for (let object of core_group.objectsFromGroup(params.group)) {
			if (params.applyToChildren) {
				object.traverse((child) => {
					const mat = (object as Mesh).material as Material;
					this._materials_by_uuid.set(mat.uuid, mat);
				});
			} else {
				const mat = (object as Mesh).material as Material;
				this._materials_by_uuid.set(mat.uuid, mat);
			}
		}

		this._materials_by_uuid.forEach((mat, mat_uuid) => {
			this._swapTexture(mat, params);
		});
	}

	private _applyMaterial(coreObject: CoreObject, srcMaterial: Material, params: MaterialSopParams) {
		const usedMaterial = isBooleanTrue(params.cloneMat)
			? CoreMaterial.clone(this.scene(), srcMaterial, {shareCustomUniforms: params.shareCustomUniforms})
			: srcMaterial;

		if (srcMaterial instanceof ShaderMaterial && usedMaterial instanceof ShaderMaterial) {
			for (let uniform_name in srcMaterial.uniforms) {
				usedMaterial.uniforms[uniform_name] = srcMaterial.uniforms[uniform_name];
			}
		}

		const object = coreObject.object();
		if ((object as Group).isGroup) {
			// do not assign material to a group, as this could cause render errors
			return;
		}

		const object_with_material = object as Mesh;
		// const current_mat = object_with_material.material as Material | undefined;
		// if (current_mat && params.swapCurrentTex) {
		// 	this._swap_texture(used_material, current_mat, params);
		// }
		this._old_mat_by_old_new_id.set(usedMaterial.uuid, object_with_material.material as Material);
		object_with_material.material = usedMaterial;

		CoreMaterial.applyRenderHook(object, usedMaterial);
		CoreMaterial.applyCustomMaterials(object, usedMaterial);
	}

	private _swapTexture(target_mat: Material, params: MaterialSopParams) {
		if (params.texSrc0 == '' || params.texDest0 == '') {
			return;
		}
		let src_mat = this._old_mat_by_old_new_id.get(target_mat.uuid);
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
