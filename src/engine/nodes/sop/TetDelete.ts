/**
 * filters tetrahedrons based on their quality
 *
 *
 */

import {TetSopNode} from './_BaseTet';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {TetObject} from '../../../core/geometry/tet/TetObject';
import {CoreString} from '../../../core/String';
import {isBooleanTrue} from '../../../core/Type';
import {Vector3, Mesh} from 'three';
import {tetCenter} from '../../../core/geometry/tet/utils/tetCenter';
import {isPositionInsideMesh} from '../../../core/geometry/tet/utils/tetInsideMesh';
import {MeshWithBVHGeometry, ThreeMeshBVHHelper} from '../../../core/geometry/bvh/ThreeMeshBVHHelper';
import {findNonDelaunayTetsFromMultiplePointsCheck} from '../../../core/geometry/tet/utils/findNonDelaunayTets';
import {tetRemoveUnusedPoints} from '../../../core/geometry/tet/utils/tetRemoveUnusedPoints';
import {tetQuality} from '../../../core/geometry/tet/utils/tetQuality';

const _tetCenter = new Vector3();

class TetDeleteSopParamsConfig extends NodeParamsConfig {
	byQuality = ParamConfig.BOOLEAN(0);
	minQuality = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
		visibleIf: {byQuality: 1},
	});
	byIds = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	ids = ParamConfig.STRING('0', {
		visibleIf: {byIds: 1},
	});
	byIndex = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	index = ParamConfig.INTEGER(-1, {
		range: [-1, 100],
		rangeLocked: [true, false],
		visibleIf: {byIndex: 1},
	});
	byIndexRange = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	indexRangeStart = ParamConfig.INTEGER(0, {
		range: [0, 2000],
		rangeLocked: [true, false],
		visibleIf: {byIndexRange: 1},
	});
	indexRangeEnd = ParamConfig.INTEGER(2000, {
		range: [0, 2000],
		rangeLocked: [true, false],
		visibleIf: {byIndexRange: 1},
	});
	byDelaunay = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	byBoundingObject = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	invert = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
}
const ParamsConfig = new TetDeleteSopParamsConfig();

export class TetDeleteSopNode extends TetSopNode<TetDeleteSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TET_DELETE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1, 2);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const tetObjects = inputCoreGroups[0].tetObjects();
		if (tetObjects) {
			for (let tetObject of tetObjects) {
				this._deleteTets(tetObject, inputCoreGroups);
			}
			this.setObjects(tetObjects);
		} else {
			this.setObjects([]);
		}
	}
	_deleteTets(tetObject: TetObject, inputCoreGroups: CoreGroup[]) {
		const selectedIds: number[] = [];
		if (isBooleanTrue(this.pv.byQuality)) {
			this._findTetsByQuality(tetObject, selectedIds);
		}
		if (isBooleanTrue(this.pv.byIds)) {
			this._findTetsById(selectedIds);
		}
		if (isBooleanTrue(this.pv.byIndex)) {
			this._findTetsByIndex(tetObject, selectedIds);
		}
		if (isBooleanTrue(this.pv.byIndexRange)) {
			this._findTetsByIndexRange(tetObject, selectedIds);
		}
		if (isBooleanTrue(this.pv.byDelaunay)) {
			this._findTetsByDelaunay(tetObject, selectedIds);
		}
		if (isBooleanTrue(this.pv.byBoundingObject)) {
			const boundingObject = inputCoreGroups[1]?.threejsObjectsWithGeo()[0] as Mesh | null;
			if (boundingObject) {
				this._findTetsByBoundingObject(tetObject, boundingObject, selectedIds);
			}
		}

		// invert
		if (isBooleanTrue(this.pv.invert)) {
			const nonSelectedIds: number[] = [];
			const selectedIdsSet = new Set(selectedIds);
			tetObject.geometry.tetrahedrons.forEach((_, tetId) => {
				if (!selectedIdsSet.has(tetId)) {
					nonSelectedIds.push(tetId);
				}
			});
			tetObject.geometry.removeTets(nonSelectedIds);
		} else {
			tetObject.geometry.removeTets(selectedIds);
		}
		tetRemoveUnusedPoints(tetObject.geometry);
	}
	private _findTetsByQuality(tetObject: TetObject, selectedIds: number[]) {
		tetObject.geometry.tetrahedrons.forEach((_, tetId) => {
			if (tetQuality(tetObject.geometry, tetId) < this.pv.minQuality) {
				selectedIds.push(tetId);
			}
		});
	}
	private _findTetsById(selectedIds: number[]) {
		const ids = CoreString.indices(this.pv.ids);
		selectedIds.push(...ids);
	}
	private _findTetsByIndex(tetObject: TetObject, selectedIds: number[]) {
		const index = this.pv.index;
		if (index == -1) {
			const lastId = tetObject.geometry.lastAddedTetId();
			if (lastId != null) {
				selectedIds.push(lastId);
			}
		} else {
			let i = 0;
			tetObject.geometry.tetrahedrons.forEach((_, tetId) => {
				if (i == index) {
					selectedIds.push(tetId);
				}
				i++;
			});
		}
	}
	private _findTetsByIndexRange(tetObject: TetObject, selectedIds: number[]) {
		const min = this.pv.indexRangeStart;
		const max = this.pv.indexRangeEnd;
		let i = 0;
		tetObject.geometry.tetrahedrons.forEach((_, tetId) => {
			if (i >= min && i <= max) {
				selectedIds.push(tetId);
			}
			i++;
		});
	}
	private _findTetsByDelaunay(tetObject: TetObject, selectedIds: number[]) {
		const invalidTets: number[] = [];
		findNonDelaunayTetsFromMultiplePointsCheck(tetObject.geometry, invalidTets);
		selectedIds.push(...invalidTets);
	}
	private _findTetsByBoundingObject(
		tetObject: TetObject,
		boundingObject: Object3DWithGeometry,
		selectedIds: number[]
	) {
		ThreeMeshBVHHelper.assignDefaultBVHIfNone(boundingObject as Mesh);

		const tetGeometry = tetObject.geometry;
		tetGeometry.tetrahedrons.forEach((_, tetId) => {
			tetCenter(tetGeometry, tetId, _tetCenter);
			const isInside = isPositionInsideMesh(_tetCenter, boundingObject as MeshWithBVHGeometry, 0.001);
			if (isInside) {
				selectedIds.push(tetId);
			}
		});
	}
}
