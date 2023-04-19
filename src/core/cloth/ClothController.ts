import {ClothInputsController} from './modules/ClothInputsController';
import {ClothMaterialController} from './modules/ClothMaterialsController';
import {ClothGeometryInitController} from './modules/ClothGeometryInitController';
import {ClothFBOController} from './modules/ClothFBOController';
import {ClothOnBeforeRenderController} from './modules/ClothOnBeforeRenderController';
import {WebGLRenderer, Mesh, Camera} from 'three';

export class ClothController {
	public readonly materials: ClothMaterialController;
	public readonly geometryInit: ClothGeometryInitController;
	public readonly inputs: ClothInputsController;
	public readonly fbo: ClothFBOController;
	public readonly onBeforeRender: ClothOnBeforeRenderController;
	public stepsCount = 40;

	constructor(public clothObject: Mesh) {
		this.materials = new ClothMaterialController(this);
		this.geometryInit = new ClothGeometryInitController(this.clothObject);
		this.inputs = new ClothInputsController(this);
		this.onBeforeRender = new ClothOnBeforeRenderController(this);
		this.fbo = new ClothFBOController(this);

		this.inputs.init();
	}

	init(renderer: WebGLRenderer) {
		this.fbo.init(renderer);
		this.onBeforeRender.init(this.clothObject);
	}

	update(camera: Camera) {
		this.fbo.update(camera);
	}
}
