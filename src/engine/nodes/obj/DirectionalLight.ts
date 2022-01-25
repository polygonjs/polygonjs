/**
 * Creates a directional light.
 *
 *
 */
// import {DirectionalLightHelper} from './utils/helpers/DirectionalLightHelper';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {Mesh} from 'three/src/objects/Mesh';
// import {HelperController, HelperConstructor} from './utils/HelperController';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {LightType} from '../../poly/registers/nodes/types/Light';
import {DirectionalLightParamConfig, DirectionalLightContainer} from '../../../core/lights/DirectionalLight';
import {DirectionalLightSopOperation} from '../../operations/sop/DirectionalLight';

class DirectionalLightObjParamsConfig extends DirectionalLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new DirectionalLightObjParamsConfig();

export class DirectionalLightObjNode extends BaseLightTransformedObjNode<
	DirectionalLightContainer,
	DirectionalLightObjParamsConfig
> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.DIRECTIONAL;
	}
	// private _helperController = new HelperController<Mesh, DirectionalLightContainer>(
	// 	this,
	// 	(<unknown>DirectionalLightHelper) as HelperConstructor<Mesh, DirectionalLightContainer>,
	// 	'DirectionalLightHelper'
	// );
	// override initializeNode() {
	// 	// this.io.inputs.setCount(0, 1);
	// 	// this.io.inputs.set_depends_on_inputs(false);
	// 	// this._helperController.initializeNode();
	// }

	private __operation__: DirectionalLightSopOperation | undefined;
	private _operation() {
		return (this.__operation__ = this.__operation__ || new DirectionalLightSopOperation(this._scene, this.states));
	}
	override createLight() {
		return this._operation().createLight({showHelper: this.pv.showHelper});
	}

	protected override updateLightParams() {
		this._operation().updateLightParams(this.light, this.pv);
	}
	protected override updateShadowParams() {
		this.light.showHelper = this.pv.showHelper;
		this._operation().updateShadowParams(this.light, this.pv);
	}
}
