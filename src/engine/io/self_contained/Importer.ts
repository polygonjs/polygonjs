import {unzipSync, strFromU8, Unzipped} from 'fflate';
import {JsFilesManifest, SelfContainedFileName} from './Common';
import {ViewerDataByElement} from '../../poly/Common';
import {ModuleName} from '../../poly/registers/modules/Common';
import {DomEffects} from '../../../core/DomEffects';
import {PolyEngine} from '../../Poly';
declare global {
	interface Window {
		__POLYGONJS_SELF_CONTAINED___MARK_AS_LOADED_CALLBACK__: () => void;
		__POLYGONJS_SELF_CONTAINED___POLY__: PolyEngine;
	}
}

const url = new URL(window.location.href);
const DEBUG = url.searchParams.get('POLY_DEBUG') == '1';

enum LoadingMode {
	LAZY = 'lazy',
	EAGER = 'eager',
}

export class SelfContainedSceneImporter {
	private _viewerDataByElement: ViewerDataByElement = new Map();
	private _firstPolygonjsVersionFound: string | undefined;

	async load() {
		window.__POLYGONJS_SELF_CONTAINED___MARK_AS_LOADED_CALLBACK__ = this.markPolygonjsAsLoaded.bind(this);

		const elements = document.getElementsByTagName('polygonjs-viewer');
		// 1 - ensure that all scenes need the same polygonjs engine.
		// 2 - only display a warning if not
		// 3 - accumulate list of unzipped content
		// 4 - load polygonjs
		// 5 - when polygonjs is loaded, load them one by one

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			await this._prepareElement(element as HTMLElement);
		}
		let firstUnzippedData: Unzipped | undefined;
		const requiredModules: Set<ModuleName> = new Set();
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i] as HTMLElement;
			const loadingMode = this._loadingMode(element);

			switch (loadingMode) {
				case LoadingMode.EAGER: {
					// we need await here, to make sure that we only create one script tag at a time
					// to load polygonjs
					const unzippedData = await this._getElementViewerData(element as HTMLElement, requiredModules);
					if (!firstUnzippedData && unzippedData) {
						firstUnzippedData = unzippedData;
					}
					break;
				}
				case LoadingMode.LAZY: {
					const onInteraction = async () => {
						const unzippedData = await this._getElementViewerData(element as HTMLElement, requiredModules);
						if (unzippedData) {
							await this.loadPolygonjs(unzippedData, requiredModules);
						}

						element.removeEventListener('click', onInteraction);
					};
					element.addEventListener('click', onInteraction);
				}
			}
		}

		if (firstUnzippedData) {
			await this.loadPolygonjs(firstUnzippedData, requiredModules);
		}
	}
	private _loadingMode(element: HTMLElement) {
		let loadingMode = element.getAttribute('loading') as LoadingMode | null;
		loadingMode = loadingMode || LoadingMode.EAGER;
		return loadingMode;
	}

	private _prepareElement(element: HTMLElement) {
		this._setupPoster(element);
	}

	private async _getElementViewerData(element: HTMLElement, requiredModules: Set<ModuleName>) {
		const src = element.getAttribute('src');
		if (!src) {
			console.error('polygonjs-viewer element has no src attribute', element);
			return;
		}
		const response = await fetch(src);

		const {progressBarContainer, progressBar} = this._addProgressBar(element);

		// const buffer = await reponse.arrayBuffer();
		// const massiveFile = new Uint8Array(buffer);
		const massiveFile = await this._fetchZipWithProgress(response, (progress, receivedLength, contentLength) => {
			this._updateProgressBar(progressBar, progress);
		});
		this._fadeOutProgressBar(progressBarContainer);
		if (!massiveFile) {
			return;
		}
		const unzippedData = unzipSync(massiveFile);
		const sceneData = JSON.parse(strFromU8(unzippedData[SelfContainedFileName.CODE]));
		const assetsManifest = JSON.parse(strFromU8(unzippedData[SelfContainedFileName.ASSETS]));
		const jsFilesManifest: JsFilesManifest = JSON.parse(strFromU8(unzippedData[SelfContainedFileName.JS_FILES]));
		if (DEBUG) {
			console.log(unzippedData);
			console.log(assetsManifest);
			console.log(jsFilesManifest);
		}
		const polygonjsVersion = sceneData.properties?.versions?.polygonjs;
		if (!polygonjsVersion) {
			console.error('no engine version found in scene data');
			return;
		}

		if (this._firstPolygonjsVersionFound) {
			if (this._firstPolygonjsVersionFound != polygonjsVersion) {
				console.warn(
					`WARNING: different versions of polygonjs are requested by different scenes (${polygonjsVersion} and ${this._firstPolygonjsVersionFound})`
				);
			}
		} else {
			this._firstPolygonjsVersionFound = polygonjsVersion;
		}

		for (let moduleName of jsFilesManifest.modules) {
			requiredModules.add(moduleName);
		}

		this._viewerDataByElement.set(element, {
			sceneData,
			assetsManifest,
			unzippedData,
		});
		return unzippedData;
	}

	private _POLYGONJS_LOADED = false;
	markPolygonjsAsLoaded() {
		this._POLYGONJS_LOADED = true;
		window.__POLYGONJS_SELF_CONTAINED___POLY__.selfContainedScenesLoader.load(this._viewerDataByElement);
	}

	private async loadPolygonjs(unzippedData: Unzipped, requiredModuleNames: Set<ModuleName>) {
		if (this._POLYGONJS_LOADED) {
			window.__POLYGONJS_SELF_CONTAINED___POLY__.selfContainedScenesLoader.load(this._viewerDataByElement);
			return;
		}

		const polygonjsVersion = this._firstPolygonjsVersionFound;
		if (!polygonjsVersion) {
			console.warn('no version found, polygonjs will not be loaded');
			return;
		}

		if (DEBUG) {
			console.log('loading polygonjsVersion version:', polygonjsVersion);
		}
		const polygonjsUrl = this._createJsBlob(unzippedData[SelfContainedFileName.POLYGONJS], 'polygonjs');
		if (DEBUG) {
			console.log('loading polygonjsUrl', polygonjsUrl);
		}

		const elementId = `polygonjs-module-viewer-script`;
		let script = document.getElementById(elementId);

		const lines: string[] = [];
		lines.push(`import {Poly, SceneJsonImporter} from '${polygonjsUrl}';`);
		requiredModuleNames.forEach((moduleName) => {
			const moduleUrl = this._createJsBlob(unzippedData[`js/modules/${moduleName}.js`], moduleName);

			lines.push(`import {${moduleName}} from '${moduleUrl}';`);
			lines.push(`Poly.modulesRegister.register('${moduleName}', ${moduleName});`);
		});

		// lines.push(`Poly.selfContainedScenesLoader.load(window.__POLYGONJS_VIEWER_LOAD_DATA__, SceneJsonImporter);`);
		lines.push(`window.__POLYGONJS_SELF_CONTAINED___POLY__ = Poly;`);
		lines.push(
			`Poly.selfContainedScenesLoader.markAsLoaded(window.__POLYGONJS_SELF_CONTAINED___MARK_AS_LOADED_CALLBACK__, SceneJsonImporter)`
		);

		if (!script) {
			script = document.createElement('script') as HTMLScriptElement;
			script.setAttribute('type', 'module');
			(script as any).text = lines.join('\n');
			document.body.append(script);
		}
	}

	// from https://javascript.info/fetch-progress
	private async _fetchZipWithProgress(
		response: Response,
		progressCallback: (progress: number, receivedLength: number, contentLength: number) => void
	) {
		const body = response.body;
		const headers = response.headers;
		if (!body) {
			console.error('no body in the response');
			return;
		}
		if (!headers) {
			console.error('no headers in the response');
			return;
		}
		const reader = body.getReader();

		// Step 2: get total length
		const contentLength = parseInt(headers.get('Content-Length') || '0');

		// Step 3: read the data
		let receivedLength = 0; // received that many bytes at the moment
		let chunks: Uint8Array[] = []; // array of received binary chunks (comprises the body)
		while (true) {
			const {done, value} = await reader.read();

			if (done) {
				break;
			}

			if (value) {
				chunks.push(value);
				receivedLength += value.length;
			}
			const progress = receivedLength / contentLength;
			progressCallback(progress, receivedLength, contentLength);
		}

		// Step 4: concatenate chunks into single Uint8Array
		let chunksAll = new Uint8Array(receivedLength); // (4.1)
		let position = 0;
		for (let chunk of chunks) {
			chunksAll.set(chunk, position); // (4.2)
			position += chunk.length;
		}
		return chunksAll;
	}

	private _addProgressBar(element: HTMLElement) {
		const progressBarContainer = document.createElement('div');
		const progressBar = document.createElement('div');
		element.append(progressBarContainer);
		progressBarContainer.append(progressBar);

		progressBarContainer.style.position = 'absolute';
		progressBarContainer.style.left = '0px';
		progressBarContainer.style.top = '0px';
		progressBarContainer.style.width = '100%';
		progressBarContainer.style.height = '4px';
		progressBar.style.position = 'relative';
		progressBar.style.width = '35%';
		progressBar.style.height = '100%';
		progressBar.style.backgroundColor = 'blue';

		return {progressBarContainer, progressBar};
	}
	private _updateProgressBar(progressBar: HTMLElement, progress: number) {
		const percent = Math.floor(progress * 100);
		progressBar.style.width = `${percent}%`;
		if (percent >= 100) {
		}
	}
	private _removeProgressBar(progressBarContainer: HTMLElement) {
		progressBarContainer.parentElement?.removeChild(progressBarContainer);
	}
	private _fadeOutProgressBar(progressBarContainer: HTMLElement) {
		DomEffects.fadeOut(progressBarContainer).then(() => {
			this._removeProgressBar(progressBarContainer);
		});
	}

	private _createJsBlob(array: Uint8Array, filename: string) {
		const blob = new Blob([array]);
		const file = new File([blob], `${filename}.js`, {type: 'application/javascript'});
		var urlCreator = window.URL || window.webkitURL;
		return urlCreator.createObjectURL(file);
	}

	private _setupPoster(element: HTMLElement) {
		const posterUrl = element.getAttribute('poster');
		if (!posterUrl) {
			return;
		}
		const posterElement = document.createElement('div');
		element.append(posterElement);

		const loadingMode = this._loadingMode(element);

		posterElement.setAttribute('data-polygonjs-poster', 'true');
		const style = posterElement.style;
		if (loadingMode == LoadingMode.LAZY) {
			style.cursor = 'pointer';
		}

		style.position = 'absolute';
		style.top = '0px';
		style.left = '0px';
		style.height = '100%';
		style.width = '100%';
		style.backgroundImage = `url('${posterUrl}')`;
		style.backgroundSize = 'cover';
		style.backgroundPosition = 'center center';
	}
}
