/**
 * Applies an SDF boolean operation.
 *
 *
 */

import {SDFSopNode} from './_BaseSDF';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {SDFObject} from '../../../core/geometry/sdf/SDFObject';
import {SDFLoader} from '../../../core/geometry/sdf/SDFLoader';

export enum BooleanSDFOperationType {
	INTERSECT = 'intersect',
	SUBTRACT = 'subtract',
	UNION = 'union',
}
export const BOOLEAN_SDF_OPERATION_TYPES: BooleanSDFOperationType[] = [
	BooleanSDFOperationType.INTERSECT,
	BooleanSDFOperationType.SUBTRACT,
	BooleanSDFOperationType.UNION,
];

class SDFBooleanSopParamsConfig extends NodeParamsConfig {
	/** @param operation */
	operation = ParamConfig.INTEGER(BOOLEAN_SDF_OPERATION_TYPES.indexOf(BooleanSDFOperationType.INTERSECT), {
		menu: {entries: BOOLEAN_SDF_OPERATION_TYPES.map((name, value) => ({name, value}))},
	});
}
const ParamsConfig = new SDFBooleanSopParamsConfig();

export class SDFBooleanSopNode extends SDFSopNode<SDFBooleanSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SDF_BOOLEAN;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(2);
	}
	setOperation(operation: BooleanSDFOperationType) {
		this.p.operation.set(BOOLEAN_SDF_OPERATION_TYPES.indexOf(operation));
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const objects: SDFObject[] = [];
		const objects0 = inputCoreGroups[0].SDFObjects();
		const objects1 = inputCoreGroups[1].SDFObjects();
		if (objects0 && objects1) {
			const manifold = await SDFLoader.core();
			const object0 = objects0[0];
			const object1 = objects1[0];
			const result = manifold.difference(object0.geometry, object1.geometry);
			objects.push(new SDFObject(result));
		}

		this.setSDFObjects(objects);
	}
}
