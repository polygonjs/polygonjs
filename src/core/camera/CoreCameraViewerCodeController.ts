import {Camera} from 'three';
import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {StringParamLanguage} from '../../engine/params/utils/OptionsController';
import {Constructor} from '../../types/GlobalTypes';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';

export function CoreCameraViewerCodeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param viewerId */
		viewerId = ParamConfig.STRING('my-viewer');
		/** @param shadow root */
		// shadowRoot = ParamConfig.BOOLEAN(false);
		/** @param HTML */
		html = ParamConfig.STRING('', {
			language: StringParamLanguage.HTML,
		});
	};
}

interface CreateViewerCodeOptions {
	camera: Camera;
}
interface ViewerConfigOptions {
	viewerId: string;
	// shadowRoot: boolean;
	html: string;
}
interface CreateViewerElementOptions {
	domElement: HTMLElement;
	canvas: HTMLCanvasElement;
	CSSClass: string;
}
export class ViewerCodeConfig {
	constructor(public readonly options: ViewerConfigOptions) {}
	createViewerElement(options: CreateViewerElementOptions) {
		const {viewerId, html} = this.options;
		const {domElement, canvas, CSSClass} = options;
		const _container = document.createElement('div');
		// function _createShadow(element: HTMLElement) {
		// 	element.attachShadow({mode: 'open'});
		// 	return element;
		// }
		const container = _container; //shadowRoot == true ? _createShadow(_container) : _container;
		container.style.height = '100%';
		container.innerHTML = html;
		domElement?.appendChild(container);
		container.classList.add(CSSClass);
		const viewerElement = container.querySelector(`#${viewerId}`);
		if (!viewerElement) {
			console.error(`failed to find element with id ${viewerId}`);
			return;
		}
		viewerElement.appendChild(canvas);

		// since <script> tags add with .innerHTML are not run,
		// we need to force them
		function executeScriptElements(containerElement: HTMLElement | ShadowRoot) {
			const scriptElements = containerElement.querySelectorAll('script');

			Array.from(scriptElements).forEach((scriptElement) => {
				const clonedElement = document.createElement('script');

				Array.from(scriptElement.attributes).forEach((attribute) => {
					clonedElement.setAttribute(attribute.name, attribute.value);
				});

				clonedElement.text = scriptElement.text;

				scriptElement.parentNode?.replaceChild(clonedElement, scriptElement);
			});
		}
		executeScriptElements(container);

		return viewerElement;
	}
}

export class CoreCameraViewerCodeController {
	static viewerCodeConfig(options: CreateViewerCodeOptions): ViewerCodeConfig | undefined {
		const {camera} = options;

		const viewerId = CoreObject.attribValue(camera, CameraAttribute.VIEWER_ID) as string | null;
		// const shadowRoot = CoreObject.attribValue(camera, CameraAttribute.VIEWER_SHADOW_ROOT) as boolean | null;
		const html = CoreObject.attribValue(camera, CameraAttribute.VIEWER_HTML) as string | null;
		if (viewerId == null || html == null) {
			return;
		}

		return new ViewerCodeConfig({viewerId, html});
	}
}
