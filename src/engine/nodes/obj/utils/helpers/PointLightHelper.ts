import {PointLightObjNode} from '../../PointLight';
import {BaseLightHelper} from './_BaseLightHelper';
import {PointLight} from 'three/src/lights/PointLight';
import {Mesh} from 'three/src/objects/Mesh';
import {CorePointLightHelper} from '../../../../../core/lights/PointLight';

export class PointLightHelper extends BaseLightHelper<Mesh, PointLight, PointLightObjNode> {
	createObject() {
		return new Mesh();
	}
	private _coreHelper = new CorePointLightHelper();
	protected buildHelper() {
		this._coreHelper.buildHelper(this._object);
	}

	update() {
		this._coreHelper.update(this._object, {helperSize: this.node.pv.helperSize, light: this.node.light});
	}
}
