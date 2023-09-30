/**
 * creates rules used by the WFCSolver
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three';
import {ALL_SIDES} from '../../../core/wfc/WFCCommon';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {createRuleObject} from '../../../core/wfc/WFCRule';
import {stringMatchMask} from '../../../core/String';

class WFCRuleConnectionFromSideNameSopParamsConfig extends NodeParamsConfig {
	/** @param src tile id */
	srcTileId = ParamConfig.STRING('*');
	/** @param dest tile id */
	destTileId = ParamConfig.STRING('*');
	/** @param side name */
	sideName = ParamConfig.STRING('*');
}
const ParamsConfig = new WFCRuleConnectionFromSideNameSopParamsConfig();

export class WFCRuleConnectionFromSideNameSopNode extends TypedSopNode<WFCRuleConnectionFromSideNameSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_RULE_CONNECTION_FROM_SIDE_NAME;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const tileObjects = coreGroup0.threejsObjects();
		const outputObjects: Object3D[] = [...tileObjects];

		const {srcTileId, destTileId, sideName} = this.pv;
		const srcTileObjects = tileObjects.filter((tileObject) =>
			stringMatchMask(CoreWFCTileAttribute.getTileId(tileObject), srcTileId)
		);
		const destTileObjects = tileObjects.filter((tileObject) =>
			stringMatchMask(CoreWFCTileAttribute.getTileId(tileObject), destTileId)
		);
		// create connections from tile side attributes
		for (const tile0 of srcTileObjects) {
			const tileId0 = CoreWFCTileAttribute.getTileId(tile0);
			for (const side0 of ALL_SIDES) {
				const sideName0 = CoreWFCTileAttribute.getSideName(tile0, side0);

				if (sideName0 && stringMatchMask(sideName0, sideName)) {
					for (const tile1 of destTileObjects) {
						const tileId1 = CoreWFCTileAttribute.getTileId(tile1);
						for (const side1 of ALL_SIDES) {
							const sideName1 = CoreWFCTileAttribute.getSideName(tile1, side1);
							if (sideName0 == sideName1) {
								const ruleObject = createRuleObject({
									id0: tileId0,
									id1: tileId1,
									side0,
									side1,
								});

								outputObjects.push(ruleObject);
							}
						}
					}
				}
			}
		}

		this.setObjects(outputObjects);
	}
}
