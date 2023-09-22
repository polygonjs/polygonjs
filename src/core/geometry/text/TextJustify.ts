import {Box3, BufferGeometry} from 'three';
import {TypeAssert} from '../../../engine/poly/Assert';

export enum TextSopJustifiyMode {
	LEFT = 'left',
	RIGHT = 'right',
	CENTER = 'center',
}
export const TEXT_SOP_JUSTIFY_MODES: Array<TextSopJustifiyMode> = [
	TextSopJustifiyMode.LEFT,
	TextSopJustifiyMode.RIGHT,
	TextSopJustifiyMode.CENTER,
];

export interface TextJustifiyParams {
	justifyMode: TextSopJustifiyMode;
}

export function applyJustifyModeToGeometries(
	geometries: Array<BufferGeometry | undefined>,
	params: TextJustifiyParams
) {
	if (geometries.length == 0) {
		return;
	}
	// let minX = 1;
	// let maxX = -1;
	// for (let geometry of geometries) {
	// 	geometry.computeBoundingBox();
	// 	const bbox = geometry.boundingBox;
	// 	if (bbox) {
	// 		minX = Math.min(minX, bbox.min.x);
	// 		maxX = Math.max(maxX, bbox.max.x);
	// 	}
	// }
	let totalBoundingBox: Box3 | null = null;
	for (const geometry of geometries) {
		if (!geometry) continue;
		geometry.computeBoundingBox();
		if (geometry.boundingBox) {
			if (totalBoundingBox == null) {
				totalBoundingBox = geometry.boundingBox;
			} else {
				totalBoundingBox.union(geometry.boundingBox);
			}
		}
	}
	if (!totalBoundingBox) {
		return;
	}

	const justifyMode = params.justifyMode;
	// for (let geometry of geometries) {
	applyJustifyModeToGeometry(geometries, justifyMode, totalBoundingBox);
	// }
}

function applyJustifyModeToGeometry(
	geometries: Array<BufferGeometry | undefined>,
	justifyMode: TextSopJustifiyMode,
	totalBoundingBox: Box3
) {
	switch (justifyMode) {
		case TextSopJustifiyMode.LEFT: {
			// do nothing
			return;
		}
		case TextSopJustifiyMode.CENTER: {
			const currentCenter = 0.5 * (totalBoundingBox.min.x + totalBoundingBox.max.x);
			for (const geometry of geometries) {
				geometry?.translate(-currentCenter, 0, 0);
			}
			return;
		}
		case TextSopJustifiyMode.RIGHT: {
			const currentRight = totalBoundingBox.max.x;
			for (const geometry of geometries) {
				geometry?.translate(-currentRight, 0, 0);
			}
			return;
		}
	}
	TypeAssert.unreachable(justifyMode);
}
