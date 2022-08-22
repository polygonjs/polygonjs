import {Material} from 'three';
import {isBooleanTrue} from '../../../../../core/Type';
import {FrontSide, BackSide, DoubleSide} from 'three';
import {MaterialWithCustomMaterials} from '../../../../../core/geometry/Material';
import {CustomMaterialName} from '../../../gl/code/assemblers/materials/_BaseMaterial';

interface SideUpdateParams {
	doubleSided: boolean;
	front: boolean;
}

interface SideWithShadowUpdateParams extends SideUpdateParams {
	overrideShadowSide: boolean;
	shadowDoubleSided: boolean;
	shadowFront: boolean;
}
export function updateMaterialSide(mat: Material, params: SideUpdateParams) {
	// normal render
	const singleSide = isBooleanTrue(params.front) ? FrontSide : BackSide;
	const newSide = isBooleanTrue(params.doubleSided) ? DoubleSide : singleSide;
	if (newSide != mat.side) {
		mat.side = newSide;
		mat.needsUpdate = true;
	}
}

export function updateMaterialSideWithShadow(mat: Material, params: SideWithShadowUpdateParams) {
	// normal render
	updateMaterialSide(mat, params);
	// shadow render
	if (isBooleanTrue(params.overrideShadowSide)) {
		const singleSide = isBooleanTrue(params.shadowFront) ? FrontSide : BackSide;
		const newSide = isBooleanTrue(params.shadowDoubleSided) ? DoubleSide : singleSide;
		if (newSide != mat.shadowSide) {
			mat.shadowSide = newSide;
			mat.needsUpdate = true;
		}
	} else {
		/* TODO: update types */
		(mat as any).shadowSide = null;
	}

	const customMaterials = (mat as MaterialWithCustomMaterials).customMaterials;
	if (customMaterials) {
		const customNames: CustomMaterialName[] = Object.keys(customMaterials) as CustomMaterialName[];
		for (let customName of customNames) {
			const customMaterial = customMaterials[customName];
			if (customMaterial) {
				updateMaterialSideWithShadow(customMaterial, params);
			}
		}
	}
}
