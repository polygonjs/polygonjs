/**
 * filters tetrahedrons based on their quality
 *
 *
 */

import {TetSopNode} from './_BaseTet';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {TetObject} from '../../../core/geometry/tet/TetObject';
import {tetQuality} from '../../../core/geometry/tet/utils/tetQuality';
class TetQualitySopParamsConfig extends NodeParamsConfig {
	threshold = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new TetQualitySopParamsConfig();

export class TetQualitySopNode extends TetSopNode<TetQualitySopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TET_QUALITY;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const tetObjects = inputCoreGroups[0].tetObjects();
		if (tetObjects) {
			for (let tetObject of tetObjects) {
				this._filterTets(tetObject);
			}
			this.setObjects(tetObjects);
		} else {
			this.setObjects([]);
		}
	}
	_filterTets(tetObject: TetObject) {
		const {tetrahedrons, points} = tetObject.tetGeometry();
		const tetsCount = tetrahedrons.length;
		for (let i = tetsCount - 1; i >= 0; i--) {
			const tet = tetrahedrons[i];

			const quality = tetQuality(points[tet[0]], points[tet[1]], points[tet[2]], points[tet[3]]);
			console.log(quality);
			if (quality < this.pv.threshold) {
				tetrahedrons.splice(i, 1);
			}
		}
	}
}
