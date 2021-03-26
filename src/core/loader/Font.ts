import {Poly} from '../../engine/Poly';
import {ModuleName} from '../../engine/poly/registers/modules/Common';
import {PolyScene} from '../../engine/scene/PolyScene';
import {CoreBaseLoader} from './_Base';
import {Font} from 'three/src/extras/core/Font';
import {FontLoader} from 'three/src/loaders/FontLoader';

export class CoreLoaderFont extends CoreBaseLoader {
	public readonly ext: string;
	private _font_loader: FontLoader;

	constructor(url: string, scene: PolyScene) {
		super(url, scene);

		this.ext = CoreLoaderFont.getExtension(url);
		this._font_loader = new FontLoader(this.loadingManager);
	}

	async load() {
		const ext = CoreLoaderFont.getExtension(this.url);
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

	static getExtension(url: string) {
		const elements1 = url.split('?')[0];
		const elements2 = elements1.split('.');
		return elements2[elements2.length - 1];
	}
	static requiredModules(url: string) {
		const ext = CoreLoaderFont.getExtension(url);
		switch (ext) {
			case 'ttf': {
				return [ModuleName.TTFLoader];
			}
			case 'json': {
				return [ModuleName.SVGLoader];
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
				(font) => {
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
		const TTFLoader = await Poly.modulesRegister.module(ModuleName.TTFLoader);
		if (TTFLoader) {
			return new TTFLoader(this.loadingManager);
		}
	}
	static async loadSVGLoader() {
		const SVGLoader = await Poly.modulesRegister.module(ModuleName.SVGLoader);
		if (SVGLoader) {
			return SVGLoader;
		}
	}
}
