import {Texture} from 'three/src/textures/Texture';
import {TypedContainer} from './_Base';

export class TextureContainer extends TypedContainer<Texture> {
	_content: Texture;

	// constructor() {
	// 	super();
	// }

	// set_texture(texture: Texture){
	// 	if (this._content != null) {
	// 		this._content.dispose();
	// 	}
	// 	this.set_content(texture);
	// }
	texture(): Texture {
		return this._content;
	}
	core_content(): Texture {
		return this._content;
	}
	core_content_cloned(): Texture {
		if (this._content) {
			return this._content.clone();
		}
	}

	object() {
		return this.texture();
	}

	infos() {
		if (this._content != null) {
			return [this._content];
		}
	}
	resolution() {
		if (this._content) {
			if (this._content.image) {
				return [this._content.image.width, this._content.image.height];
			}
		}
	}
}
