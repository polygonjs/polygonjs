/**
 * Creates a cube camera.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CubeCameraSopOperation} from '../../operations/sop/CubeCamera';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraNodeType} from '../../poly/NodeContext';
import {CUBE_CAMERA_DEFAULT, registerCubeCamera} from '../../../core/camera/CoreCubeCamera';
import {OnNodeRegisterCallback} from '../../poly/registers/nodes/NodesRegister';
const DEFAULT = CubeCameraSopOperation.DEFAULT_PARAMS;
class CubeCameraSopParamsConfig extends NodeParamsConfig {
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
	/** @param resolution */
	resolution = ParamConfig.FLOAT(CUBE_CAMERA_DEFAULT.resolution, {range: CUBE_CAMERA_DEFAULT.resolutionRange});
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

const ParamsConfig = new CubeCameraSopParamsConfig();

export class CubeCameraSopNode extends TypedSopNode<CubeCameraSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraNodeType.CUBE;
	}
	static override onRegister: OnNodeRegisterCallback = registerCubeCamera;

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: CubeCameraSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CubeCameraSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
