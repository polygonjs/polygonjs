/**
 * solves a WFC
 *
 *
 */
import {TypedSopNode} from './_Base';
import {Object3D} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {WFCSolver} from '../../../core/wfc/WFCSolver';
import {WFCTilesCollection} from '../../../core/wfc/WFCTilesCollection';
import {WFCGrid} from '../../../core/wfc/WFCGrid';

class WFCSolverSopParamsConfig extends NodeParamsConfig {
	/** @param iterations */
	iterations = ParamConfig.INTEGER(1, {
		range: [1, 1000],
		rangeLocked: [true, false],
	});
	/** @param seed */
	seed = ParamConfig.INTEGER(0, {
		range: [-100, 100],
		rangeLocked: [false, false],
	});
	/** @param tileHeight */
	tileHeight = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new WFCSolverSopParamsConfig();

export class WFCSolverSopNode extends TypedSopNode<WFCSolverSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_SOLVER;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const quadObjects = coreGroup0.quadObjects();

		const {iterations, seed, tileHeight} = this.pv;
		const newObjects: Object3D[] = [];
		if (quadObjects && quadObjects.length > 0) {
			const tileObjects = coreGroup1.threejsObjects();

			const collection = new WFCTilesCollection(tileObjects);
			for (let quadObject of quadObjects) {
				const grid = new WFCGrid(quadObject);
				const solver = new WFCSolver(grid, collection, tileHeight);
				for (let i = 0; i < iterations; i++) {
					solver.step(seed + i);
				}
				newObjects.push(...solver.objects());
			}
		} else {
			this.states.error.set('no quad objects found');
		}

		this.setObjects(newObjects);
	}
}
