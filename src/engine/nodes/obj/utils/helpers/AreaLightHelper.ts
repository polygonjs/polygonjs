import {AreaLightObjNode} from '../../AreaLight';
import {RectAreaLight} from 'three/src/lights/RectAreaLight';
import {RectAreaLightHelper} from '../../../../../modules/three/examples/jsm/helpers/RectAreaLightHelper';
import {BaseLightHelper} from './_BaseLightHelper';

export class RectAreaLightObjNodeHelper extends BaseLightHelper<RectAreaLightHelper, RectAreaLight, AreaLightObjNode> {
	protected createObject() {
		return new RectAreaLightHelper(this.node.light);
	}
	buildHelper() {}
	update() {
		this._object.update();
		this._object.updateMatrix();
	}
}
