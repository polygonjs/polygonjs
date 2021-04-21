/**
 * Projects points from the left input geometry onto the faces of the right input geometry.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {RaySopOperation} from '../../operations/sop/Ray';
const DEFAULT = RaySopOperation.DEFAULT_PARAMS;

class RaySopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to use the normals as the ray direction */
	useNormals = ParamConfig.BOOLEAN(DEFAULT.useNormals);
	/** @param if the normals are not used as the ray direction, this define the direction used */
	direction = ParamConfig.VECTOR3(DEFAULT.direction.toArray(), {
		visibleIf: {useNormals: 0},
	});
	/** @param moves the points or leaves them in place */
	transformPoints = ParamConfig.BOOLEAN(DEFAULT.transformPoints);
	/** @param copies the normals from the right geometry to the left one */
	transferFaceNormals = ParamConfig.BOOLEAN(DEFAULT.transferFaceNormals);
	/** @param adds an attribute with the distance to the hit position on the target geometry */
	addDistAttribute = ParamConfig.BOOLEAN(DEFAULT.addDistAttribute);
}
const ParamsConfig = new RaySopParamsConfig();

export class RaySopNode extends TypedSopNode<RaySopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'ray';
	}

	static displayedInputNames(): string[] {
		return ['geometry to move', 'geometry to ray onto'];
	}

	initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState([
			InputCloneMode.FROM_NODE,
			InputCloneMode.ALWAYS, // to assign double sided mat
		]);
	}

	private _operation: RaySopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new RaySopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
