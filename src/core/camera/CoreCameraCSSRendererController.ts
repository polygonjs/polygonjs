import {Camera} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import type {CSS2DRendererRopNode} from '../../engine/nodes/rop/CSS2DRenderer';
import type {CSS3DRendererRopNode} from '../../engine/nodes/rop/CSS3DRenderer';
import type {BaseNodeType, TypedNode} from '../../engine/nodes/_Base';
import {RopType} from '../../engine/poly/registers/nodes/types/Rop';
import {CameraAttribute} from './CoreCamera';
import {CoreType} from '../Type';
import {CSS3DRenderer} from '../render/CSSRenderers/CSS3DRenderer';
import {CSS2DRenderer} from '../render/CSSRenderers/CSS2DRenderer';
import {coreObjectClassFactory} from '../geometry/CoreObjectFactory';

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

		const nodeId = coreObjectClassFactory(camera).attribValue(camera, CameraAttribute.CSS_RENDERER_NODE_ID);
		if (nodeId == null) {
			return;
		}
		if (!CoreType.isNumber(nodeId)) {
			return;
		}
		const foundNode = scene.graph.nodeFromId(nodeId);
		if (!foundNode) {
			return;
		}
		// the test 'foundNode instanceof TypedNode' failed when loaded via a plugin and from the editor
		if (!this.isCSSRendererNode(foundNode as TypedNode<any, any>)) {
			return;
		}

		const cssRendererNode = foundNode as CSSRendererRopNode;
		// if cssRendererNode is not computed here, the CSS will not be loaded when using the example scene
		// <root_url>/demo?example=bynode/sop/css2dobject/basic
		cssRendererNode.compute();
		const cssRenderer = cssRendererNode.renderer(canvas);
		return {cssRenderer, cssRendererNode};
	}
}
