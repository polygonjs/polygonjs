import {Material} from 'three';
import {isBooleanTrue} from '../../../../../core/Type';
import {FrontSide, BackSide, DoubleSide} from 'three';
import {CustomMaterialName, MaterialWithCustomMaterials} from '../../../../../core/geometry/Material';
import {BooleanParam} from '../../../../params/Boolean';

interface SideUpdateParamValues {
	doubleSided: boolean;
	front: boolean;
}
interface SideUpdateParams {
	doubleSided: BooleanParam;
	front: BooleanParam;
}

interface SideWithShadowUpdateParamValues extends SideUpdateParamValues {
	overrideShadowSide: boolean;
	shadowDoubleSided: boolean;
	shadowFront: boolean;
}
interface SideWithShadowUpdateParams extends SideUpdateParams {
	overrideShadowSide: BooleanParam;
	shadowDoubleSided: BooleanParam;
	shadowFront: BooleanParam;
}
export function updateMaterialSide(mat: Material, params: SideUpdateParamValues) {
	// normal render
	const singleSide = isBooleanTrue(params.front) ? FrontSide : BackSide;
	const newSide = isBooleanTrue(params.doubleSided) ? DoubleSide : singleSide;
	if (newSide != mat.side) {
		mat.side = newSide;
		mat.forceSinglePass = !isBooleanTrue(params.doubleSided);
		mat.needsUpdate = true;
	}
}
function updateNodeSide(mat: Material, params: SideUpdateParams) {
	switch (mat.side) {
		case FrontSide: {
			params.doubleSided.set(false);
			params.front.set(true);
			return;
		}
		case BackSide: {
			params.doubleSided.set(false);
			params.front.set(false);
			return;
		}
		case DoubleSide: {
			params.doubleSided.set(true);
			params.front.set(true);
			return;
		}
	}
}

export function updateMaterialSideWithShadow(mat: Material, params: SideWithShadowUpdateParamValues) {
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
		for (const customName of customNames) {
			const customMaterial = customMaterials[customName];
			if (customMaterial) {
				updateMaterialSideWithShadow(customMaterial, params);
			}
		}
	}
}
export function updateNodeSideWithShadow(mat: Material, params: SideWithShadowUpdateParams) {
	// normal render
	updateNodeSide(mat, params);
	// shadow render
	if (mat.shadowSide != null) {
		params.overrideShadowSide.set(true);
		switch (mat.shadowSide) {
			case FrontSide: {
				params.shadowDoubleSided.set(false);
				params.shadowFront.set(true);
				return;
			}
			case BackSide: {
				params.shadowDoubleSided.set(false);
				params.shadowFront.set(false);
				return;
			}
			case DoubleSide: {
				params.shadowDoubleSided.set(true);
				params.shadowFront.set(true);
				return;
			}
		}
	}

	const customMaterials = (mat as MaterialWithCustomMaterials).customMaterials;
	if (customMaterials) {
		const customNames: CustomMaterialName[] = Object.keys(customMaterials) as CustomMaterialName[];
		for (const customName of customNames) {
			const customMaterial = customMaterials[customName];
			if (customMaterial) {
				updateNodeSideWithShadow(customMaterial, params);
			}
		}
	}
}
