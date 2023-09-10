// /**
//  * filters tetrahedrons based on their quality
//  *
//  *
//  */

// import {TetSopNode} from './_BaseTet';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {TetObject} from '../../../core/geometry/modules/tet/TetObject';
// import {tetQuality} from '../../../core/geometry/modules/tet/utils/tetQuality';
// import {tetRemoveUnusedPoints} from '../../../core/geometry/modules/tet/utils/tetRemoveUnusedPoints';
// class TetQualitySopParamsConfig extends NodeParamsConfig {
// 	minQuality = ParamConfig.FLOAT(0.1, {
// 		range: [0, 1],
// 		rangeLocked: [true, true],
// 	});
// 	invert = ParamConfig.BOOLEAN(0);
// }
// const ParamsConfig = new TetQualitySopParamsConfig();

// export class TetQualitySopNode extends TetSopNode<TetQualitySopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.TET_QUALITY;
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CoreGroup[]) {
// 		const tetObjects = inputCoreGroups[0].tetObjects();
// 		if (tetObjects) {
// 			for (let tetObject of tetObjects) {
// 				this._filterTets(tetObject);
// 			}
// 			this.setObjects(tetObjects);
// 		} else {
// 			this.setObjects([]);
// 		}
// 	}
// 	_filterTets(tetObject: TetObject) {
// 		const {invert, minQuality} = this.pv;
// 		const geometry = tetObject.geometry;
// 		const {tetrahedrons, points} = geometry;
// 		const badQualityIds: number[] = [];
// 		tetrahedrons.forEach((tet, i) => {
// 			const pt0 = points.get(tet.pointIds[0]);
// 			const pt1 = points.get(tet.pointIds[1]);
// 			const pt2 = points.get(tet.pointIds[2]);
// 			const pt3 = points.get(tet.pointIds[3]);
// 			if (!(pt0 && pt1 && pt2 && pt3)) {
// 				return;
// 			}
// 			const quality = tetQuality(pt0.position, pt1.position, pt2.position, pt3.position);
// 			if (invert) {
// 				if (quality >= minQuality) {
// 					badQualityIds.push(tet.id);
// 				}
// 			} else {
// 				if (quality < minQuality) {
// 					badQualityIds.push(tet.id);
// 				}
// 			}
// 		});
// 		geometry.removeTets(badQualityIds);
// 		tetRemoveUnusedPoints(geometry);
// 	}
// }
