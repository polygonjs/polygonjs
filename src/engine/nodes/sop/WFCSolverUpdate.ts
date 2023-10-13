/**
 * solves a WFC
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {getWFCSolver} from '../../../core/wfc/WFCRegister';
import {NeighbourIndex} from '../../../core/geometry/modules/quad/graph/QuadGraphCommon';

class WFCSolverUpdateSopParamsConfig extends NodeParamsConfig {
	/** @param quadId */
	quadId = ParamConfig.INTEGER(0, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param tileId */
	tileId = ParamConfig.STRING('tile_straight');
	/** @param rotation */
	rotation = ParamConfig.INTEGER(1, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
	/** @param iterations */
	stepsCount = ParamConfig.INTEGER(-1, {
		range: [-1, 1000],
		rangeLocked: [true, false],
	});
	/** @param max resolved quads */
	// maxCount = ParamConfig.INTEGER(-1, {
	// 	range: [-1, 1000],
	// 	rangeLocked: [true, false],
	// 	separatorAfter: true,
	// });
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
}
const ParamsConfig = new WFCSolverUpdateSopParamsConfig();

export class WFCSolverUpdateSopNode extends TypedSopNode<WFCSolverUpdateSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'WFCSolverUpdate';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE]);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const quadObjects = coreGroup0.quadObjects();

		if (!quadObjects || quadObjects.length == 0) {
			this.states.error.set('no quad objects found');
			return;
		}

		for (const quadObject of quadObjects) {
			const solver = getWFCSolver(quadObject);
			if (!solver) {
				this.states.error.set('no solver found');
				return;
			}
			solver.addSoftContraint({
				object: quadObject,
				floorId: 0,
				quadId: this.pv.quadId,
				tileId: this.pv.tileId,
				rotation: this.pv.rotation as NeighbourIndex,
				stepsCount: this.pv.stepsCount,
				quadSeed: this.pv.quadSeed,
				configSeed: this.pv.configSeed,
			});
		}

		this.setObjects(quadObjects);
	}
}
