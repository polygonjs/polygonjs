/**
 * Sets the draw range of the input geometry.
 *
 * @remarks
 * This can be useful when hiding part of an object with very little performance overhead.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Mesh} from 'three';
import {BufferGeometry} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
class DrawRangeSopParamsConfig extends NodeParamsConfig {
	/** @param start of the draw range */
	start = ParamConfig.INTEGER(0, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param defines if count is used */
	useCount = ParamConfig.BOOLEAN(0);
	/** @param number of items in the draw range */
	count = ParamConfig.INTEGER(0, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {useCount: 1},
	});
}
const ParamsConfig = new DrawRangeSopParamsConfig();

export class DrawRangeSopNode extends TypedSopNode<DrawRangeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'drawRange';
	}
	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const objects = core_group.objects();
		for (let object of objects) {
			const geometry = (object as Mesh).geometry as BufferGeometry;
			if (geometry) {
				const draw_range = geometry.drawRange;
				draw_range.start = this.pv.start;
				if (isBooleanTrue(this.pv.useCount)) {
					draw_range.count = this.pv.count;
				} else {
					draw_range.count = Infinity;
				}
			}
		}
		this.setCoreGroup(core_group);
	}
}
