import {WebGLRenderer} from 'three';
import {CoreWebXRARController} from '../webXRAR/CoreWebXRARController';
import {applyDefaultStyle, createInfoLink, disableButtonElement, setErrorStyle} from './Common';

interface SessionInitOptions extends XRSessionInit {
	domOverlay?: {root: HTMLElement};
	// draft spec: https://github.com/immersive-web/marker-tracking/blob/main/explainer.md
	// trackedImages: [
	// 	{
	// 		image: ImageBitmap;
	// 		widthInMeters: number;
	// 	}
	// ];
}

interface CoreARButtonOptions {
	renderer: WebGLRenderer;
	controller: CoreWebXRARController;
}

// adapted from threejs ARButton
//
// modifications:
// - add types
// - update element.style.background, element.style.opacity
// - remove element.style.position and element.style.bottom
// - add element.style.margin
// - controller requests the session to have more controls over what should be initialized just before
//

export class CoreARButton {
	static createButton(options: CoreARButtonOptions, sessionInit: SessionInitOptions) {
		const {renderer, controller} = options;
		const button = document.createElement('button');

		function showStartAR(/*device*/) {
			if (sessionInit.domOverlay === undefined) {
				const overlay = document.createElement('div');
				overlay.style.display = 'none';
				document.body.appendChild(overlay);

				const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttribute('width', '38');
				svg.setAttribute('height', '38');
				svg.style.position = 'absolute';
				svg.style.right = '20px';
				svg.style.top = '20px';
				svg.addEventListener('click', function () {
					currentSession?.end();
				});
				overlay.appendChild(svg);

				const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				path.setAttribute('d', 'M 12,12 L 28,28 M 28,12 12,28');
				path.setAttribute('stroke', '#fff');
				path.setAttribute('stroke-width', '2');
				svg.appendChild(path);

				if (sessionInit.optionalFeatures === undefined) {
					sessionInit.optionalFeatures = [];
				}

				sessionInit.optionalFeatures.push('dom-overlay');
				sessionInit.domOverlay = {root: overlay};
			}

			//

			let currentSession: XRSession | null = null;

			async function onSessionStarted(session: XRSession) {
				session.addEventListener('end', onSessionEnded);

				renderer.xr.setReferenceSpaceType('local');

				await renderer.xr.setSession(session);

				button.textContent = 'STOP AR';
				if (sessionInit.domOverlay) {
					sessionInit.domOverlay.root.style.display = '';
				}

				currentSession = session;
			}

			function onSessionEnded(/*event*/) {
				if (!currentSession) {
					return;
				}

				currentSession.removeEventListener('end', onSessionEnded);

				button.textContent = 'START AR';
				if (sessionInit.domOverlay) {
					sessionInit.domOverlay.root.style.display = 'none';
				}

				currentSession = null;
			}

			//

			button.style.display = '';

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% - 50px)';
			button.style.width = '100px';
			button.style.backgroundColor = '#222';

			button.textContent = 'START AR';

			button.onmouseenter = function () {
				button.style.opacity = '1.0';
			};

			button.onmouseleave = function () {
				button.style.opacity = '0.5';
			};

			button.onclick = function () {
				if (currentSession === null) {
					controller.requestSession(sessionInit, onSessionStarted);
				} else {
					currentSession.end();
				}
			};
		}

		function disableButton() {
			disableButtonElement(button);
		}

		function showARNotSupported() {
			disableButton();

			button.textContent = 'AR NOT SUPPORTED';
			setErrorStyle(button);
		}

		function showARNotAllowed(exception: any) {
			disableButton();

			console.warn('Exception when trying to call xr.isSessionSupported', exception);

			button.textContent = 'AR NOT ALLOWED';
			setErrorStyle(button);
		}

		function stylizeElement(element: HTMLElement) {
			applyDefaultStyle(element);
			element.style.background = 'rgb(20 61 24 / 95%)';
		}

		if ('xr' in navigator) {
			button.id = 'ARButton';
			button.style.display = 'none';

			stylizeElement(button);

			navigator.xr
				?.isSessionSupported('immersive-ar')
				.then(function (supported) {
					supported ? showStartAR() : showARNotSupported();
				})
				.catch(showARNotAllowed);

			return button;
		} else {
			const message = createInfoLink();
			stylizeElement(message);
			setErrorStyle(message);

			return message;
		}
	}
}
