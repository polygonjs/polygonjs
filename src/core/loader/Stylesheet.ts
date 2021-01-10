import {Poly} from '../../engine/Poly';

export class CoreStylesheetLoader {
	static loadUrl(url: string) {
		// add .js ext if not present
		const elements = url.split('.');
		const ext = elements[elements.length - 1];
		if (ext != 'css') {
			url = `${url}.css`;
		}

		if (!Poly.inWorkerThread()) {
			const id = url.replace(/[\W_]+/g, '_');
			let stylesheet: HTMLLinkElement = document.getElementById(id) as HTMLLinkElement;

			if (!stylesheet) {
				stylesheet = document.createElement('link');
				stylesheet.type = 'text/css';
				stylesheet.rel = 'stylesheet';

				stylesheet.href = `${url}?${performance.now()}`;
				stylesheet.id = id;
				document.getElementsByTagName('head')[0].appendChild(stylesheet);
			}
		}
	}
}
