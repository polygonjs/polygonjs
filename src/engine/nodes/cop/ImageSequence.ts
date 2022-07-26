/**
 * Loads multiple images in order to quickly set the texture to one of them.
 *
 * @remarks
 *
 * This can replace the [cop/video](/docs/nodes/cop/video) when you'd like to go back and forth in the image sequence,
 * as videos are less capable of going back without skipping frames.
 *
 *
 */

import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {Constructor} from '../../../types/GlobalTypes';
import {CanvasTexture} from 'three';
import {BaseNodeType} from '../_Base';

export function ImageSequenceCopNodeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param url to fetch the images from */
		url = ParamConfig.STRING('images.%05d.jpg');
		/** @param frame range */
		frameRange = ParamConfig.VECTOR2([1, 100]);
		/** @param image index */
		frame = ParamConfig.INTEGER(1, {
			range: [1, 100],
			rangeLocked: [true, false],
			cook: false,
			callback: (node: BaseNodeType) => {
				ImageSequenceCopNode.PARAM_CALLBACK_updateImageIndex(node as ImageSequenceCopNode);
			},
		});
		/** @param forces images to reload*/
		reload = ParamConfig.BUTTON(null, {
			cook: false,
			callback: (node: BaseNodeType) => {
				ImageSequenceCopNode.PARAM_CALLBACK_reload(node as ImageSequenceCopNode);
			},
		});
	};
}
class ImageSequenceCopParamConfig extends TextureParamConfig(ImageSequenceCopNodeParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new ImageSequenceCopParamConfig();

export class ImageSequenceCopNode extends TypedCopNode<ImageSequenceCopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'imageSequence'> {
		return 'imageSequence';
	}
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	override async cook() {
		await this._loadImagesIfRequired();
		const texture = this._updateImageIndex();
		if (!texture) {
			return;
		}
		await this.textureParamsController.update(texture);
		texture.needsUpdate = true;
		this.setTexture(texture);
	}
	//
	//
	// CANVAS TEXTURE
	//
	//
	private __canvasTexture: CanvasTexture | undefined;
	private _canvasTexture(image: HTMLImageElement) {
		return (this.__canvasTexture = this.__canvasTexture || new CanvasTexture(this._canvas(image)));
	}
	//
	//
	// CANVAS
	//
	//
	private __canvas: HTMLCanvasElement | undefined;
	private _canvas(image: HTMLImageElement) {
		return (this.__canvas = this.__canvas || this._createCanvas(image));
	}
	private _createCanvas(image: HTMLImageElement) {
		const canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		return canvas;
	}

	//
	//
	// CACHE
	//
	//
	private _images: Map<number, HTMLImageElement> = new Map();
	private async _loadImagesIfRequired() {
		if (this._images.size > 0) {
			return;
		}
		const frameRange = this.pv.frameRange;
		const url = this.pv.url;
		const paddingMatch = url.match(/(%0(\d)d)/);
		if (!paddingMatch) {
			this.states.error.set('no padding match');
			return;
		}
		const padding = parseInt(paddingMatch[2]);
		const promises: Array<Promise<HTMLImageElement>> = [];
		for (let frame = frameRange.x; frame <= frameRange.y; frame++) {
			const imageUrl = url.replace(/(%0\dd)/, `${frame}`.padStart(padding, '0'));
			promises.push(this._loadImage(imageUrl, frame));
		}
		await Promise.all(promises);
	}
	private _loadImage(url: string, frame: number): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => {
				this._images.set(frame, image);
				resolve(image);
			};
			image.onerror = () => {
				this.states.error.set(`failed to load url '${url}' (at frame ${frame})`);
				resolve(image);
			};
			image.src = url;
		});
	}

	//
	//
	// CALLBACK
	//
	//
	static PARAM_CALLBACK_reload(node: ImageSequenceCopNode) {
		node._reload();
	}
	static PARAM_CALLBACK_updateImageIndex(node: ImageSequenceCopNode) {
		node._updateImageIndex();
	}
	private _reload() {
		this._images.clear();
		this.__canvas = undefined;
		this.__canvasTexture = undefined;
		this._loadImagesIfRequired();
	}
	private _updateImageIndex() {
		if (!this._images) {
			this.states.error.set('no images loaded');
			return;
		}
		const currentImage = this._images.get(this.pv.frame);
		if (!currentImage) {
			this.states.error.set(`image ${this.pv.frame} is not available`);
			return;
		}
		const canvas = this._canvas(currentImage);
		const context = canvas.getContext('2d');
		if (!context) {
			this.states.error.set(`failed to get canvas context`);
			return;
		}
		context.drawImage(currentImage, 0, 0);
		const texture = this._canvasTexture(currentImage);
		texture.needsUpdate = true;
		return texture;
	}
}
