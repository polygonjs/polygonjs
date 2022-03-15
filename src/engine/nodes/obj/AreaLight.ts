/**
 * Creates an area light.
 *
 * @remarks
 * An area light can be expensive to compute but can give a good result.
 *
 */
import {RectAreaLight} from 'three/src/lights/RectAreaLight';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AreaLightParamConfig, CoreRectAreaLightHelper} from '../../../core/lights/AreaLight';
import {AreaLightSopOperation} from '../../operations/sop/AreaLight';
import {isBooleanTrue} from '../../../core/Type';
import {LightType} from '../../poly/registers/nodes/types/Light';

class AreaLightObjParamsConfig extends AreaLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new AreaLightObjParamsConfig();

export class AreaLightObjNode extends BaseLightTransformedObjNode<RectAreaLight, AreaLightObjParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.AREA;
	}

	private __operation__: AreaLightSopOperation | undefined;
	private _operation() {
		return (this.__operation__ = this.__operation__ || new AreaLightSopOperation(this._scene, this.states));
	}
	createLight() {
		return this._operation().createLight();
	}

	protected override updateLightParams() {
		this._operation().updateLightParams(this.light, this.pv);

		if (isBooleanTrue(this.pv.showHelper)) {
			this._helper = this._helper || new CoreRectAreaLightHelper(this.light);
			this.light.add(this._helper);
			this._helper.update();
		} else {
			if (this._helper) {
				this.light.remove(this._helper);
			}
		}
	}

	private _helper: CoreRectAreaLightHelper | undefined;
}
