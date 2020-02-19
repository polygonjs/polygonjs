import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class TextureContainer extends TypedContainer<ContainableMap['TEXTURE']> {
	// _content: Texture;
	set_content(content: ContainableMap['TEXTURE']) {
		super.set_content(content);
	}

	// set_texture(texture: Texture){
	// 	if (this._content != null) {
	// 		this._content.dispose();
	// 	}
	// 	this.set_content(texture);
	// }
	texture(): ContainableMap['TEXTURE'] {
		return this._content;
	}
	core_content(): ContainableMap['TEXTURE'] {
		return this._content;
	}
	core_content_cloned(): ContainableMap['TEXTURE'] | undefined {
		console.log('clone', this._content);
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
	resolution(): [number, number] {
		if (this._content) {
			if (this._content.image) {
				return [this._content.image.width, this._content.image.height];
			}
		}
		return [-1, -1];
	}
}
