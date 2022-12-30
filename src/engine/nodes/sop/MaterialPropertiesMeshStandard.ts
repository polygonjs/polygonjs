// /**
//  * Allows to edit properties of meshstandard materials, which are generally present when importing assets such as GLTF files.
//  *
//  * @remarks
//  *
//  * Note that if the input node use a material created via a [MAT node](/docs/nodes/mat), and not when loading the geometry via a [File SOP](/docs/nodes/sop/file), it's important to keep in mind that materials are shared.
//  * Therefore any other object also using those material will be affected.
//  *
//  */
// import {TypedSopNode} from './_Base';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {MaterialPropertiesMeshStandardSopOperation} from '../../operations/sop/MaterialPropertiesMeshStandard';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {EnvMapParamConfig, TextureEnvMapControllerSop} from '../mat/utils/TextureEnvMapController';
// import {
// 	MetalnessRoughnessMapParamConfig,
// 	TextureMetalnessRoughnessMapControllerSop,
// } from '../mat/utils/TextureMetalnessRoughnessMapController';
// import {CoreMask} from '../../../core/geometry/Mask';
// import {Material, Mesh} from 'three';
// import {CoreType} from '../../../core/Type';
// import {Constructor} from '../../../types/GlobalTypes';
// const DEFAULT = MaterialPropertiesMeshStandardSopOperation.DEFAULT_PARAMS;

// export function OverrideMetalnessRoughnessParamConfig<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		/** @param override metalness/roughness */
// 		updateMetalnessRoughness = ParamConfig.BOOLEAN(false, {separatorBefore: true});
// 	};
// }

// export function FilterParamConfig<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		/** @param group to assign the material to */
// 		group = ParamConfig.STRING(DEFAULT.group, {
// 			objectMask: true,
// 		});
// 		/** @param sets if this node should search through the materials inside the whole hierarchy */
// 		applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren);
// 	};
// }

// class MaterialPropertiesSopParamsConfig extends MetalnessRoughnessMapParamConfig(
// 	OverrideMetalnessRoughnessParamConfig(EnvMapParamConfig(FilterParamConfig(NodeParamsConfig)))
// ) {}
// const ParamsConfig = new MaterialPropertiesSopParamsConfig();

// export class MaterialPropertiesMeshStandardSopNode extends TypedSopNode<MaterialPropertiesSopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'materialPropertiesMeshStandard';
// 	}

// 	static override displayedInputNames(): string[] {
// 		return ['objects with MeshStandardMaterials to change properties of'];
// 	}

// 	override initializeNode() {
// 		this.io.inputs.setCount(1);
// 		this.io.inputs.initInputsClonedState(MaterialPropertiesMeshStandardSopOperation.INPUT_CLONED_STATE);
// 	}
// 	private controllers = {
// 		envMap: new TextureEnvMapControllerSop(this),
// 		metalnessRoughness: new TextureMetalnessRoughnessMapControllerSop(this),
// 	};
// 	private controllersList = Object.values(this.controllers);

// 	override async cook(inputCoreGroups: CoreGroup[]) {
// 		const coreGroup = inputCoreGroups[0];
// 		const selectedObjects = CoreMask.filterObjects(coreGroup, this.pv);

// 		for (let selectedObject of selectedObjects) {
// 			const material = (selectedObject as Mesh).material;
// 			if (CoreType.isArray(material)) {
// 				for (let mat of material) {
// 					this._updateMaterial(mat);
// 				}
// 			} else {
// 				this._updateMaterial(material);
// 			}
// 		}
// 		this.setCoreGroup(coreGroup);
// 	}
// 	private _updateMaterial(material?: Material) {
// 		for (const controller of this.controllersList) {
// 			controller.updateMaterial(material);
// 		}
// 	}
// }
