import {WebGLRenderer} from 'three';
import {CoreWebXRVRController} from '../webXRVR/CoreWebXRVRController';
import {setErrorStyle} from './Common';

interface SessionInitOptions extends XRSessionInit {}

interface CoreVRButtonOptions {
	renderer: WebGLRenderer;
	controller: CoreWebXRVRController;
}

// adapted from threejs ARButton
//
// modifications:
// - add types
// - move registerSessionGrantedListener to inside .createButton
// - on session start: scene.webXR.setActiveController(scene.webXR.VRController())
// - update element.style.background, element.style.opacity
// - remove element.style.position and element.style.bottom
// - add element.style.margin
// - allow sessionInit override
//

export class CoreVRButton {
	static createButton(options: CoreVRButtonOptions, sessionInit: SessionInitOptions = {}) {
		const {renderer, controller} = options;

		this.registerSessionGrantedListener();

		const button = document.createElement('button');

		function showEnterVR(/*device*/) {
			let currentSession: XRSession | null = null;

			async function onSessionStarted(session: XRSession) {
				session.addEventListener('end', onSessionEnded);

				await renderer.xr.setSession(session);
				button.textContent = 'EXIT VR';

				currentSession = session;
			}

			function onSessionEnded(/*event*/) {
				currentSession?.removeEventListener('end', onSessionEnded);

				button.textContent = 'ENTER VR';

				currentSession = null;
			}

			//

			button.style.display = '';

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% - 50px)';
			button.style.width = '100px';

			button.textContent = 'ENTER VR';

			button.onmouseenter = function () {
				button.style.opacity = '1.0';
			};

			button.onmouseleave = function () {
				button.style.opacity = '0.5';
			};

			button.onclick = function () {
				if (currentSession === null) {
					// WebXR's requestReferenceSpace only works if the corresponding feature
					// was requested at session creation time. For simplicity, just ask for
					// the interesting ones as optional features, but be aware that the
					// requestReferenceSpace call will fail if it turns out to be unavailable.
					// ('local' is always available for immersive sessions and doesn't need to
					// be requested separately.)

					// const sessionInit = {optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers']};
					// navigator.xr?.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
					controller.requestSession(sessionInit, onSessionStarted);
				} else {
					currentSession.end();
				}
			};
		}

		function disableButton() {
			button.style.display = '';

			button.style.cursor = 'auto';
			button.style.left = 'calc(50% - 75px)';
			button.style.width = '150px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;
		}

		function showWebXRNotFound() {
			disableButton();

			button.textContent = 'VR NOT SUPPORTED';
			setErrorStyle(button);
		}

		function showVRNotAllowed(exception: any) {
			disableButton();

			console.warn('Exception when trying to call xr.isSessionSupported', exception);

			button.textContent = 'VR NOT ALLOWED';
			setErrorStyle(button);
		}

		function stylizeElement(element: HTMLElement) {
			element.style.margin = '0px 6px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			element.style.background = 'rgb(16 27 44 / 95%)';
			element.style.color = '#fff';
			element.style.font = 'normal 13px sans-serif';
			element.style.textAlign = 'center';
			element.style.opacity = '0.8';
			element.style.outline = 'none';
			element.style.zIndex = '999';
		}

		if ('xr' in navigator) {
			button.id = 'VRButton';
			button.style.display = 'none';

			stylizeElement(button);

			navigator.xr
				?.isSessionSupported('immersive-vr')
				.then(function (supported) {
					supported ? showEnterVR() : showWebXRNotFound();

					if (supported && CoreVRButton.xrSessionIsGranted) {
						button.click();
					}
				})
				.catch(showVRNotAllowed);

			return button;
		} else {
			const message = document.createElement('a');

			if (window.isSecureContext === false) {
				message.href = document.location.href.replace(/^http:/, 'https:');
				message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message
			} else {
				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';
			}

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement(message);
			setErrorStyle(message);

			return message;
		}
	}

	static xrSessionIsGranted = false;

	static registerSessionGrantedListener() {
		if ('xr' in navigator) {
			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if (/WebXRViewer\//i.test(navigator.userAgent)) return;

			navigator.xr?.addEventListener('sessiongranted', () => {
				CoreVRButton.xrSessionIsGranted = true;
			});
		}
	}
}
