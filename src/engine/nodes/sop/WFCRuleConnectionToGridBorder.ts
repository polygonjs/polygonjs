/**
 * creates a rule that defines which tile can be next to the grid limit
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {ALL_SIDES} from '../../../core/wfc/WFCCommon';
import {GRID_BORDER_ID, GRID_BORDER_SIDE_NAME} from '../../../core/wfc/WFCConstant';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {createRuleObject} from '../../../core/wfc/WFCRule';
import {stringMatchMask} from '../../../core/String';

class WFCRuleConnectionToGridBorderSopParamsConfig extends NodeParamsConfig {
	/** @param src tile id */
	tileId = ParamConfig.STRING('*');
	/** @param side name */
	sideName = ParamConfig.STRING('*');
}
const ParamsConfig = new WFCRuleConnectionToGridBorderSopParamsConfig();

export class WFCRuleConnectionToGridBorderSopNode extends TypedSopNode<WFCRuleConnectionToGridBorderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_RULE_CONNECTION_TO_GRID_BORDER;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const inputObjects = coreGroup0.threejsObjects();
		const {tileId, sideName} = this.pv;

		const tileObjects = inputObjects.filter((tileObject) =>
			stringMatchMask(CoreWFCTileAttribute.getTileId(tileObject), tileId)
		);

		const outputObjects = [...inputObjects];
		for (const tile of tileObjects) {
			const tileId = CoreWFCTileAttribute.getTileId(tile);
			for (const side0 of ALL_SIDES) {
				const sideName0 = CoreWFCTileAttribute.getSideName(tile, side0);

				if (sideName0 && stringMatchMask(sideName0, sideName)) {
					const ruleObject = createRuleObject({
						id0: tileId,
						id1: GRID_BORDER_ID,
						side0,
						side1: GRID_BORDER_SIDE_NAME,
					});

					outputObjects.push(ruleObject);
				}
			}
		}

		this.setObjects(outputObjects);
	}
}
