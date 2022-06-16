import {FileLoader, Loader, LoadingManager} from 'three';
import {CoreType} from '../../Type';
import {Font, FontData} from './Font';

type OnLoad = (font: Font) => void;
type OnProgress = (event: ProgressEvent<EventTarget>) => void;
type OnError = (error: any) => void;

export class FontLoader extends Loader {
	constructor(manager: LoadingManager) {
		super(manager);
	}

	load(url: string, onLoad: OnLoad, onProgress?: OnProgress, onError?: OnError) {
		const scope = this;

		const loader = new FileLoader(this.manager);
		loader.setPath(this.path);
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(scope.withCredentials);
		loader.load(
			url,
			function (text) {
				if (!CoreType.isString(text)) {
					return;
				}
				let json: FontData | undefined;

				try {
					json = JSON.parse(text as string);
				} catch (e) {
					console.warn(
						'THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.'
					);
					json = JSON.parse((text as string).substring(65, text.length - 2));
				}

				if (!json) {
					return;
				}
				const font = scope.parse(json);

				if (onLoad) onLoad(font);
			},
			onProgress,
			onError
		);
	}

	parse(json: FontData) {
		return new Font(json);
	}
}

//
