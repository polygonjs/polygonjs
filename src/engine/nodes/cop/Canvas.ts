/**
 * Creates a texture from a canvas HTML Element
 *
 *
 */

import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {Constructor} from '../../../types/GlobalTypes';
import {CanvasTexture} from 'three/src/textures/CanvasTexture';

export function CanvasCopNodeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param HTML id of the canvas element */
		canvasId = ParamConfig.STRING('canvas-id');
		/** @param forces the texture to update */
		update = ParamConfig.BUTTON(null, {
			cook: false,
			callback: (node: BaseNodeType) => {
				CanvasCopNode.PARAM_CALLBACK_update(node as CanvasCopNode);
			},
		});
	};
}
class CanvasCopParamConfig extends TextureParamConfig(CanvasCopNodeParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new CanvasCopParamConfig();

export class CanvasCopNode extends TypedCopNode<CanvasCopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'canvas'> {
		return 'canvas';
	}
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	override async cook() {
		const elementId = this.pv.canvasId;
		const element = document.getElementById(elementId);
		if (!element) {
			this.states.error.set(`element with id '${elementId}' not found`);
			this.cookController.endCook();
			return;
		}
		if (!(element instanceof HTMLCanvasElement)) {
			this.states.error.set(`element found is not a canvas`);
			this.cookController.endCook();
			return;
		}
		const texture = new CanvasTexture(element);
		await this.textureParamsController.update(texture);
		this.setTexture(texture);
	}

	//
	//
	// CALLBACK
	//
	//
	static PARAM_CALLBACK_update(node: CanvasCopNode) {
		node.markTextureNeedsUpdate();
	}
	private markTextureNeedsUpdate() {
		const texture = this.containerController.container().texture();
		if (!texture) {
			return;
		}
		texture.needsUpdate = true;
	}
}
