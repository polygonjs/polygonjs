/**
 * Creates a point light.
 *
 *
 */
import {PointLight} from 'three/src/lights/PointLight';
import {PointLightHelper} from './utils/helpers/PointLightHelper';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {Mesh} from 'three/src/objects/Mesh';
import {LightType} from '../../poly/registers/nodes/types/Light';
import {PointLightSopOperation} from '../../operations/sop/PointLight';
import {PointLightParamConfig} from '../../../core/lights/PointLight';

class PointLightObjParamsConfig extends PointLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new PointLightObjParamsConfig();

export class PointLightObjNode extends BaseLightTransformedObjNode<PointLight, PointLightObjParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.POINT;
	}
	private _helperController = new HelperController<Mesh, PointLight>(
		this,
		(<unknown>PointLightHelper) as HelperConstructor<Mesh, PointLight>,
		'PointLightHelper'
	);
	override initializeNode() {
		this._helperController.initializeNode();
	}

	private __operation__: PointLightSopOperation | undefined;
	private _operation() {
		return (this.__operation__ = this.__operation__ || new PointLightSopOperation(this._scene, this.states));
	}
	createLight() {
		return this._operation().createLight();
	}

	protected override updateLightParams() {
		this._operation().updateLightParams(this.light, this.pv);

		this._helperController.update();
	}
	protected override updateShadowParams() {
		this._operation().updateShadowParams(this.light, this.pv);
	}
}
