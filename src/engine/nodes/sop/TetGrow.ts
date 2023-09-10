// /**
//  * Grows tetrahedrons
//  *
//  *
//  */
// import {TetSopNode} from './_BaseTet';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {TetObject} from '../../../core/geometry/modules/tet/TetObject';

// class TetGrowSopParamsConfig extends NodeParamsConfig {
// 	/** @param iterations */
// 	iterations = ParamConfig.INTEGER(1, {
// 		range: [0, 10],
// 		rangeLocked: [true, false],
// 	});
// }
// const ParamsConfig = new TetGrowSopParamsConfig();

// export class TetGrowSopNode extends TetSopNode<TetGrowSopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.TET_GROW;
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override cook(inputCoreGroups: CoreGroup[]) {
// 		const tetObjects = inputCoreGroups[0].tetObjects();
// 		if (tetObjects) {
// 			for (let tetObject of tetObjects) {
// 				this._growTets(tetObject);
// 			}
// 			this.setObjects(tetObjects);
// 		} else {
// 			this.setObjects([]);
// 		}
// 	}
// 	_growTets(tetObject: TetObject) {
// 		// const {tetrahedrons} = tetObject.tetGeometry();
// 		// const tetsCount = tetrahedrons.length;
// 		// for (let i = tetsCount - 1; i >= 0; i--) {}
// 	}
// }
