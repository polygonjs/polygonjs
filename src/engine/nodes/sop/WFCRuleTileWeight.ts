/**
 * sets weights for tiles
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {stringMatchMask} from '../../../core/String';

class WFCRuleTileWeightSopParamsConfig extends NodeParamsConfig {
	/** @param tile id */
	tileId = ParamConfig.STRING('*');
	/** @param weight */
	weight = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new WFCRuleTileWeightSopParamsConfig();

export class WFCRuleTileWeightSopNode extends TypedSopNode<WFCRuleTileWeightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_RULE_TILE_WEIGHT;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.NEVER]);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const inputObjects = coreGroup0.threejsObjects();

		const {tileId, weight} = this.pv;
		const tileObjects = inputObjects.filter((tileObject) =>
			stringMatchMask(CoreWFCTileAttribute.getTileId(tileObject), tileId)
		);
		for (const tileObject of tileObjects) {
			CoreWFCTileAttribute.setWeight(tileObject, weight);
		}

		this.setObjects(inputObjects);
	}
}
