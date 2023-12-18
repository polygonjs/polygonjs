import {EventDispatcher, Vector2, Vector3, Box3, TOUCH, MOUSE, BaseEvent} from 'three';
import type {Camera, PerspectiveCamera, OrthographicCamera, Matrix4} from 'three';

const _changeEvent: BaseEvent<'change'> = {type: 'change'};
const _startEvent: BaseEvent<'start'> = {type: 'start'};
const _endEvent: BaseEvent<'end'> = {type: 'end'};

const STATE = {
	NONE: -1,
	// ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	// TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	// TOUCH_DOLLY_ROTATE: 6,
};
interface MouseButtons {
	LEFT: MOUSE | null;
	MIDDLE: MOUSE | null;
	RIGHT: MOUSE | null;
}

interface Touches {
	ONE: TOUCH | null;
	TWO: TOUCH | null;
}
const EPS = 0.000001;
export class PanZoomControls extends EventDispatcher<{change: any}> {
	public enabled = true;
	public enablePan = true;
	public enableZoom = true;
	public enableDamping: boolean = true;
	public dampingFactor: number = 0.05;
	public panSpeed: number = 1;
	public minZoom = 0.1;
	public maxZoom = 50;
	public zoomSpeed = 1.0;
	public screenSpacePanning = true;
	public zoomToCursor = true;
	public panThreshold: number = 5;
	private _panThresholdDistanceTotal: number = 0;
	public clampPosition: boolean = false;
	public positionBounds = new Box3(
		new Vector3(-Infinity, -Infinity, -Infinity),
		new Vector3(+Infinity, +Infinity, +Infinity)
	);
	public mouseButtons: MouseButtons = {LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN};
	public touches: Touches = {ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN};
	public dispose: () => void;
	public update: (delta: number | null) => void;
	constructor(public readonly object: Camera, public readonly domElement: HTMLElement) {
		super();

		const panStart = new Vector2();
		const panEnd = new Vector2();
		const panDelta = new Vector2();
		const panOffset = new Vector3();

		const dollyStart = new Vector2();
		const dollyEnd = new Vector2();
		const dollyDelta = new Vector2();

		this.domElement.style.touchAction = 'none'; // disable touch scroll
		const pointers: PointerEvent[] = [];
		const pointerPositions: Record<number, Vector2> = {};

		let state = STATE.NONE;
		let scale = 1;

		const dollyDirection = new Vector3();
		const mouse = new Vector2();
		let performCursorZoom = false;

		//
		const mouseBefore = new Vector3(0, 0, 0);
		const mouseAfter = new Vector3(0, 0, 0);

		// const spherical = new Spherical();
		// const sphericalDelta = new Spherical();

		// const clampDistance=(dist:number)=>{
		// 	return Math.max(this.minDistance, Math.min(this.maxDistance, dist));
		// }

		const getZoomScale = () => {
			return Math.pow(0.95, this.zoomSpeed);
		};

		function addPointer(event: PointerEvent) {
			pointers.push(event);
		}
		function removePointer(event: PointerEvent) {
			delete pointerPositions[event.pointerId];

			for (let i = 0; i < pointers.length; i++) {
				if (pointers[i].pointerId == event.pointerId) {
					pointers.splice(i, 1);
					return;
				}
			}
		}
		function trackPointer(event: PointerEvent) {
			let position = pointerPositions[event.pointerId];

			if (position === undefined) {
				position = new Vector2();
				pointerPositions[event.pointerId] = position;
			}

			position.set(event.pageX, event.pageY);
		}

		const onContextMenu = (event: Event) => {
			if (this.enabled === false) return;

			event.preventDefault();
		};

		const onPointerDown = (event: PointerEvent) => {
			if (this.enabled === false) return;

			if (pointers.length === 0) {
				this.domElement.setPointerCapture(event.pointerId);

				this.domElement.ownerDocument.addEventListener('pointermove', onPointerMove);
				this.domElement.ownerDocument.addEventListener('pointerup', onPointerUp);
			}

			//

			addPointer(event);

			if (event.pointerType === 'touch') {
				onTouchStart(event);
			} else {
				onMouseDown(event);
			}
		};
		const onPointerMove = (event: PointerEvent) => {
			if (this.enabled === false) return;

			if (event.pointerType === 'touch') {
				onTouchMove(event);
			} else {
				onMouseMove(event);
			}
		};
		const onPointerUp = (event: PointerEvent) => {
			removePointer(event);

			if (pointers.length === 0) {
				this.domElement.releasePointerCapture(event.pointerId);

				this.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove);
				this.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
			}

			this.dispatchEvent(_endEvent);

			state = STATE.NONE;
		};
		const getSecondPointerPosition = (event: PointerEvent) => {
			const pointer = event.pointerId === pointers[0].pointerId ? pointers[1] : pointers[0];

			return pointerPositions[pointer.pointerId];
		};

		const handleTouchStartPan = () => {
			if (pointers.length === 1) {
				panStart.set(pointers[0].pageX, pointers[0].pageY);
			} else {
				const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				panStart.set(x, y);
			}
			this._panThresholdDistanceTotal = 0;
		};
		const handleTouchStartDolly = () => {
			const dx = pointers[0].pageX - pointers[1].pageX;
			const dy = pointers[0].pageY - pointers[1].pageY;

			const distance = Math.sqrt(dx * dx + dy * dy);

			dollyStart.set(0, distance);
		};
		const handleTouchStartDollyPan = () => {
			if (this.enableZoom) handleTouchStartDolly();

			if (this.enablePan) handleTouchStartPan();
		};
		const handleMouseDownDolly = (event: PointerEvent) => {
			updateMouseParameters(event);
			dollyStart.set(event.clientX, event.clientY);
		};

		const handleMouseDownPan = (event: PointerEvent) => {
			panStart.set(event.clientX, event.clientY);
			this._panThresholdDistanceTotal = 0;
		};
		const handleTouchMovePan = (event: PointerEvent) => {
			if (pointers.length === 1) {
				panEnd.set(event.pageX, event.pageY);
			} else {
				const position = getSecondPointerPosition(event);

				const x = 0.5 * (event.pageX + position.x);
				const y = 0.5 * (event.pageY + position.y);

				panEnd.set(x, y);
			}

			panDelta.subVectors(panEnd, panStart).multiplyScalar(this.panSpeed);
			this._panThresholdDistanceTotal += panDelta.length();
			if (this._panThresholdDistanceTotal > this.panThreshold) {
				pan(panDelta.x, panDelta.y);
			}

			panStart.copy(panEnd);
		};
		const handleTouchMoveDolly = (event: PointerEvent) => {
			const position = getSecondPointerPosition(event);

			const dx = event.pageX - position.x;
			const dy = event.pageY - position.y;

			const distance = Math.sqrt(dx * dx + dy * dy);

			dollyEnd.set(0, distance);

			dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, this.zoomSpeed));

			dollyOut(dollyDelta.y);

			dollyStart.copy(dollyEnd);
		};
		const handleTouchMoveDollyPan = (event: PointerEvent) => {
			if (this.enableZoom) handleTouchMoveDolly(event);

			if (this.enablePan) handleTouchMovePan(event);
		};
		const handleMouseMoveDolly = (event: PointerEvent) => {
			dollyEnd.set(event.clientX, event.clientY);

			dollyDelta.subVectors(dollyEnd, dollyStart);

			if (dollyDelta.y > 0) {
				dollyOut(getZoomScale());
			} else if (dollyDelta.y < 0) {
				dollyIn(getZoomScale());
			}

			dollyStart.copy(dollyEnd);

			this.update(null);
		};

		const handleMouseMovePan = (event: PointerEvent) => {
			panEnd.set(event.clientX, event.clientY);

			panDelta.subVectors(panEnd, panStart).multiplyScalar(this.panSpeed);

			this._panThresholdDistanceTotal += panDelta.length();
			if (this._panThresholdDistanceTotal > this.panThreshold) {
				pan(panDelta.x, panDelta.y);
			}

			panStart.copy(panEnd);

			this.update(null);
		};

		const dollyOut = (dollyScale: number) => {
			if (
				(this.object as PerspectiveCamera).isPerspectiveCamera ||
				(this.object as OrthographicCamera).isOrthographicCamera
			) {
				scale /= dollyScale;
			} else {
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
				this.enableZoom = false;
			}
		};

		const dollyIn = (dollyScale: number) => {
			if (
				(this.object as PerspectiveCamera).isPerspectiveCamera ||
				(this.object as OrthographicCamera).isOrthographicCamera
			) {
				scale *= dollyScale;
			} else {
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
				this.enableZoom = false;
			}
		};
		const handleMouseWheel = (event: WheelEvent) => {
			updateMouseParameters(event);

			if (event.deltaY < 0) {
				dollyIn(getZoomScale());
			} else if (event.deltaY > 0) {
				dollyOut(getZoomScale());
			}

			this.update(null);
		};
		const onMouseWheel = (event: WheelEvent) => {
			if (this.enabled === false || this.enableZoom === false || state !== STATE.NONE) return;

			event.preventDefault();

			this.dispatchEvent(_startEvent);

			handleMouseWheel(event);

			this.dispatchEvent(_endEvent);
		};

		const panLeft = (() => {
			const v = new Vector3();

			const _panLeft = (distance: number, objectMatrix: Matrix4) => {
				v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
				v.multiplyScalar(-distance);

				panOffset.add(v);
			};
			return _panLeft;
		})();

		const panUp = (() => {
			const v = new Vector3();

			const _panUp = (distance: number, objectMatrix: Matrix4) => {
				if (this.screenSpacePanning === true) {
					v.setFromMatrixColumn(objectMatrix, 1);
				} else {
					v.setFromMatrixColumn(objectMatrix, 0);
					v.crossVectors(this.object.up, v);
				}

				v.multiplyScalar(distance);

				panOffset.add(v);
			};
			return _panUp;
		})();

		const pan = (() => {
			// const offset = new Vector3();

			const _pan = (deltaX: number, deltaY: number) => {
				const element = this.domElement;

				if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
					// perspective
					// const position = this.object.position;
					// offset.copy(position).sub(this.target);
					// let targetDistance = offset.length();

					// // half of the fov is center to top of screen
					// targetDistance *= Math.tan((((this.object as PerspectiveCamera).fov / 2) * Math.PI) / 180.0);
					const targetDistance = 1;

					// we use only clientHeight here so aspect ratio does not distort speed
					panLeft((2 * deltaX * targetDistance) / element.clientHeight, this.object.matrix);
					panUp((2 * deltaY * targetDistance) / element.clientHeight, this.object.matrix);
				} else if ((this.object as OrthographicCamera).isOrthographicCamera) {
					// orthographic
					panLeft(
						(deltaX *
							((this.object as OrthographicCamera).right - (this.object as OrthographicCamera).left)) /
							(this.object as OrthographicCamera).zoom /
							element.clientWidth,
						this.object.matrix
					);
					panUp(
						(deltaY *
							((this.object as OrthographicCamera).top - (this.object as OrthographicCamera).bottom)) /
							(this.object as OrthographicCamera).zoom /
							element.clientHeight,
						this.object.matrix
					);
				} else {
					// camera neither orthographic nor perspective
					console.warn('WARNING: PanZoomControls.js encountered an unknown camera type - pan disabled.');
					this.enablePan = false;
				}
			};
			return _pan;
		})();

		const updateMouseParameters = (event: PointerEvent | WheelEvent) => {
			if (!this.zoomToCursor) {
				return;
			}
			performCursorZoom = true;
			const rect = this.domElement.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const w = rect.width;
			const h = rect.height;
			mouse.x = (x / w) * 2 - 1;
			mouse.y = -(y / h) * 2 + 1;
			dollyDirection.set(mouse.x, mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
		};

		const onTouchStart = (event: PointerEvent) => {
			trackPointer(event);

			switch (pointers.length) {
				case 1:
					switch (this.touches.ONE) {
						// case TOUCH.ROTATE:
						// 	if (this.enableRotate === false) return;

						// 	handleTouchStartRotate();

						// 	state = STATE.TOUCH_ROTATE;

						// 	break;

						case TOUCH.PAN:
							if (this.enablePan === false) return;

							handleTouchStartPan();

							state = STATE.TOUCH_PAN;

							break;

						default:
							state = STATE.NONE;
					}

					break;

				case 2:
					switch (this.touches.TWO) {
						case TOUCH.DOLLY_PAN:
							if (this.enableZoom === false && this.enablePan === false) return;

							handleTouchStartDollyPan();

							state = STATE.TOUCH_DOLLY_PAN;

							break;

						// case TOUCH.DOLLY_ROTATE:
						// 	if (this.enableZoom === false && this.enableRotate === false) return;

						// 	handleTouchStartDollyRotate();

						// 	state = STATE.TOUCH_DOLLY_ROTATE;

						// 	break;

						default:
							state = STATE.NONE;
					}

					break;

				default:
					state = STATE.NONE;
			}

			if (state !== STATE.NONE) {
				this.dispatchEvent(_startEvent);
			}
		};
		const onMouseDown = (event: PointerEvent) => {
			let mouseAction;

			switch (event.button) {
				case 0:
					mouseAction = this.mouseButtons.LEFT;
					break;

				case 1:
					mouseAction = this.mouseButtons.MIDDLE;
					break;

				case 2:
					mouseAction = this.mouseButtons.RIGHT;
					break;

				default:
					mouseAction = -1;
			}

			switch (mouseAction) {
				case MOUSE.DOLLY:
					if (this.enableZoom === false) return;

					handleMouseDownDolly(event);

					state = STATE.DOLLY;

					break;

				// case MOUSE.ROTATE:
				// 	// when using the physical player,
				// 	// we need to be able to rotate the camera while
				// 	// having shiftKey pressed to run.
				// 	// Therefore the following condition is replaced,
				// 	// so that we only check the modifier key
				// 	// if enablePan is true.
				// 	//
				// 	// if (event.ctrlKey || event.metaKey || event.shiftKey) {
				// 	// if (scope.enablePan === false) return;
				// 	//
				// 	if (scope.enablePan === true && (event.ctrlKey || event.metaKey || event.shiftKey)) {
				// 		handleMouseDownPan(event);

				// 		state = STATE.PAN;
				// 	} else {
				// 		if (scope.enableRotate === false) return;

				// 		handleMouseDownRotate(event);

				// 		state = STATE.ROTATE;
				// 	}

				// 	break;

				case MOUSE.PAN:
					// if (event.ctrlKey || event.metaKey || event.shiftKey) {
					// 	if (this.enableRotate === false) return;

					// 	handleMouseDownRotate(event);

					// 	state = STATE.ROTATE;
					// } else {
					if (this.enablePan === false) return;

					handleMouseDownPan(event);

					state = STATE.PAN;
					// }

					break;

				default:
					state = STATE.NONE;
			}

			if (state !== STATE.NONE) {
				this.dispatchEvent(_startEvent);
			}
		};
		const onTouchMove = (event: PointerEvent) => {
			trackPointer(event);

			switch (state) {
				// case STATE.TOUCH_ROTATE:
				// 	if (this.enableRotate === false) return;

				// 	handleTouchMoveRotate(event);

				// 	this.update();

				// 	break;

				case STATE.TOUCH_PAN:
					if (this.enablePan === false) return;

					handleTouchMovePan(event);

					this.update(null);

					break;

				case STATE.TOUCH_DOLLY_PAN:
					if (this.enableZoom === false && this.enablePan === false) return;

					handleTouchMoveDollyPan(event);

					this.update(null);

					break;

				// case STATE.TOUCH_DOLLY_ROTATE:
				// 	if (this.enableZoom === false && this.enableRotate === false) return;

				// 	handleTouchMoveDollyRotate(event);

				// 	this.update();

				// 	break;

				default:
					state = STATE.NONE;
			}
		};
		const onMouseMove = (event: PointerEvent) => {
			switch (state) {
				// case STATE.ROTATE:
				// 	if (scope.enableRotate === false) return;

				// 	handleMouseMoveRotate(event);

				// 	break;

				case STATE.DOLLY:
					if (this.enableZoom === false) return;

					handleMouseMoveDolly(event);

					break;

				case STATE.PAN:
					if (this.enablePan === false) return;

					handleMouseMovePan(event);

					break;
			}
		};

		this.update = (() => {
			// const offset = new Vector3();

			// so camera.up is the orbit axis
			// const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
			// const quatInverse = quat.clone().invert();

			const lastPosition = new Vector3();
			// const lastQuaternion = new Quaternion();
			// const lastTargetPosition = new Vector3();

			// const twoPI = 2 * Math.PI;

			const _update = (deltaTime: number | null = null) => {
				const position = this.object.position;

				// offset.copy(position).sub(this.target);

				// rotate offset to "y-axis-is-up" space
				// offset.applyQuaternion(quat);

				// angle from z-axis around y-axis
				// spherical.setFromVector3(offset);

				// if (scope.autoRotate && state === STATE.NONE) {
				// 	rotateLeft(getAutoRotationAngle(deltaTime));
				// }

				// if (scope.enableDamping) {
				// 	const thetaDelta = sphericalDelta.theta * scope.dampingFactor;
				// 	const phiDelta = sphericalDelta.phi * scope.dampingFactor;
				// 	spherical.theta += thetaDelta;
				// 	spherical.phi += phiDelta;
				// } else {
				// spherical.theta += sphericalDelta.theta;
				// spherical.phi += sphericalDelta.phi;
				// }

				// restrict theta to be between desired limits

				// let min = this.minAzimuthAngle;
				// let max = this.maxAzimuthAngle;

				// if (isFinite(min) && isFinite(max)) {
				// 	if (min < -Math.PI) min += twoPI;
				// 	else if (min > Math.PI) min -= twoPI;

				// 	if (max < -Math.PI) max += twoPI;
				// 	else if (max > Math.PI) max -= twoPI;

				// 	if (min <= max) {
				// 		spherical.theta = Math.max(min, Math.min(max, spherical.theta));
				// 	} else {
				// 		spherical.theta =
				// 			spherical.theta > (min + max) / 2
				// 				? Math.max(min, spherical.theta)
				// 				: Math.min(max, spherical.theta);
				// 	}
				// }

				// // restrict phi to be between desired limits
				// spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, spherical.phi));

				// spherical.makeSafe();

				// move target to panned location

				if (this.enableDamping === true) {
					this.object.position.addScaledVector(panOffset, this.dampingFactor);
				} else {
					this.object.position.add(panOffset);
				}
				// function _clampTarget() {
				// 	if (this.clampPosition) {
				// 		// scope.targetBounds.copy(scope.positionBounds);
				// 		// scope.targetBounds.min.add(offset);
				// 		// scope.targetBounds.max.add(offset);
				// 		this.target.clamp(this.positionBounds.min, this.positionBounds.max);
				// 		// console.log('clamp target', scope.target.toArray());
				// 	}
				// }
				const _clampPosition = () => {
					if (this.clampPosition) {
						position.clamp(this.positionBounds.min, this.positionBounds.max);
						// console.log('clamp position', position.toArray());
					}
				};
				// _clampTarget();

				// adjust the camera position based on zoom only if we're not zooming to the cursor or if it's an ortho camera
				// we adjust zoom later in these cases
				// if ((this.zoomToCursor && performCursorZoom) || this.object.isOrthographicCamera) {
				// 	spherical.radius = clampDistance(spherical.radius);
				// } else {
				// 	spherical.radius = clampDistance(spherical.radius * scale);
				// }

				// offset.setFromSpherical(spherical);

				// rotate offset back to "camera-up-vector-is-up" space
				// offset.applyQuaternion(quatInverse);

				// position.copy(this.target).add(offset);
				_clampPosition();

				// this.object.lookAt(this.target);

				if (this.enableDamping === true) {
					// sphericalDelta.theta *= 1 - this.dampingFactor;
					// sphericalDelta.phi *= 1 - this.dampingFactor;

					panOffset.multiplyScalar(1 - this.dampingFactor);
				} else {
					// sphericalDelta.set(0, 0, 0);

					panOffset.set(0, 0, 0);
				}

				// adjust camera position
				let zoomChanged = false;
				if (this.zoomToCursor && performCursorZoom) {
					// let newRadius = null;
					if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
						console.warn('zoom currently unsupported for perspective cameras');
						// move the camera down the pointer ray
						// this method avoids floating point error
						// const prevRadius = offset.length();
						// newRadius = clampDistance(prevRadius * scale);

						// const radiusDelta = 0.1; //prevRadius - newRadius;
						// this.object.position.addScaledVector(dollyDirection, radiusDelta);
						// _clampPosition();
						// this.object.updateMatrixWorld();
					} else if ((this.object as OrthographicCamera).isOrthographicCamera) {
						// adjust the ortho camera position based on zoom changes
						mouseBefore.set(mouse.x, mouse.y, 0);
						mouseAfter.set(mouse.x, mouse.y, 0);
						mouseBefore.unproject(this.object);

						(this.object as OrthographicCamera).zoom = Math.max(
							this.minZoom,
							Math.min(this.maxZoom, (this.object as OrthographicCamera).zoom / scale)
						);
						(this.object as OrthographicCamera).updateProjectionMatrix();
						zoomChanged = true;

						mouseAfter.unproject(this.object);

						this.object.position.sub(mouseAfter).add(mouseBefore);
						_clampPosition();
						this.object.updateMatrixWorld();

						// newRadius = offset.length();
					} else {
						console.warn(
							'WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.'
						);
						this.zoomToCursor = false;
					}
				}

				// 	// handle the placement of the target
				// 	if (newRadius !== null) {
				// 		if (this.screenSpacePanning) {
				// 			// position the orbit target in front of the new camera position
				// 			this.target
				// 				.set(0, 0, -1)
				// 				.transformDirection(this.object.matrix)
				// 				.multiplyScalar(newRadius)
				// 				.add(this.object.position);
				// 			_clampTarget();
				// 		} else {
				// 			// get the ray and translation plane to compute target
				// 			_ray.origin.copy(this.object.position);
				// 			_ray.direction.set(0, 0, -1).transformDirection(this.object.matrix);

				// 			// if the camera is 20 degrees above the horizon then don't adjust the focus target to avoid
				// 			// extremely large values
				// 			if (Math.abs(this.object.up.dot(_ray.direction)) < TILT_LIMIT) {
				// 				object.lookAt(this.target);
				// 			} else {
				// 				_plane.setFromNormalAndCoplanarPoint(this.object.up, this.target);
				// 				_ray.intersectPlane(_plane, this.target);
				// 				_clampTarget();
				// 			}
				// 		}
				// 	}
				// } else
				// if ((this.object as OrthographicCamera).isOrthographicCamera) {
				// 	(this.object as OrthographicCamera).zoom = Math.max(
				// 		this.minZoom,
				// 		Math.min(this.maxZoom, (this.object as OrthographicCamera).zoom / scale)
				// 	);
				// 	(this.object as OrthographicCamera).updateProjectionMatrix();
				// 	zoomChanged = true;
				// }

				scale = 1;
				performCursorZoom = false;

				// update condition is:
				// min(camera displacement, camera rotation in radians)^2 > EPS
				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

				if (
					zoomChanged ||
					lastPosition.distanceToSquared(this.object.position) > EPS //||
					// 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ||
					// lastTargetPosition.distanceToSquared(this.target) > 0
				) {
					this.dispatchEvent(_changeEvent);

					lastPosition.copy(this.object.position);
					// lastQuaternion.copy(this.object.quaternion);
					// lastTargetPosition.copy(this.target);

					zoomChanged = false;

					return true;
				}

				return false;
			};
			return _update;
		})();

		this.dispose = () => {
			this.domElement.removeEventListener('contextmenu', onContextMenu);

			this.domElement.removeEventListener('pointerdown', onPointerDown);
			this.domElement.removeEventListener('pointercancel', onPointerUp);
			this.domElement.removeEventListener('wheel', onMouseWheel);

			this.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove);
			this.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);

			// if (scope._domElementKeyEvents !== null) {
			// 	scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
			// 	scope._domElementKeyEvents = null;
			// }

			//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
		};

		this.domElement.addEventListener('contextmenu', onContextMenu);

		this.domElement.addEventListener('pointerdown', onPointerDown);
		this.domElement.addEventListener('pointercancel', onPointerUp);
		this.domElement.addEventListener('wheel', onMouseWheel, {passive: false});
	}
}
