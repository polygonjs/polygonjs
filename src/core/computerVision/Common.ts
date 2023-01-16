import {Texture, VideoTexture, CanvasTexture} from 'three';

export type ComputerVisionValidSource = HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;

export function computerVisionValidSource(texture: Texture): ComputerVisionValidSource | undefined {
	if (texture instanceof VideoTexture) {
		if (texture.image instanceof HTMLVideoElement) {
			if (texture.image.paused == false) {
				return texture.image;
			}
		}
	} else if (texture instanceof CanvasTexture) {
		if (texture.source.data instanceof HTMLCanvasElement) {
			return texture.source.data;
		}
	} else if (texture instanceof Texture) {
		if (texture.image instanceof HTMLImageElement) {
			return texture.image;
		}
	}
}
