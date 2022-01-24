import {DirectionalLightObjNode} from '../../DirectionalLight';
import {DirectionalLight} from 'three/src/lights/DirectionalLight';
import {BaseLightHelper} from './_BaseLightHelper';
import {Mesh} from 'three/src/objects/Mesh';
import {CoreDirectionalLightHelper} from '../../../../../core/lights/DirectionalLight';

export class DirectionalLightHelper extends BaseLightHelper<Mesh, DirectionalLight, DirectionalLightObjNode> {
	createObject() {
		return new Mesh();
	}
	private _coreHelper = new CoreDirectionalLightHelper();
	protected buildHelper() {
		this._coreHelper.buildHelper(this._object, this.node.light);
	}

	update() {
		this._coreHelper.update(this._object, {light: this.node.light});
	}
}
