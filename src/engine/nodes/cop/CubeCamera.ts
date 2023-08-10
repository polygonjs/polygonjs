/**
 * Creates a Texture from a CubeCamera
 *
 *	@remarks
 *
 * See the [COP/CubeCamera](https://polygonjs.com/docs/nodes/cop/CubeCamera) on how to use it as a texture.
 */

import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	CubeCamera,
	Scene,
	Object3D,
	CubeReflectionMapping,
	CubeRefractionMapping,
	Texture,
	WebGLRenderTarget,
} from 'three';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/Type';
import {isObject3D} from '../../../core/geometry/ObjectContent';
import {CopRendererController} from './utils/RendererController';

enum MapMode {
	REFLECTION = 'reflection',
	REFRACTION = 'refraction',
}
const MAP_MODES: MapMode[] = [MapMode.REFLECTION, MapMode.REFRACTION];
class CubeCameraCopParamsConfig extends NodeParamsConfig {
	/** @param cube camera OBJ node */
	cameraPath = ParamConfig.STRING('*cubeCamera*', {
		objectMask: true,
	});
	/** @param objects to render */
	objects = ParamConfig.STRING('/', {
		objectMask: true,
	});
	/** @param defines if the texture is used for reflection or refraction */
	mode = ParamConfig.INTEGER(0, {
		menu: {
			entries: MAP_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param transparent background */
	transparentBackground = ParamConfig.BOOLEAN(1);
	/** @param bg Color */
	backgroundColor = ParamConfig.COLOR([0, 0, 0], {
		visibleIf: {
			transparentBackground: 0,
		},
	});
	/** @param autoRender */
	autoRender = ParamConfig.BOOLEAN(1);
	/** @param render button */
	render = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			CubeCameraCopNode.PARAM_CALLBACK_render(node as CubeCameraCopNode);
		},
	});
}
const ParamsConfig = new CubeCameraCopParamsConfig();
export class CubeCameraCopNode extends TypedCopNode<CubeCameraCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.CUBE_CAMERA;
	}

	private _renderScene: Scene = new Scene();
	private _rendererController: CopRendererController | undefined;
	// override async cook() {
	// 	const cubeCameraNode = this.pv.cubeCamera.nodeWithContext(NodeContext.OBJ, this.states.error);
	// 	if (!cubeCameraNode) {
	// 		this.states.error.set(`cubeCamera not found at '${this.pv.cubeCamera.path()}'`);
	// 		return this.cookController.endCook();
	// 	}
	// 	const renderTarget = (cubeCameraNode as CubeCameraObjNode).renderTarget();
	// 	if (!renderTarget) {
	// 		this.states.error.set(`cubeCamera has no render target'`);
	// 		return this.cookController.endCook();
	// 	}
	// 	const texture = renderTarget.texture;
	// 	if (MAP_MODES[this.pv.mode] == MapMode.REFLECTION) {
	// 		texture.mapping = CubeReflectionMapping;
	// 	} else {
	// 		texture.mapping = CubeRefractionMapping;
	// 	}
	// 	this.setTexture(texture);
	// }
	override async cook() {
		if (isBooleanTrue(this.pv.autoRender)) {
			this._addOnBeforeTickCallback();
		} else {
			this._removeOnBeforeTickCallback();
		}

		const texture = await this.renderOnTarget();
		if (texture) {
			const mode = MAP_MODES[this.pv.mode];
			switch (mode) {
				case MapMode.REFLECTION:
					texture.mapping = CubeReflectionMapping;
					break;
				case MapMode.REFRACTION:
					texture.mapping = CubeRefractionMapping;
					break;
			}

			this.setTexture(texture);
		} else {
			this.cookController.endCook();
		}
	}
	//
	//
	// AUTO RENDER
	//
	//
	private _addOnBeforeTickCallback() {
		const callbackName = this._onBeforeRenderCallbackName();
		if (this.scene().hasBeforeTickCallback(callbackName)) {
			return;
		}
		this.scene().registerOnBeforeTick(callbackName, this._renderOnTargetBound);
	}
	private _removeOnBeforeTickCallback() {
		this.scene().unRegisterOnBeforeTick(this._onBeforeRenderCallbackName());
	}
	private _onBeforeRenderCallbackName() {
		return `cop/render_onBeforeTickCallback-${this.graphNodeId()}`;
	}
	override dispose() {
		super.dispose();
		this._removeOnBeforeTickCallback();
	}

	//
	//
	// RENDER + RENDER TARGET
	//
	//
	private _getCameraSync() {
		return this.scene().objectsController.findObjectByMask(this.pv.cameraPath) as CubeCamera | undefined;
	}
	private async _getCamera(): Promise<CubeCamera | CubeCamera | undefined> {
		const camera = this._getCameraSync();
		if (camera) {
			return camera;
		}
		return new Promise((resolve) => {
			this.scene().camerasController.onCameraObjectsUpdated(async () => {
				const camera = this._getCameraSync();
				if (camera) {
					resolve(camera);
				}
			});
		});
	}
	private previousParentByObject: WeakMap<Object3D, Object3D | null> = new WeakMap();
	private _renderOnTargetBound = this.renderOnTarget.bind(this);
	async renderOnTarget(): Promise<Texture | undefined> {
		const camera = await this._getCamera();
		if (!camera) {
			console.warn(`${this.path()}: no camera found`);
			return;
		}
		this._rendererController = this._rendererController || new CopRendererController(this);
		const renderer = await this._rendererController.waitForRenderer();
		if (!renderer) {
			return;
		}

		const renderedObjects = this.scene().objectsController.objectsByMask(this.pv.objects).filter(isObject3D);
		//

		for (const renderedObject of renderedObjects) {
			this.previousParentByObject.set(renderedObject, renderedObject.parent);
			this._renderScene.attach(renderedObject);
		}

		this._renderScene.background = this.pv.transparentBackground ? null : this.pv.backgroundColor;

		// render
		camera.update(renderer, this.scene().threejsScene());

		// restore object
		for (const renderedObject of renderedObjects) {
			const previousParent = this.previousParentByObject.get(renderedObject);
			if (previousParent) {
				previousParent.attach(renderedObject);
			}
		}

		this._renderTarget = camera.renderTarget;
		return camera.renderTarget.texture;
	}
	private _renderTarget: WebGLRenderTarget | undefined;
	renderTarget() {
		return this._renderTarget;
	}

	//
	//
	// CALLBACK
	//
	//
	static PARAM_CALLBACK_render(node: CubeCameraCopNode) {
		node.renderOnTarget();
	}
}
