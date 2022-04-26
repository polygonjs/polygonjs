import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';
import {Number2} from '../../types/GlobalTypes';
import {CoreType} from '../../core/Type';

export class TextureContainer extends TypedContainer<NodeContext.COP> {
	override set_content(content: ContainableMap[NodeContext.COP]) {
		super.set_content(content);
	}

	texture(): ContainableMap[NodeContext.COP] {
		return this._content;
	}
	override coreContent(): ContainableMap[NodeContext.COP] {
		return this._content;
	}
	override coreContentCloned(): ContainableMap[NodeContext.COP] | undefined {
		const texture = this._content?.clone();
		if (texture) {
			texture.needsUpdate = true;
		}
		return texture;
	}

	object() {
		return this.texture();
	}

	override infos() {
		if (this._content != null) {
			return [this._content];
		}
	}
	resolution(): Number2 {
		function _resolutionFromHTMLVideoElement(video: HTMLVideoElement): Number2 {
			return [video.videoWidth, video.videoHeight];
		}

		if (this._content) {
			const image = this._content.image;
			if (image) {
				// check if normal image or gif
				if (
					image instanceof HTMLImageElement ||
					image instanceof Image ||
					image instanceof ImageData ||
					image instanceof HTMLCanvasElement // HTMLCanvasElement for gif
				) {
					return [image.width, image.height];
				}
				// check if video
				if (image instanceof HTMLVideoElement) {
					return _resolutionFromHTMLVideoElement(image);
				}
				// check if image data
				if (CoreType.isNumber(image.width) && CoreType.isNumber(image.height)) {
					return [image.width, image.height];
				}

				// if just an object like {width: 2, height: 2}
				// which can be returned by
			}
			const source = this._content.source;
			if (source) {
				if (source instanceof HTMLVideoElement) {
					return _resolutionFromHTMLVideoElement(source);
				}

				const data = source.data;
				if (data && CoreType.isNumber(data.width) && CoreType.isNumber(data.height)) {
					return [data.width, data.height];
				}
			}
		}
		return [-1, -1];
	}
}
