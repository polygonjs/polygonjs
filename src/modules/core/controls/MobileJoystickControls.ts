import {CoreMath} from '../../../core/math/_Module';
import {Camera} from 'three';
import {CoreDomUtils} from '../../../core/DomUtils';
import {Euler} from 'three';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {BaseCollisionHandler} from './BaseCollisionHandler';
import {CorePlayer} from '../../../core/player/Player';
import {Spherical} from 'three';
import {isBooleanTrue} from '../../../core/Type';

interface TranslationData {
	direction: Vector3;
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
	rotateSpeed: number;
	rotationRange: RotationRange;
	// translateSpeed: number;
}
export const DEFAULT_PARAMS: MobileJoystickControlsDefaultParams = {
	rotateSpeed: 1,
	rotationRange: {min: -Math.PI * 0.25, max: Math.PI * 0.25},
	// translateSpeed: 0.1,
};
const EVENT_CHANGE = {type: 'change'};
const tmpCameraUnproject = new Vector3();
const spherical = new Spherical();

export class MobileJoystickControls extends BaseCollisionHandler {
	private translationData: TranslationData = {
		direction: new Vector3(),
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
		onJump: this._onJump.bind(this),
		onRunToggle: this._onRunToggle.bind(this),
	};

	private _startCameraRotation = new Euler();
	// private _velocity = new Vector3();
	// private _element: HTMLElement;
	// private _translationSpeed = 4;
	private _rotationSpeed = DEFAULT_PARAMS.rotateSpeed;
	private _rotationRange: RotationRange = {
		min: DEFAULT_PARAMS.rotationRange.min,
		max: DEFAULT_PARAMS.rotationRange.max,
	};
	// private _translationSpeed = DEFAULT_PARAMS.translateSpeed;
	private _azimuthalAngle: number = 0;
	private _translateDomElement: HTMLElement;
	private _translateDomElementRect: DOMRect;
	private _jumpDomElement: HTMLElement;
	private _runDomElement: HTMLElement;
	constructor(private _camera: Camera, private domElement: HTMLElement, private player?: CorePlayer) {
		super();
		// this._element = this._viewer.domElement();
		this._camera.rotation.order = 'ZYX';

		// const clock = new Clock();
		// this._viewer.registerOnBeforeRender(VIEWER_CALLBACK_NAME, () => {
		// 	const deltaTime = Math.min(0.1, clock.getDelta());
		// 	this.update(deltaTime);
		// });
		this._translateDomElement = this._createTranslateDomElement();
		this._translateDomElementRect = this._translateDomElement.getBoundingClientRect();
		this._runDomElement = this._createRunDomElement();
		this._jumpDomElement = this._createJumpDomElement();
		this._addElements();
		this._addEvents();
	}
	dispose() {
		// this._viewer.unRegisterOnBeforeRender(VIEWER_CALLBACK_NAME);
		this._removeEvents();
		this._removeElements();
		this.updateElements();
	}

	private _createTranslateDomElement() {
		const rect = this.domElement.getBoundingClientRect();
		const minDim = Math.min(rect.width, rect.height);
		const size = Math.round(0.4 * minDim);
		const margin = Math.round(0.1 * minDim);
		const element = document.createElement('div');
		element.id = 'MobileJoystickControls-translate';
		element.style.width = `${size}px`;
		element.style.height = element.style.width;
		element.style.border = '1px solid black';
		element.style.borderRadius = `${size}px`;
		element.style.position = 'absolute';
		element.style.bottom = `${margin}px`;
		element.style.left = `${margin}px`;
		return element;
	}

	private _jumpDomElementSize() {
		const rect = this.domElement.getBoundingClientRect();
		const minDim = Math.min(rect.width, rect.height);
		const size = Math.round(0.2 * minDim);
		const margin = Math.round(0.05 * minDim);
		return {size, margin};
	}
	private _createJumpDomElement() {
		const {size, margin} = this._jumpDomElementSize();
		const element = document.createElement('div');
		element.id = 'MobileJoystickControls-jump';
		element.style.width = `${size}px`;
		const height = Math.floor(size);
		element.style.height = `${height}px`;
		element.style.border = '1px solid black';
		element.style.position = 'absolute';
		element.style.bottom = `${2 * margin + parseInt(this._runDomElement.style.height)}px`;
		element.style.right = `${margin}px`;
		element.style.borderRadius = `${height}px`;
		return element;
	}

	private _createRunDomElement() {
		const element = document.createElement('div');
		const rect = this.domElement.getBoundingClientRect();
		const minDim = Math.min(rect.width, rect.height);
		const size = Math.round(0.2 * minDim);
		const margin = Math.round(0.05 * minDim);
		element.id = 'MobileJoystickControls-run';
		element.style.width = `${size}px`;
		element.style.height = `${Math.floor(size)}px`;
		element.style.border = '1px solid black';
		element.style.position = 'absolute';
		element.style.bottom = `${margin}px`;
		element.style.right = `${margin}px`;
		// element.style.translate = `-50%`;
		return element;
	}
	private _addElements() {
		this.domElement.parentElement?.append(this._translateDomElement);
		this.domElement.parentElement?.append(this._jumpDomElement);
		this.domElement.parentElement?.append(this._runDomElement);
	}
	private _removeElements() {
		const elements = [this._translateDomElement, this._jumpDomElement, this._runDomElement];
		for (let element of elements) {
			element.parentElement?.removeChild(element);
		}
	}
	updateElements() {
		if (!this.player) {
			return;
		}
		this._jumpDomElement.style.display = isBooleanTrue(this.player.jumpAllowed) ? 'block' : 'none';
		this._runDomElement.style.display = isBooleanTrue(this.player.runAllowed) ? 'block' : 'none';
	}
	private _addEvents() {
		CoreDomUtils.disableContextMenu();
		this.domElement.addEventListener('touchstart', this._boundMethods.onRotateStart);
		this.domElement.addEventListener('touchmove', this._boundMethods.onRotateMove);
		this.domElement.addEventListener('touchend', this._boundMethods.onRotateEnd);
		this._translateDomElement.addEventListener('touchstart', this._boundMethods.onTranslateStart);
		this._translateDomElement.addEventListener('touchmove', this._boundMethods.onTranslateMove);
		this._translateDomElement.addEventListener('touchend', this._boundMethods.onTranslateEnd);
		this._jumpDomElement.addEventListener('pointerdown', this._boundMethods.onJump);
		this._runDomElement.addEventListener('pointerdown', this._boundMethods.onRunToggle);
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
		this._jumpDomElement.removeEventListener('pointerdown', this._boundMethods.onJump);
		this._runDomElement.removeEventListener('pointerdown', this._boundMethods.onRunToggle);
	}

	setRotationSpeed(speed: number) {
		this._rotationSpeed = speed;
	}
	setRotationRange(range: RotationRange) {
		this._rotationRange.min = range.min;
		this._rotationRange.max = range.max;
	}
	// setTranslationSpeed(speed: number) {
	// 	this._translationSpeed = speed;
	// }

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
		this._computeAzimuthalAngle();
		this.dispatchEvent(EVENT_CHANGE);
	}
	private _computeAzimuthalAngle() {
		this._camera.updateMatrixWorld();
		tmpCameraUnproject.set(0, 0, 1);
		this._camera.localToWorld(tmpCameraUnproject);
		tmpCameraUnproject.sub(this._camera.position);
		spherical.setFromVector3(tmpCameraUnproject);
		this._azimuthalAngle = spherical.theta;
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
		this._translateDomElementRect = this._translateDomElement.getBoundingClientRect();
		const elementCenterX = this._translateDomElementRect.left + this._translateDomElementRect.width * 0.5;
		const elementCenterY = this._translateDomElementRect.top + this._translateDomElementRect.height * 0.5;
		// this._translationStartPosition.set(touch.clientX, touch.clientY);
		this._translationStartPosition.set(elementCenterX, elementCenterY);
	}
	private _onTranslateMove(event: TouchEvent) {
		const touch = this._getTouch(event, this._translateDomElement);
		if (!touch) {
			return;
		}
		this._translationMovePosition.set(touch.clientX, touch.clientY);
		this._translationDelta.copy(this._translationMovePosition).sub(this._translationStartPosition);

		this.translationData.direction.x = (this._translationDelta.x / this._translateDomElementRect.width) * 0.5;
		this.translationData.direction.z = (-this._translationDelta.y / this._translateDomElementRect.height) * 0.5;
		this._updatePlayerTranslate();
		this.dispatchEvent(EVENT_CHANGE);
	}
	private _onTranslateEnd() {
		this.translationData.direction.x = 0;
		this.translationData.direction.z = 0;
		this._updatePlayerTranslate();
	}
	private _updatePlayerTranslate() {
		if (!this.player) {
			return;
		}
		const direction = this.translationData.direction;
		this.player.setForward(false);
		this.player.setBackward(false);
		this.player.setLeft(false);
		this.player.setRight(false);

		const absx = Math.abs(direction.x);
		const absz = Math.abs(direction.z);
		const delta = absz - absx;
		function checkZ(player: CorePlayer) {
			if (direction.z > 0) {
				player.setForward(true);
			}
			if (direction.z < 0) {
				player.setBackward(true);
			}
		}
		function checkX(player: CorePlayer) {
			if (direction.x > 0) {
				player.setRight(true);
			}
			if (direction.x < 0) {
				player.setLeft(true);
			}
		}
		if (delta > 0) {
			// if delta > 0, we have dir.z > dir.x,
			// and we therefore move in z first
			checkZ(this.player);
			if (delta < absz * 0.5) {
				// if dir.x and dir.z are close, we move in diagonal
				checkX(this.player);
			}
		} else {
			checkX(this.player);
			if (delta < absx * 0.5) {
				// if dir.x and dir.z are close, we move in diagonal
				checkZ(this.player);
			}
		}
	}
	private _onJump() {
		this.player?.jump();
	}
	private _onRunToggle() {
		if (!this.player) {
			return;
		}
		const runState = this.player.running();
		this.player.setRun(!runState);
		const borderSize = this.player.running() ? 3 : 1;
		this._runDomElement.style.border = `${borderSize}px solid black`;
	}

	update(delta: number) {
		// this._translateCamera(this.translationData, delta);
		if (this.player) {
			this.player.setAzimuthalAngle(this._azimuthalAngle);
			this.player.update(delta);
		}
	}

	// private _camTmpPost = new Vector3();
	// private _camWorldDir = new Vector3();
	// private _up = new Vector3(0, 1, 0);
	// private _camSideVector = new Vector3();
	// private _translateCamera(data: TranslationData, deltaTime: number) {
	// 	this._camera.getWorldDirection(this._camWorldDir);
	// 	this._camWorldDir.y = 0;
	// 	this._camWorldDir.normalize();
	// 	this._camSideVector.crossVectors(this._up, this._camWorldDir);
	// 	this._camSideVector.normalize();
	// 	this._camSideVector.multiplyScalar(-data.direction.x);
	// 	this._camWorldDir.multiplyScalar(data.direction.y);

	// 	this._velocity.copy(this._camWorldDir);
	// 	this._velocity.add(this._camSideVector);
	// 	const initialHeight = this._camera.position.y;
	// 	this._camTmpPost.copy(this._camera.position);

	// 	if (this._playerCollisionController) {
	// 		// damping
	// 		const damping = 1; //Math.exp(-3 * deltaTime) - 1;
	// 		this._velocity.addScaledVector(this._velocity, damping);
	// 		const deltaPosition = this._velocity.clone().multiplyScalar(deltaTime);
	// 		this._camTmpPost.add(deltaPosition);

	// 		const result = this._playerCollisionController.testPosition(this._camTmpPost);
	// 		if (result) {
	// 			// playerCollider.translate( result.normal.multiplyScalar( result.depth ) );
	// 			this._camTmpPost.add(result.normal.multiplyScalar(result.depth));
	// 		}
	// 		this._camera.position.copy(this._camTmpPost);
	// 	} else {
	// 		this._camTmpPost.add(this._camSideVector);
	// 		this._camTmpPost.add(this._camWorldDir);
	// 		this._camera.position.copy(this._camTmpPost);
	// 	}
	// 	// ensure that the camera never changes y.
	// 	this._camera.position.y = initialHeight;
	// }

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
