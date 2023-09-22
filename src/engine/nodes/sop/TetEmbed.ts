/**
 * embeds a high res mesh into a tet mesh
 *
 *
 */

import {TetSopNode} from './_BaseTet';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreSoftBodyAttribute} from '../../../core/softBody/SoftBodyAttribute';

class TetEmbedSopParamsConfig extends NodeParamsConfig {
	/** @param highRes Skinning Lookup Spacing */
	spacing = ParamConfig.FLOAT(0.05, {
		range: [0, 0.5],
		rangeLocked: [true, false],
	});
	/** @param highRes Skinning Lookup Padding */
	padding = ParamConfig.FLOAT(0.05, {
		range: [0, 0.5],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TetEmbedSopParamsConfig();

export class TetEmbedSopNode extends TetSopNode<TetEmbedSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TET_EMBED;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(2);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const tetObjects = inputCoreGroups[0].tetObjects();
		const highResNodeId = this.io.inputs.input(1)?.graphNodeId();
		if (highResNodeId == null) {
			this.states.error.set(`no high res node connected`);
			return;
		}
		if (tetObjects) {
			for (const tetObject of tetObjects) {
				CoreSoftBodyAttribute.setTetEmbedHighResNodeId(tetObject, highResNodeId);
				CoreSoftBodyAttribute.setHighResSkinningLookupSpacing(tetObject, this.pv.spacing);
				CoreSoftBodyAttribute.setHighResSkinningLookupPadding(tetObject, this.pv.padding);
			}
			this.setObjects(tetObjects);
		} else {
			this.setObjects([]);
		}
	}
}
