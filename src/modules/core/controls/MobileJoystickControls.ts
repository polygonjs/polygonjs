import {CoreMath} from '../../../core/math/_Module';
import {Object3DWithGeometry} from '../../../core/geometry/Group';
import {Camera} from 'three/src/cameras/Camera';
import {PlayerCollisionController} from './collisions/PlayerCollisionsController';
import {CoreDomUtils} from '../../../core/DomUtils';
import {Euler} from 'three/src/math/Euler';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Capsule} from 'three/examples/jsm/math/Capsule';
import {EventDispatcher} from 'three/src/core/EventDispatcher';

interface TranslationData {
	direction: {x: number; y: number};
}
interface RotationData {
	direction: {x: number; y: number};
}

interface RotationRange {
	min: number;
	max: number;
}

// const VIEWER_CALLBACK_NAME = 'mobile-nav';
interface MobileJoystickControlsDefaultParams {
	rotationSpeed: number;
	rotationRange: RotationRange;
	translationSpeed: number;
}
export const DEFAULT_PARAMS: MobileJoystickControlsDefaultParams = {
	rotationSpeed: 1,
	rotationRange: {min: -Math.PI * 0.25, max: Math.PI * 0.25},
	translationSpeed: 0.1,
};
const EVENT_CHANGE = {type: 'change'};

export class MobileJoystickControls extends EventDispatcher {
	private translationData: TranslationData = {
		direction: {x: 0, y: 0},
	};
	private rotationData: RotationData = {
		direction: {x: 0, y: 0},
	};
	private _boundMethods = {
		onRotateStart: this._onRotateStart.bind(this),
		onRotateMove: this._onRotateMove.bind(this),
		onRotateEnd: this._onRotateEnd.bind(this),
		onTranslateStart: this._onTranslateStart.bind(this),
		onTranslateMove: this._onTranslateMove.bind(this),
		onTranslateEnd: this._onTranslateEnd.bind(this),
	};

	private _startCameraRotation = new Euler();
	private _velocity = new Vector3();
	// private _element: HTMLElement;
	private _playerCollisionController: PlayerCollisionController | undefined;
	// private _translationSpeed = 4;
	private _rotationSpeed = DEFAULT_PARAMS.rotationSpeed;
	private _rotationRange: RotationRange = {
		min: DEFAULT_PARAMS.rotationRange.min,
		max: DEFAULT_PARAMS.rotationRange.max,
	};
	private _translationSpeed = DEFAULT_PARAMS.translationSpeed;

	constructor(private _camera: Camera, private domElement: HTMLElement) {
		super();
		// this._element = this._viewer.domElement();
		this._camera.rotation.order = 'ZYX';

		// const clock = new Clock();
		// this._viewer.registerOnBeforeRender(VIEWER_CALLBACK_NAME, () => {
		// 	const deltaTime = Math.min(0.1, clock.getDelta());
		// 	this.update(deltaTime);
		// });
		this._addEvents();
	}
	dispose() {
		// this._viewer.unRegisterOnBeforeRender(VIEWER_CALLBACK_NAME);
		this._removeEvents();
	}
	private _translateDomElement = this._createTranslateDomElement();
	private _translateDomElementRect: DOMRect = this._translateDomElement.getBoundingClientRect();
	private _createTranslateDomElement() {
		const element = document.createElement('div');
		const rect = this.domElement.getBoundingClientRect();
		const minDim = Math.min(rect.width, rect.height);
		const size = Math.round(0.4 * minDim);
		const margin = Math.round(0.1 * minDim);
		element.style.width = `${size}px`;
		element.style.height = element.style.width;
		element.style.border = '1px solid black';
		element.style.borderRadius = `${size}px`;
		element.style.position = 'absolute';
		element.style.bottom = `${margin}px`;
		element.style.left = `${margin}px`;
		return element;
	}
	private _addEvents() {
		CoreDomUtils.disableContextMenu();
		this.domElement.addEventListener('touchstart', this._boundMethods.onRotateStart);
		this.domElement.addEventListener('touchmove', this._boundMethods.onRotateMove);
		this.domElement.addEventListener('touchend', this._boundMethods.onRotateEnd);
		this._translateDomElement.addEventListener('touchstart', this._boundMethods.onTranslateStart);
		this._translateDomElement.addEventListener('touchmove', this._boundMethods.onTranslateMove);
		this._translateDomElement.addEventListener('touchend', this._boundMethods.onTranslateEnd);
		this.domElement.parentElement?.append(this._translateDomElement);
	}
	private _removeEvents() {
		// TODO: ideally the viewer should know that
		// its element should have no context menu callback
		// if no mobile controls is attached. So the viewer should be in control
		// of re-establishing the event
		CoreDomUtils.reEstablishContextMenu();
		this.domElement.removeEventListener('touchstart', this._boundMethods.onRotateStart);
		this.domElement.removeEventListener('touchmove', this._boundMethods.onRotateMove);
		this.domElement.removeEventListener('touchend', this._boundMethods.onRotateEnd);
		this._translateDomElement.removeEventListener('touchstart', this._boundMethods.onTranslateStart);
		this._translateDomElement.removeEventListener('touchmove', this._boundMethods.onTranslateMove);
		this._translateDomElement.removeEventListener('touchend', this._boundMethods.onTranslateEnd);
		this.domElement.parentElement?.removeChild(this._translateDomElement);
	}

	setRotationSpeed(speed: number) {
		this._rotationSpeed = speed;
	}
	setRotationRange(range: RotationRange) {
		this._rotationRange.min = range.min;
		this._rotationRange.max = range.max;
	}
	setTranslationSpeed(speed: number) {
		this._translationSpeed = speed;
		console.log('this._translationSpeed', this._translationSpeed);
	}

	// setPlayerCollisionController(playerCollisionController: PlayerCollisionController) {
	// 	this._playerCollisionController = playerCollisionController;
	// }
	setCheckCollisions(collisionObject?: Object3D) {
		if (collisionObject) {
			let objectWithGeo: Object3DWithGeometry | undefined;
			collisionObject.traverse((child) => {
				if (!objectWithGeo) {
					const mesh = child as Mesh;
					if (mesh.geometry) {
						objectWithGeo = mesh;
					}
				}
			});
			if (objectWithGeo) {
				this._playerCollisionController = new PlayerCollisionController(objectWithGeo);
			} else {
				console.error('no geo found in', collisionObject);
			}
		} else {
			this._playerCollisionController = undefined;
		}
	}
	setCollisionCapsule(capsule: Capsule) {
		this._playerCollisionController?.setCapsule(capsule);
	}

	//
	//
	// ROTATE
	//
	//
	private vLeft = new Vector3();
	private vRight = new Vector3();
	private vTop = new Vector3();
	private vBottom = new Vector3();
	private angleY = 0;
	private angleX = 0;
	private _rotationStartPosition = new Vector2();
	private _rotationMovePosition = new Vector2();
	private _rotationDelta = new Vector2();
	private _onRotateStart(event: TouchEvent) {
		this._startCameraRotation.copy(this._camera.rotation);
		const touch = this._getTouch(event, this.domElement);
		if (!touch) {
			return;
		}
		this._rotationStartPosition.set(touch.clientX, touch.clientY);

		// x pan for rotation y
		this.vLeft.set(-1, 0, 0.5);
		this.vRight.set(1, 0, 0.5);
		[this.vLeft, this.vRight].forEach((v) => {
			v.unproject(this._camera);

			this._camera.worldToLocal(v);
		});
		this.angleY = this.vLeft.angleTo(this.vRight);
		// y pan for rotation x
		this.vTop.set(0, 1, 0.5);
		this.vBottom.set(0, -1, 0.5);
		[this.vTop, this.vBottom].forEach((v) => {
			v.unproject(this._camera);

			this._camera.worldToLocal(v);
		});
		this.angleX = this.vTop.angleTo(this.vBottom);
	}
	private _onRotateMove(event: TouchEvent) {
		const touch = this._getTouch(event, this.domElement);
		if (!touch) {
			return;
		}
		this._rotationMovePosition.set(touch.clientX, touch.clientY);
		this._rotationDelta.copy(this._rotationMovePosition).sub(this._rotationStartPosition);
		// delta.normalize();
		this.rotationData.direction.x = this._rotationDelta.x / this.domElement.clientWidth;
		this.rotationData.direction.y = this._rotationDelta.y / this.domElement.clientHeight;
		// rotateData.speed = delta.length();
		this._rotateCamera(this.rotationData);
	}
	private _onRotateEnd() {
		this.rotationData.direction.x = 0;
		this.rotationData.direction.y = 0;
	}
	private _rotateCamera(rotationData: RotationData) {
		const INVERT_Y = true;
		const INVERT_X = INVERT_Y;

		let angleY = this.angleY * rotationData.direction.x * this._rotationSpeed;
		this._camera.rotation.y = this._startCameraRotation.y + (INVERT_Y ? -angleY : angleY);
		let angleX = this.angleX * rotationData.direction.y * this._rotationSpeed;

		// apply bound
		this._camera.rotation.x = CoreMath.clamp(
			this._startCameraRotation.x + (INVERT_X ? -angleX : angleX),
			this._rotationRange.min,
			this._rotationRange.max
		);
		this.dispatchEvent(EVENT_CHANGE);
	}
	//
	//
	// TRANSLATE
	//
	//
	private _startCameraPosition = new Vector3();
	private _translationStartPosition = new Vector2();
	private _translationMovePosition = new Vector2();
	private _translationDelta = new Vector2();

	private _onTranslateStart(event: TouchEvent) {
		this._startCameraPosition.copy(this._camera.position);
		const touch = this._getTouch(event, this._translateDomElement);
		if (!touch) {
			return;
		}
		this._translationStartPosition.set(touch.clientX, touch.clientY);
		this._translateDomElementRect = this._translateDomElement.getBoundingClientRect();
	}
	private _onTranslateMove(event: TouchEvent) {
		const touch = this._getTouch(event, this._translateDomElement);
		if (!touch) {
			return;
		}
		this._translationMovePosition.set(touch.clientX, touch.clientY);
		this._translationDelta.copy(this._translationMovePosition).sub(this._translationStartPosition);

		this.translationData.direction.x =
			(this._translationSpeed * this._translationDelta.x) / this._translateDomElementRect.width;
		this.translationData.direction.y =
			(this._translationSpeed * -this._translationDelta.y) / this._translateDomElementRect.height;
		this.dispatchEvent(EVENT_CHANGE);
	}
	private _onTranslateEnd() {
		this.translationData.direction.x = 0;
		this.translationData.direction.y = 0;
	}

	private prevTime = performance.now();
	update() {
		const time = performance.now();
		const deltaTime = time - this.prevTime;
		this.prevTime = time;
		this._translateCamera(this.translationData, deltaTime);
	}

	private _camTmpPost = new Vector3();
	private _camWorldDir = new Vector3();
	private _up = new Vector3(0, 1, 0);
	private _camSideVector = new Vector3();
	private _translateCamera(data: TranslationData, deltaTime: number) {
		this._camera.getWorldDirection(this._camWorldDir);
		this._camWorldDir.y = 0;
		this._camWorldDir.normalize();
		this._camSideVector.crossVectors(this._up, this._camWorldDir);
		this._camSideVector.normalize();
		this._camSideVector.multiplyScalar(-data.direction.x);
		this._camWorldDir.multiplyScalar(data.direction.y);

		this._velocity.copy(this._camWorldDir);
		this._velocity.add(this._camSideVector);
		const initialHeight = this._camera.position.y;
		this._camTmpPost.copy(this._camera.position);

		if (this._playerCollisionController) {
			// damping
			const damping = 1; //Math.exp(-3 * deltaTime) - 1;
			this._velocity.addScaledVector(this._velocity, damping);
			const deltaPosition = this._velocity.clone().multiplyScalar(deltaTime);
			this._camTmpPost.add(deltaPosition);

			const result = this._playerCollisionController.testPosition(this._camTmpPost);
			if (result) {
				// playerCollider.translate( result.normal.multiplyScalar( result.depth ) );
				this._camTmpPost.add(result.normal.multiplyScalar(result.depth));
			}
			this._camera.position.copy(this._camTmpPost);
		} else {
			this._camTmpPost.add(this._camSideVector);
			this._camTmpPost.add(this._camWorldDir);
			this._camera.position.copy(this._camTmpPost);
		}
		// ensure that the camera never changes y.
		this._camera.position.y = initialHeight;
	}

	//
	//
	// UTILS
	//
	//
	private _getTouch(event: TouchEvent, element: HTMLElement) {
		for (let i = 0; i < event.touches.length; i++) {
			const touch = event.touches[i];
			if (touch.target === element) {
				return touch;
			}
		}
	}
}
