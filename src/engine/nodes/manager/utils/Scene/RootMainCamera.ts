import {Constructor} from '../../../../../types/GlobalTypes';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {RootManagerNode} from '../../Root';
import {Camera, PerspectiveCamera} from 'three';
import {CoreWalker} from '../../../../../core/Walker';
import {GeoObjNode} from '../../../obj/Geo';

let __defaultDummyPerspectiveCamera: PerspectiveCamera | undefined;
export function _defaultDummyPerspectiveCamera() {
	return (__defaultDummyPerspectiveCamera = __defaultDummyPerspectiveCamera || new PerspectiveCamera());
}

export function RootMainCameraParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param path to the main camera object that will be used when the scene loads outside of the editor */
		mainCameraPath = ParamConfig.STRING('', {
			cook: false,
			separatorBefore: true,
			objectMask: true,
		});
	};
}

export class RootMainCameraController {
	constructor(protected node: RootManagerNode) {}

	setCamera(object: Camera) {
		const path = this.node.scene().objectsController.objectPath(object);
		this.setCameraPath(path);
	}
	setCameraPath(path: string) {
		this.mainCameraPathParam().set(path);
	}
	mainCameraPathParam() {
		return this.node.p.mainCameraPath;
	}
	rawCameraPath() {
		return this.mainCameraPathParam().rawInput();
	}
	async cameraPath() {
		const param = this.mainCameraPathParam();
		if (param.isDirty()) {
			await param.compute();
		}
		return param.value;
	}
	private _cameraPathSync() {
		const param = this.mainCameraPathParam();
		return param.value;
	}
	cameraSync() {
		const path = this._cameraPathSync();
		const object = this.node.scene().objectsController.findObjectByMask(path) as Camera | undefined;
		return object;
	}
	dummyPerspectiveCamera() {
		return _defaultDummyPerspectiveCamera();
	}
	cameraSyncOrDummy() {
		return this.cameraSync(); // || this.dummyPerspectiveCamera();
	}
	async camera() {
		const path = await this.cameraPath();
		const object = this.node.scene().objectsController.findObjectByMask(path) as Camera | undefined;
		return object;
	}
	async cameraCreatorNode() {
		const path = await this.cameraPath();
		const elements = path.split(CoreWalker.SEPARATOR);
		const nodeName = elements[1];
		const objNode = this.node.node(nodeName);
		if (objNode && elements.length != 2) {
			const displayNodeController = (objNode as GeoObjNode).displayNodeController;
			if (displayNodeController) {
				return (objNode as GeoObjNode).displayNodeController.displayNode() || objNode;
			}
		}
		return objNode;
	}
}
