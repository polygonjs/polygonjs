/**
 * Updates the instance count
 *
 * @remarks
 * This is similar to the draw_range SOP node, but for instances. This allows to define how many instances will be visible with very little performance cost.
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {InstancedBufferGeometry} from 'three';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
class InstancesCountSopParamsConfig extends NodeParamsConfig {
	/** @param sets if max is used */
	useMax = ParamConfig.BOOLEAN(0);
	/** @param max number of instances to display */
	max = ParamConfig.INTEGER(1, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {useMax: 1},
	});
}
const ParamsConfig = new InstancesCountSopParamsConfig();

export class InstancesCountSopNode extends TypedSopNode<InstancesCountSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'instancesCount';
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const objects = core_group.objectsWithGeo();
		for (let object of objects) {
			const geometry = object.geometry;
			if (geometry) {
				if (geometry instanceof InstancedBufferGeometry) {
					if (isBooleanTrue(this.pv.useMax)) {
						geometry.instanceCount = this.pv.max;
					} else {
						geometry.instanceCount = Infinity;
					}
				}
			}
		}
		this.setCoreGroup(core_group);
	}
}
