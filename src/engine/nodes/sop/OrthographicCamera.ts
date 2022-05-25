/**
 * Creates an orthographic camera.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {OrthographicCameraSopOperation} from '../../operations/sop/OrthographicCamera';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraNodeType} from '../../poly/NodeContext';
import {registerOrthographicCamera} from '../../../core/camera/CoreOrthographicCamera';
const DEFAULT = OrthographicCameraSopOperation.DEFAULT_PARAMS;
class OrthographicCameraSopParamsConfig extends NodeParamsConfig {
	/** @param camera view size */
	size = ParamConfig.FLOAT(DEFAULT.size, {
		range: [0.001, 2],
		rangeLocked: [true, false],
	});
	/** @param camera near */
	near = ParamConfig.FLOAT(DEFAULT.near, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param camera far */
	far = ParamConfig.FLOAT(DEFAULT.far, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param camera position */
	position = ParamConfig.VECTOR3(DEFAULT.position);
	/** @param camera rotation */
	rotation = ParamConfig.VECTOR3(DEFAULT.rotation);
	/** @param show helper */
	showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);
	/** @param matrixAutoUpdate */
	matrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.matrixAutoUpdate);
	/** @param camera name */
	name = ParamConfig.STRING('`$OS`');
}
const ParamsConfig = new OrthographicCameraSopParamsConfig();

export class OrthographicCameraSopNode extends TypedSopNode<OrthographicCameraSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraNodeType.ORTHOGRAPHIC;
	}
	static override onRegister = registerOrthographicCamera;

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: OrthographicCameraSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new OrthographicCameraSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
