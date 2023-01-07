// /**
//  * Creates a WebXR controller
//  *
//  *
//  */

// import {TypedSopNode} from './_Base';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {WebXRControllerSopOperation} from '../../operations/sop/WebXRController';

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

// const DEFAULT = WebXRControllerSopOperation.DEFAULT_PARAMS;
// class WebXRControllerSopParamsConfig extends NodeParamsConfig {
// 	/** @param controller index */
// 	index = ParamConfig.INTEGER(DEFAULT.index, {
// 		range: [0, 1],
// 		rangeLocked: [true, false],
// 	});
// 	/** @param addTarget */
// 	addTarget = ParamConfig.BOOLEAN(DEFAULT.addTarget);
// }
// const ParamsConfig = new WebXRControllerSopParamsConfig();

// export class WebXRControllerSopNode extends TypedSopNode<WebXRControllerSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'webXRController';
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(0);
// 	}

// 	private _operation: WebXRControllerSopOperation | undefined;
// 	override cook(inputCoreGroups: CoreGroup[]) {
// 		this._operation = this._operation || new WebXRControllerSopOperation(this._scene, this.states, this);
// 		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
// 		this.setCoreGroup(coreGroup);
// 	}
// }
