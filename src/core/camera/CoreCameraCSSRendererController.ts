import {Camera} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import type {CSS2DRendererRopNode} from '../../engine/nodes/rop/CSS2DRenderer';
import type {CSS3DRendererRopNode} from '../../engine/nodes/rop/CSS3DRenderer';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {RopType} from '../../engine/poly/registers/nodes/types/Rop';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';
import {CoreType} from '../Type';
import {CSS3DRenderer} from '../../modules/three/examples/jsm/renderers/CSS3DRenderer';
import {CSS2DRenderer} from '../../modules/three/examples/jsm/renderers/CSS2DRenderer';

interface CreateCSSRendererOptions {
	scene: PolyScene;
	camera: Camera;
	canvas: HTMLCanvasElement;
}

type CSSRendererRopNode = CSS3DRendererRopNode | CSS2DRendererRopNode;
type CSSRenderer = CSS3DRenderer | CSS2DRenderer;
export interface CSSRendererConfig {
	cssRenderer: CSSRenderer;
	cssRendererNode: CSSRendererRopNode;
}

export class CoreCameraCSSRendererController {
	static isCSSRendererNode(node: BaseNodeType) {
		return node.type() == RopType.CSS2D || node.type() == RopType.CSS3D;
	}

	static cssRendererConfig(options: CreateCSSRendererOptions): CSSRendererConfig | undefined {
		const {canvas, scene, camera} = options;

		let cssRendererNode: CSSRendererRopNode | undefined;
		const postProcessNodePath = CoreObject.attribValue(camera, CameraAttribute.CSS_RENDERER_PATH);
		if (postProcessNodePath && CoreType.isString(postProcessNodePath)) {
			const foundNode = scene.node(postProcessNodePath);
			if (foundNode && this.isCSSRendererNode(foundNode)) {
				cssRendererNode = foundNode as CSSRendererRopNode;
			}
		}

		if (!cssRendererNode) {
			return;
		}

		const cssRenderer = cssRendererNode.renderer(canvas);
		return {cssRenderer, cssRendererNode};
	}
}
