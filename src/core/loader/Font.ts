import {Poly} from '../../engine/Poly';
import {CoreBaseLoader} from './_Base';
import {FontLoader, Font} from '../../modules/three/examples/jsm/loaders/FontLoader';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {SVGLoader} from '../../modules/three/examples/jsm/loaders/SVGLoader';
import {TTFLoader} from '../../modules/three/examples/jsm/loaders/TTFLoader';

export class CoreLoaderFont extends CoreBaseLoader {
	private _font_loader: FontLoader;

	constructor(url: string, _node?: BaseNodeType) {
		super(url, _node);

		this._font_loader = new FontLoader(this.loadingManager);
	}

	async load() {
		if (this._node) {
			Poly.blobs.clearBlobsForNode(this._node);
		}
		const ext = this.extension();
		const url = await this._urlToLoad();
		switch (ext) {
			case 'ttf': {
				return this._loadTTF(url);
			}
			case 'json': {
				return this._loadJSON(url);
			}
			default: {
				return null;
			}
		}
	}

	private _loadTTF(url: string): Promise<Font> {
		return new Promise(async (resolve, reject) => {
			const loaded_module = await this._loadTTFLoader();
			if (!loaded_module) {
				return;
			}
			loaded_module.load(
				url,
				(fnt: object) => {
					const parsed = this._font_loader.parse(fnt);
					resolve(parsed);
				},
				undefined,
				() => {
					reject();
				}
			);
		});
	}
	private _loadJSON(url: string): Promise<Font> {
		return new Promise((resolve, reject) => {
			this._font_loader.load(
				url,
				(font: Font) => {
					resolve(font);
				},
				undefined,
				() => {
					reject();
				}
			);
		});
	}

	private async _loadTTFLoader() {
		return new TTFLoader(this.loadingManager);
	}
	static async loadSVGLoader() {
		return SVGLoader;
	}
}
