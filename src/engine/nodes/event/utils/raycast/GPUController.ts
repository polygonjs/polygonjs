import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {RaycastEventNode} from '../../Raycast';
import {BaseThreejsCameraObjNodeType} from '../../../obj/_BaseCamera';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {Material} from 'three/src/materials/Material';
import {Vector2} from 'three/src/math/Vector2';
import {LinearFilter, NearestFilter, RGBAFormat, FloatType, NoToneMapping, LinearEncoding} from 'three/src/constants';
import {NodeContext} from '../../../../poly/NodeContext';
import {BaseMatNodeType} from '../../../mat/_Base';
import {Scene} from 'three/src/scenes/Scene';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';

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

export class RaycastGPUController {
	private _resolved_material: Material | null = null;
	private _restore_context: RestoreContext = {
		scene: {
			overrideMaterial: null,
		},
		renderer: {
			toneMapping: -1,
			outputEncoding: -1,
		},
	};
	private _mouse: Vector2 = new Vector2();
	private _mouse_array: Number2 = [0, 0];
	private _render_target: WebGLRenderTarget | undefined;
	private _read = new Float32Array(4);
	private _param_read: Number4 = [0, 0, 0, 0];
	constructor(private _node: RaycastEventNode) {}
	update_mouse(context: EventContext<MouseEvent>) {
		if (!(context.canvas && context.event)) {
			return;
		}

		if (context.event instanceof MouseEvent) {
			this._mouse.x = context.event.offsetX / context.canvas.offsetWidth;
			this._mouse.y = 1 - context.event.offsetY / context.canvas.offsetHeight;
			this._mouse.toArray(this._mouse_array);
			this._node.p.mouse.set(this._mouse_array);
		}
	}

	process_event(context: EventContext<MouseEvent>) {
		if (!(context.canvas && context.camera_node)) {
			return;
		}

		const camera_node = context.camera_node;
		const renderer_controller = (camera_node as BaseThreejsCameraObjNodeType).render_controller;

		if (renderer_controller) {
			const canvas = context.canvas;
			this._render_target =
				this._render_target ||
				new WebGLRenderTarget(canvas.offsetWidth, canvas.offsetHeight, {
					minFilter: LinearFilter,
					magFilter: NearestFilter,
					format: RGBAFormat,
					type: FloatType,
				});

			if (!this._resolved_material) {
				console.warn('no material found');
				return;
			}

			// find renderer and use it
			const threejs_camera = camera_node as BaseThreejsCameraObjNodeType;
			const scene = renderer_controller.resolved_scene || camera_node.scene.default_scene;
			const renderer = renderer_controller.renderer(canvas);
			this._modify_scene_and_renderer(scene, renderer);
			renderer.setRenderTarget(this._render_target);
			renderer.clear();
			renderer.render(scene, threejs_camera.object);
			renderer.setRenderTarget(null);
			this._restore_scene_and_renderer(scene, renderer);

			// read result
			renderer.readRenderTargetPixels(
				this._render_target,
				this._mouse.x * canvas.offsetWidth,
				this._mouse.y * canvas.offsetHeight,
				1,
				1,
				this._read
			);
			this._param_read[0] = this._read[0];
			this._param_read[1] = this._read[1];
			this._param_read[2] = this._read[2];
			this._param_read[3] = this._read[3];
			this._node.p.pixel_value.set(this._param_read);

			if (this._node.pv.pixel_value.x > this._node.pv.hit_threshold) {
				this._node.trigger_hit(context);
			} else {
				this._node.trigger_miss(context);
			}
		}
	}

	private _modify_scene_and_renderer(scene: Scene, renderer: WebGLRenderer) {
		this._restore_context.scene.overrideMaterial = scene.overrideMaterial;
		this._restore_context.renderer.outputEncoding = renderer.outputEncoding;
		this._restore_context.renderer.toneMapping = renderer.toneMapping;

		scene.overrideMaterial = this._resolved_material;
		renderer.toneMapping = NoToneMapping;
		renderer.outputEncoding = LinearEncoding;
	}
	private _restore_scene_and_renderer(scene: Scene, renderer: WebGLRenderer) {
		scene.overrideMaterial = this._restore_context.scene.overrideMaterial;
		renderer.outputEncoding = this._restore_context.renderer.outputEncoding;
		renderer.toneMapping = this._restore_context.renderer.toneMapping;
	}

	update_material() {
		const node = this._node.p.material.found_node();
		if (node) {
			if (node.node_context() == NodeContext.MAT) {
				this._resolved_material = (node as BaseMatNodeType).material;
			} else {
				this._node.states.error.set('target is not an obj');
			}
		} else {
			this._node.states.error.set('no target found');
		}
	}

	static PARAM_CALLBACK_update_material(node: RaycastEventNode) {
		node.gpu_controller.update_material();
	}
}
