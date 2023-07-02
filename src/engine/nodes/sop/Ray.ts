/**
 * Projects points from the left input geometry onto the faces of the right input geometry.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {RaySopMode, RaySopOperation, RAY_SOP_MODES} from '../../operations/sop/Ray';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = RaySopOperation.DEFAULT_PARAMS;

class RaySopParamsConfig extends NodeParamsConfig {
	/** @param method used to ray points onto the collision geometry */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: RAY_SOP_MODES.map((name, value) => ({name, value})),
		},
	});
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
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.RAY;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(RaySopOperation.INPUT_CLONED_STATE);
	}

	private _operation: RaySopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new RaySopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}

	setMode(mode: RaySopMode) {
		this.p.mode.set(RAY_SOP_MODES.indexOf(mode));
	}
}
