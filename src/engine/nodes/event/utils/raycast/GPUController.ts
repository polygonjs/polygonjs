import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {RaycastEventNode} from '../../Raycast';
import {WebGLRenderTarget} from 'three';
import {Material} from 'three';
import {LinearFilter, NearestFilter, RGBAFormat, FloatType, NoToneMapping, LinearEncoding} from 'three';
import {NodeContext} from '../../../../poly/NodeContext';
import {BaseMatNodeType} from '../../../mat/_Base';
import {Scene} from 'three';
import {WebGLRenderer} from 'three';
import {Number2, Number3} from '../../../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../../../core/Type';
import {BaseRaycastController} from './BaseRaycastController';

interface SceneRestoreContext {
	overrideMaterial: Material | null;
}
interface RendererRestoreContext {
	toneMapping: number;
	outputEncoding: number;
}
interface RestoreContext {
	scene: SceneRestoreContext;
	renderer: RendererRestoreContext;
}

export class RaycastGPUController extends BaseRaycastController {
	private _resolvedMaterial: Material | null = null;
	private _restoreContext: RestoreContext = {
		scene: {
			overrideMaterial: null,
		},
		renderer: {
			toneMapping: -1,
			outputEncoding: -1,
		},
	};
	// private _mouse: Vector2 = new Vector2();
	private _cursorArray: Number2 = [0, 0];
	private _renderTarget: WebGLRenderTarget | undefined;
	private _read = new Float32Array(4);
	private _paramColor: Number3 = [0, 0, 0];
	private _paramAlpha: number = 0;
	constructor(private _node: RaycastEventNode) {
		super();
	}
	updateMouse(eventContext: EventContext<MouseEvent | DragEvent | PointerEvent>) {
		this._cursorHelper.setCursorForGPU(eventContext, this._cursor);
		if (isBooleanTrue(this._node.pv.tmouse)) {
			this._cursor.toArray(this._cursorArray);
			this._node.p.mouse.set(this._cursorArray);
		}
	}

	processEvent(context: EventContext<MouseEvent>) {
		const canvas = context.viewer?.canvas();
		const camera = context.viewer?.camera();
		if (!(canvas && camera)) {
			return;
		}

		// const camera_node = context.cameraNode;
		// const renderer_controller = (camera_node as BaseThreejsCameraObjNodeType).renderController();

		// if (renderer_controller) {
		this._renderTarget =
			this._renderTarget ||
			new WebGLRenderTarget(canvas.offsetWidth, canvas.offsetHeight, {
				minFilter: LinearFilter,
				magFilter: NearestFilter,
				format: RGBAFormat,
				type: FloatType,
			});

		// if (!this._resolved_material) {
		// 	this.update_material();
		// 	// console.warn('no material found');
		// 	// return;
		// }

		// find renderer and use it
		// const threejs_camera = camera_node as BaseThreejsCameraObjNodeType;
		// const scene = renderer_controller.resolvedScene() || camera_node.scene().threejsScene();
		const scene = this._node.scene().threejsScene();
		const renderer = this._node.scene().renderersRegister.lastRegisteredRenderer();
		if (!renderer) {
			return;
		}
		this._modifySceneAndRenderer(scene, renderer);
		renderer.setRenderTarget(this._renderTarget);
		renderer.clear();
		renderer.render(scene, camera);
		renderer.setRenderTarget(null);
		this._restoreSceneAndRenderer(scene, renderer);

		// read result
		renderer.readRenderTargetPixels(
			this._renderTarget,
			Math.round(this._cursor.x * canvas.offsetWidth),
			Math.round(this._cursor.y * canvas.offsetHeight),
			1,
			1,
			this._read
		);
		this._paramColor[0] = this._read[0];
		this._paramColor[1] = this._read[1];
		this._paramColor[2] = this._read[2];
		this._paramAlpha = this._read[3];
		this._node.p.pixelColor.set(this._paramColor);
		this._node.p.pixelAlpha.set(this._paramAlpha);

		if (this._node.pv.pixelColor.r > this._node.pv.hitThreshold) {
			this._node.triggerHit(context);
		} else {
			this._node.triggerMiss(context);
		}
	}

	private _modifySceneAndRenderer(scene: Scene, renderer: WebGLRenderer) {
		this._restoreContext.scene.overrideMaterial = scene.overrideMaterial;
		this._restoreContext.renderer.outputEncoding = renderer.outputEncoding;
		this._restoreContext.renderer.toneMapping = renderer.toneMapping;

		if (isBooleanTrue(this._node.pv.overrideMaterial)) {
			if (this._resolvedMaterial == null) {
				this._updateMaterial();
			}
			scene.overrideMaterial = this._resolvedMaterial;
		}

		renderer.toneMapping = NoToneMapping;
		renderer.outputEncoding = LinearEncoding;
	}
	private _restoreSceneAndRenderer(scene: Scene, renderer: WebGLRenderer) {
		scene.overrideMaterial = this._restoreContext.scene.overrideMaterial;
		renderer.outputEncoding = this._restoreContext.renderer.outputEncoding;
		renderer.toneMapping = this._restoreContext.renderer.toneMapping;
	}

	private _updateMaterial() {
		const node = this._node.pv.material.nodeWithContext(NodeContext.MAT, this._node.states.error);
		if (node) {
			if (node.context() == NodeContext.MAT) {
				this._resolvedMaterial = (node as BaseMatNodeType).material;
			} else {
				this._node.states.error.set('material is not a mat node');
			}
		} else {
			this._node.states.error.set('no override material found');
		}
	}

	static PARAM_CALLBACK_updateMaterial(node: RaycastEventNode) {
		node.gpuController._updateMaterial();
	}
}
