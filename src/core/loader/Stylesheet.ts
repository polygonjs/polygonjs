import {Poly} from '../../engine/Poly';

export class CoreStylesheetLoader {
	static loadUrl(url: string): Promise<void> {
		return new Promise(async (resolve) => {
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

					const performance = Poly.performance.performanceManager();
					stylesheet.href = `${url}?${performance.now()}`;
					stylesheet.id = id;
					stylesheet.addEventListener('load', function () {
						resolve();
					});

					document.getElementsByTagName('head')[0].appendChild(stylesheet);

					// while (!this._isStylesheetLoaded(stylesheet)) {
					// 	await CoreSleep.sleep(100);
					// }
				}
			}
			resolve();
		});
	}
}
