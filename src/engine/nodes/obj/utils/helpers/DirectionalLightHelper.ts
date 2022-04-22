// import {DirectionalLightObjNode} from '../../DirectionalLight';
// import {BaseLightHelper} from './_BaseLightHelper';
// import {Mesh} from 'three';
// import {CoreDirectionalLightHelper, DirectionalLightContainer} from '../../../../../core/lights/DirectionalLight';

// export class DirectionalLightHelper extends BaseLightHelper<Mesh, DirectionalLightContainer, DirectionalLightObjNode> {
// 	createObject() {
// 		return new Mesh();
// 	}
// 	private _coreHelper: CoreDirectionalLightHelper|undefined
// 	protected buildHelper() {
// 		this._coreHelper = this._coreHelper || new CoreDirectionalLightHelper(this.node.light)
// 		this._coreHelper.buildHelper(this._object, this.node.light);
// 	}

// 	update() {
// 		this._coreHelper.update(this._object, {container: this.node.light});
// 	}
// }
