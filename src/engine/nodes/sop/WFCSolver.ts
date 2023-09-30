/**
 * solves a WFC
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {WFCSolver} from '../../../core/wfc/WFCSolver';
import {filterTileObjects, filterRuleObjects} from '../../../core/wfc/WFCUtils';

class WFCSolverSopParamsConfig extends NodeParamsConfig {
	/** @param iterations */
	stepsCount = ParamConfig.INTEGER(-1, {
		range: [-1, 1000],
		rangeLocked: [true, false],
	});
	/** @param max resolved quads */
	maxCount = ParamConfig.INTEGER(-1, {
		range: [-1, 1000],
		rangeLocked: [true, false],
		separatorAfter: true,
	});
	/** @param quadSeed */
	quadSeed = ParamConfig.INTEGER(0, {
		range: [-100, 100],
		rangeLocked: [false, false],
	});
	/** @param configSeed */
	configSeed = ParamConfig.INTEGER(0, {
		range: [-100, 100],
		rangeLocked: [false, false],
	});
	// /** @param tileHeight */
	// tileHeight = ParamConfig.FLOAT(1, {
	// 	range: [0, 2],
	// 	rangeLocked: [true, false],
	// });
}
const ParamsConfig = new WFCSolverSopParamsConfig();

export class WFCSolverSopNode extends TypedSopNode<WFCSolverSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_SOLVER;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const quadObjects = coreGroup0.quadObjects();

		if (!quadObjects || quadObjects.length == 0) {
			this.states.error.set('no quad objects found');
			return;
		}
		const tileAndRuleObjects = coreGroup1.threejsObjects();
		const tileObjects = filterTileObjects(tileAndRuleObjects);
		const ruleObjects = filterRuleObjects(tileAndRuleObjects);
		if (tileObjects.length == 0) {
			this.states.error.set('no tile objects found');
			return;
		}
		if (ruleObjects.length == 0) {
			this.states.error.set('no rule objects found');
			return;
		}

		const {maxCount} = this.pv;
		// const newObjects: Object3D[] = [];

		for (const quadObject of quadObjects) {
			const solver = new WFCSolver({
				tileAndRuleObjects,
				quadObject,
				// height: tileHeight,
				maxResolvedQuadsCount: maxCount,
			});
			solver.process(this.pv);
			// newObjects.push(...solver.objects());
		}

		this.setObjects(quadObjects);
	}
}
