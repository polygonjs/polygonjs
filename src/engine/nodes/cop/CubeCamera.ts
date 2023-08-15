/**
 * Creates a Texture from a CubeCamera
 *
 *	@remarks
 *
 * See the [COP/CubeCamera](https://polygonjs.com/docs/nodes/cop/CubeCamera) on how to use it as a texture.
 */

import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CubeCamera, CubeReflectionMapping, CubeRefractionMapping, Texture, WebGLRenderer} from 'three';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/Type';
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
	// objects = ParamConfig.STRING('/', {
	// 	objectMask: true,
	// });
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

	private _rendererController: CopRendererController | undefined;

	override async cook() {
		if (isBooleanTrue(this.pv.autoRender)) {
			this._addOnBeforeTickCallback();
		} else {
			this._removeOnBeforeTickCallback();
		}

		const texture = await this.renderOnTarget(false);
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
			// not needed, as it is called inside .renderOnTarget
			// this.setTexture(texture);
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
	// private previousParentByObject: WeakMap<Object3D, Object3D | null> = new WeakMap();
	private _renderOnTargetBound = () => this.renderOnTarget(true);
	private _prevCamera: CubeCamera | undefined;
	private _prevRenderer: WebGLRenderer | undefined;
	async renderOnTarget(setDirtyIfChangesDetected: boolean): Promise<Texture | undefined> {
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
		// ensure materials using this texture are updated
		if ((setDirtyIfChangesDetected == true && this._prevCamera != camera) || renderer != this._prevRenderer) {
			this.setDirty();
			this._prevCamera = camera;
			this._prevRenderer = renderer;
		}

		const scene = this.scene().threejsScene();
		// save state
		const prevBackground = scene.background;
		scene.background = this.pv.transparentBackground ? null : this.pv.backgroundColor;

		// render
		camera.update(renderer, scene);

		// restore state
		scene.background = prevBackground;

		// make sure to set the texture here,
		// otherwise it will not be replaced when the renderer changes
		const texture = camera.renderTarget.texture;
		this.setTexture(texture);

		return texture;
	}
	// private _renderTarget: WebGLRenderTarget | undefined;
	async renderTarget() {
		const camera = await this._getCamera();
		return camera?.renderTarget.texture;
	}

	//
	//
	// CALLBACK
	//
	//
	static PARAM_CALLBACK_render(node: CubeCameraCopNode) {
		node.renderOnTarget(true);
	}
}
