import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';
import {Number2} from '../../types/GlobalTypes';

export class TextureContainer extends TypedContainer<NodeContext.COP> {
	set_content(content: ContainableMap[NodeContext.COP]) {
		super.set_content(content);
	}

	texture(): ContainableMap[NodeContext.COP] {
		return this._content;
	}
	coreContent(): ContainableMap[NodeContext.COP] {
		return this._content;
	}
	coreContentCloned(): ContainableMap[NodeContext.COP] | undefined {
		const texture = this._content?.clone();
		if (texture) {
			texture.needsUpdate = true;
		}
		return texture;
	}

	object() {
		return this.texture();
	}

	infos() {
		if (this._content != null) {
			return [this._content];
		}
	}
	resolution(): Number2 {
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

				// check if image data
				if (image.data && image.width != null && image.height != null) {
					return [image.width, image.height];
				}

				// check if video
				const video = image as HTMLVideoElement;
				return [video.videoWidth, video.videoHeight];
			}
		}
		return [-1, -1];
	}
}
