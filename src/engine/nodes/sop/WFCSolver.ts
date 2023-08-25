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
import {filterTileObjects, filterConnectionObjects} from '../../../core/wfc/WFCUtils';
import {logBlueBg} from '../../../core/logger/Console';

class WFCSolverSopParamsConfig extends NodeParamsConfig {
	/** @param iterations */
	stepsCount = ParamConfig.INTEGER(1, {
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

		if (!quadObjects || quadObjects.length == 0) {
			this.states.error.set('no quad objects found');
			return;
		}
		const tileAndConnectionObjects = coreGroup1.threejsObjects();
		const tileObjects = filterTileObjects(tileAndConnectionObjects);
		const connectionObjects = filterConnectionObjects(tileAndConnectionObjects);
		if (tileObjects.length == 0) {
			this.states.error.set('no tile objects found');
			return;
		}
		if (connectionObjects.length == 0) {
			this.states.error.set('no connection objects found');
			return;
		}

		const {stepsCount, seed, tileHeight} = this.pv;
		const newObjects: Object3D[] = [];

		for (let quadObject of quadObjects) {
			logBlueBg('------------- SOLVE -------------');
			const solver = new WFCSolver(tileAndConnectionObjects, quadObject, tileHeight);
			for (let i = 0; i < stepsCount; i++) {
				solver.step(seed + i);
			}
			newObjects.push(...solver.objects());
		}

		this.setObjects(newObjects);
	}
}
