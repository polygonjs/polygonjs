// /**
//  * Mirrors a tetrahedron along one of its faces.
//  *
//  *
//  */
// import {TetSopNode} from './_BaseTet';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {TetObject} from '../../../core/geometry/modules/tet/TetObject';
// import {CoreString} from '../../../core/String';
// import {tetMirrorOnPlane} from '../../../core/geometry/modules/tet/utils/tetMirror';
// import {tetNeighbour} from '../../../core/geometry/modules/tet/utils/tetNeighboursHelper';

// class TetMirrorSopParamsConfig extends NodeParamsConfig {
// 	/** @param group */
// 	group = ParamConfig.STRING('');
// 	/** @param mirror face 0 */
// 	face0 = ParamConfig.BOOLEAN(0);
// 	/** @param mirror face 1 */
// 	face1 = ParamConfig.BOOLEAN(0);
// 	/** @param mirror face 2 */
// 	face2 = ParamConfig.BOOLEAN(0);
// 	/** @param mirror face 3 */
// 	face3 = ParamConfig.BOOLEAN(0);
// 	/** @param scale */
// 	scale = ParamConfig.FLOAT(1, {
// 		range: [0, 2],
// 		rangeLocked: [false, false],
// 	});
// }
// const ParamsConfig = new TetMirrorSopParamsConfig();

// export class TetMirrorSopNode extends TetSopNode<TetMirrorSopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.TET_MIRROR;
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override cook(inputCoreGroups: CoreGroup[]) {
// 		const tetObjects = inputCoreGroups[0].tetObjects();
// 		if (tetObjects) {
// 			for (let tetObject of tetObjects) {
// 				this._mirrorTets(tetObject);
// 			}
// 			this.setObjects(tetObjects);
// 		} else {
// 			this.setObjects([]);
// 		}
// 	}
// 	_mirrorTets(tetObject: TetObject) {
// 		const tetGeometry = tetObject.tetGeometry();
// 		const {face0, face1, face2, face3, scale} = this.pv;
// 		// const tetrahedrons = tetGeometry.tetrahedrons;
// 		const tetsCount = tetGeometry.tetsCount();

// 		const group = this.pv.group.trim();
// 		const indices = group.length ? CoreString.indices(group) : null;

// 		const processTet = (i: number) => {
// 			if (face0 && tetNeighbour(tetGeometry, i, 0) == null) {
// 				tetMirrorOnPlane(tetGeometry, i, 0, scale);
// 			}
// 			if (face1 && tetNeighbour(tetGeometry, i, 1) == null) {
// 				tetMirrorOnPlane(tetGeometry, i, 1, scale);
// 			}
// 			if (face2 && tetNeighbour(tetGeometry, i, 2) == null) {
// 				tetMirrorOnPlane(tetGeometry, i, 2, scale);
// 			}
// 			if (face3 && tetNeighbour(tetGeometry, i, 3) == null) {
// 				tetMirrorOnPlane(tetGeometry, i, 3, scale);
// 			}
// 		};

// 		if (indices) {
// 			for (let i of indices) {
// 				processTet(i);
// 			}
// 		} else {
// 			for (let i = 0; i < tetsCount; i++) {
// 				processTet(i);
// 			}
// 		}
// 	}
// }
