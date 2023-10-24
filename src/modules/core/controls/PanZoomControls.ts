// import {EventDispatcher, Object3D, Vector2, Vector3, Box3, TOUCH, MOUSE} from 'three';
// import type {PerspectiveCamera, OrthographicCamera, Matrix4} from 'three';

// const _changeEvent = {type: 'change'};
// const _startEvent = {type: 'start'};
// const _endEvent = {type: 'end'};

// const STATE = {
// 	NONE: -1,
// 	// ROTATE: 0,
// 	DOLLY: 1,
// 	PAN: 2,
// 	// TOUCH_ROTATE: 3,
// 	TOUCH_PAN: 4,
// 	TOUCH_DOLLY_PAN: 5,
// 	// TOUCH_DOLLY_ROTATE: 6,
// };
// interface MouseButtons {
// 	LEFT: MOUSE;
// 	MIDDLE: MOUSE;
// 	RIGHT: MOUSE;
// }

// interface Touches {
// 	ONE: TOUCH;
// 	TWO: TOUCH;
// }

// export class PanZoomControls extends EventDispatcher {
// 	public enabled = true;
// 	public enablePan = true;
// 	public enableZoom = true;
// 	public panSpeed: number = 1;
// 	public zoomSpeed = 1.0;
// 	public screenSpacePanning = true;
// 	public clampPosition = false;
// 	public positionBounds = new Box3(
// 		new Vector3(-Infinity, -Infinity, -Infinity),
// 		new Vector3(+Infinity, +Infinity, +Infinity)
// 	);
// 	public mouseButtons: MouseButtons = {LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN};
// 	public touches: Touches = {ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN};
// 	constructor(public readonly object: Object3D, public readonly domElement: HTMLElement) {
// 		super();

// 		const panStart = new Vector2();
// 		const panEnd = new Vector2();
// 		const panDelta = new Vector2();
// 		const panOffset = new Vector3();

// 		const dollyStart = new Vector2();
// 		const dollyEnd = new Vector2();
// 		const dollyDelta = new Vector2();

// 		this.domElement.style.touchAction = 'none'; // disable touch scroll
// 		const pointers: PointerEvent[] = [];
// 		const pointerPositions: Record<number, Vector2> = {};

// 		let state = STATE.NONE;
// 		let scale = 1;

// 		const getZoomScale = () => {
// 			return Math.pow(0.95, this.zoomSpeed);
// 		};

// 		function addPointer(event: PointerEvent) {
// 			pointers.push(event);
// 		}
// 		function removePointer(event: PointerEvent) {
// 			delete pointerPositions[event.pointerId];

// 			for (let i = 0; i < pointers.length; i++) {
// 				if (pointers[i].pointerId == event.pointerId) {
// 					pointers.splice(i, 1);
// 					return;
// 				}
// 			}
// 		}
// 		function trackPointer(event: PointerEvent) {
// 			let position = pointerPositions[event.pointerId];

// 			if (position === undefined) {
// 				position = new Vector2();
// 				pointerPositions[event.pointerId] = position;
// 			}

// 			position.set(event.pageX, event.pageY);
// 		}

// 		const onContextMenu = (event: Event) => {
// 			if (this.enabled === false) return;

// 			event.preventDefault();
// 		};

// 		const onPointerDown = (event: PointerEvent) => {
// 			if (this.enabled === false) return;

// 			if (pointers.length === 0) {
// 				this.domElement.setPointerCapture(event.pointerId);

// 				this.domElement.ownerDocument.addEventListener('pointermove', onPointerMove);
// 				this.domElement.ownerDocument.addEventListener('pointerup', onPointerUp);
// 			}

// 			//

// 			addPointer(event);

// 			if (event.pointerType === 'touch') {
// 				onTouchStart(event);
// 			} else {
// 				onMouseDown(event);
// 			}
// 		};
// 		const onPointerMove = (event: PointerEvent) => {
// 			if (this.enabled === false) return;

// 			if (event.pointerType === 'touch') {
// 				onTouchMove(event);
// 			} else {
// 				onMouseMove(event);
// 			}
// 		};
// 		const onPointerUp = (event: PointerEvent) => {
// 			removePointer(event);

// 			if (pointers.length === 0) {
// 				this.domElement.releasePointerCapture(event.pointerId);

// 				this.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove);
// 				this.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
// 			}

// 			this.dispatchEvent(_endEvent);

// 			state = STATE.NONE;
// 		};
// 		const getSecondPointerPosition = (event: PointerEvent) => {
// 			const pointer = event.pointerId === pointers[0].pointerId ? pointers[1] : pointers[0];

// 			return pointerPositions[pointer.pointerId];
// 		};

// 		const handleTouchStartPan = () => {
// 			if (pointers.length === 1) {
// 				panStart.set(pointers[0].pageX, pointers[0].pageY);
// 			} else {
// 				const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
// 				const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

// 				panStart.set(x, y);
// 			}
// 		};
// 		const handleTouchStartDolly = () => {
// 			const dx = pointers[0].pageX - pointers[1].pageX;
// 			const dy = pointers[0].pageY - pointers[1].pageY;

// 			const distance = Math.sqrt(dx * dx + dy * dy);

// 			dollyStart.set(0, distance);
// 		};
// 		const handleTouchStartDollyPan = () => {
// 			if (this.enableZoom) handleTouchStartDolly();

// 			if (this.enablePan) handleTouchStartPan();
// 		};
// 		const handleMouseDownDolly = (event: PointerEvent) => {
// 			updateMouseParameters(event);
// 			dollyStart.set(event.clientX, event.clientY);
// 		};

// 		const handleMouseDownPan = (event: PointerEvent) => {
// 			panStart.set(event.clientX, event.clientY);
// 		};
// 		const handleTouchMovePan = (event: PointerEvent) => {
// 			if (pointers.length === 1) {
// 				panEnd.set(event.pageX, event.pageY);
// 			} else {
// 				const position = getSecondPointerPosition(event);

// 				const x = 0.5 * (event.pageX + position.x);
// 				const y = 0.5 * (event.pageY + position.y);

// 				panEnd.set(x, y);
// 			}

// 			panDelta.subVectors(panEnd, panStart).multiplyScalar(this.panSpeed);

// 			pan(panDelta.x, panDelta.y);

// 			panStart.copy(panEnd);
// 		};
// 		const handleTouchMoveDolly = (event: PointerEvent) => {
// 			const position = getSecondPointerPosition(event);

// 			const dx = event.pageX - position.x;
// 			const dy = event.pageY - position.y;

// 			const distance = Math.sqrt(dx * dx + dy * dy);

// 			dollyEnd.set(0, distance);

// 			dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, this.zoomSpeed));

// 			dollyOut(dollyDelta.y);

// 			dollyStart.copy(dollyEnd);
// 		};
// 		const handleTouchMoveDollyPan = (event: PointerEvent) => {
// 			if (this.enableZoom) handleTouchMoveDolly(event);

// 			if (this.enablePan) handleTouchMovePan(event);
// 		};
// 		const handleMouseMoveDolly = (event: PointerEvent) => {
// 			dollyEnd.set(event.clientX, event.clientY);

// 			dollyDelta.subVectors(dollyEnd, dollyStart);

// 			if (dollyDelta.y > 0) {
// 				dollyOut(getZoomScale());
// 			} else if (dollyDelta.y < 0) {
// 				dollyIn(getZoomScale());
// 			}

// 			dollyStart.copy(dollyEnd);

// 			this.update();
// 		};

// 		const handleMouseMovePan = (event: PointerEvent) => {
// 			panEnd.set(event.clientX, event.clientY);

// 			panDelta.subVectors(panEnd, panStart).multiplyScalar(this.panSpeed);

// 			pan(panDelta.x, panDelta.y);

// 			panStart.copy(panEnd);

// 			this.update();
// 		};

// 		const dollyOut = (dollyScale: number) => {
// 			if (
// 				(this.object as PerspectiveCamera).isPerspectiveCamera ||
// 				(this.object as OrthographicCamera).isOrthographicCamera
// 			) {
// 				scale /= dollyScale;
// 			} else {
// 				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
// 				this.enableZoom = false;
// 			}
// 		};

// 		const dollyIn = (dollyScale: number) => {
// 			if (
// 				(this.object as PerspectiveCamera).isPerspectiveCamera ||
// 				(this.object as OrthographicCamera).isOrthographicCamera
// 			) {
// 				scale *= dollyScale;
// 			} else {
// 				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
// 				this.enableZoom = false;
// 			}
// 		};
// 		const handleMouseWheel = (event: WheelEvent) => {
// 			updateMouseParameters(event);

// 			if (event.deltaY < 0) {
// 				dollyIn(getZoomScale());
// 			} else if (event.deltaY > 0) {
// 				dollyOut(getZoomScale());
// 			}

// 			this.update();
// 		};
// 		const onMouseWheel = (event: WheelEvent) => {
// 			if (this.enabled === false || this.enableZoom === false || state !== STATE.NONE) return;

// 			event.preventDefault();

// 			this.dispatchEvent(_startEvent);

// 			handleMouseWheel(event);

// 			this.dispatchEvent(_endEvent);
// 		};

// 		const panLeft = (() => {
// 			const v = new Vector3();

// 			const _panLeft = (distance: number, objectMatrix: Matrix4) => {
// 				v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
// 				v.multiplyScalar(-distance);

// 				panOffset.add(v);
// 			};
// 			return _panLeft;
// 		})();

// 		const panUp = (() => {
// 			const v = new Vector3();

// 			const _panUp = (distance: number, objectMatrix: Matrix4) => {
// 				if (this.screenSpacePanning === true) {
// 					v.setFromMatrixColumn(objectMatrix, 1);
// 				} else {
// 					v.setFromMatrixColumn(objectMatrix, 0);
// 					v.crossVectors(this.object.up, v);
// 				}

// 				v.multiplyScalar(distance);

// 				panOffset.add(v);
// 			};
// 			return _panUp;
// 		})();

// 		const pan = (() => {
// 			const offset = new Vector3();

// 			const _pan = (deltaX: number, deltaY: number) => {
// 				const element = this.domElement;

// 				if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
// 					// perspective
// 					const position = this.object.position;
// 					offset.copy(position).sub(this.target);
// 					let targetDistance = offset.length();

// 					// half of the fov is center to top of screen
// 					targetDistance *= Math.tan((((this.object as PerspectiveCamera).fov / 2) * Math.PI) / 180.0);

// 					// we use only clientHeight here so aspect ratio does not distort speed
// 					panLeft((2 * deltaX * targetDistance) / element.clientHeight, this.object.matrix);
// 					panUp((2 * deltaY * targetDistance) / element.clientHeight, this.object.matrix);
// 				} else if ((this.object as OrthographicCamera).isOrthographicCamera) {
// 					// orthographic
// 					panLeft(
// 						(deltaX *
// 							((this.object as OrthographicCamera).right - (this.object as OrthographicCamera).left)) /
// 							(this.object as OrthographicCamera).zoom /
// 							element.clientWidth,
// 						this.object.matrix
// 					);
// 					panUp(
// 						(deltaY *
// 							((this.object as OrthographicCamera).top - (this.object as OrthographicCamera).bottom)) /
// 							(this.object as OrthographicCamera).zoom /
// 							element.clientHeight,
// 						this.object.matrix
// 					);
// 				} else {
// 					// camera neither orthographic nor perspective
// 					console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
// 					this.enablePan = false;
// 				}
// 			};
// 			return _pan;
// 		})();

// 		const updateMouseParameters = (event: PointerEvent | WheelEvent) => {
// 			// if (!this.zoomToCursor) {
// 			// 	return;
// 			// }
// 			// performCursorZoom = true;
// 			// const rect = scope.domElement.getBoundingClientRect();
// 			// const x = event.clientX - rect.left;
// 			// const y = event.clientY - rect.top;
// 			// const w = rect.width;
// 			// const h = rect.height;
// 			// mouse.x = (x / w) * 2 - 1;
// 			// mouse.y = -(y / h) * 2 + 1;
// 			// dollyDirection.set(mouse.x, mouse.y, 1).unproject(scope.object).sub(scope.object.position).normalize();
// 		};

// 		const onTouchStart = (event: PointerEvent) => {
// 			trackPointer(event);

// 			switch (pointers.length) {
// 				case 1:
// 					switch (this.touches.ONE) {
// 						// case TOUCH.ROTATE:
// 						// 	if (this.enableRotate === false) return;

// 						// 	handleTouchStartRotate();

// 						// 	state = STATE.TOUCH_ROTATE;

// 						// 	break;

// 						case TOUCH.PAN:
// 							if (this.enablePan === false) return;

// 							handleTouchStartPan();

// 							state = STATE.TOUCH_PAN;

// 							break;

// 						default:
// 							state = STATE.NONE;
// 					}

// 					break;

// 				case 2:
// 					switch (this.touches.TWO) {
// 						case TOUCH.DOLLY_PAN:
// 							if (this.enableZoom === false && this.enablePan === false) return;

// 							handleTouchStartDollyPan();

// 							state = STATE.TOUCH_DOLLY_PAN;

// 							break;

// 						// case TOUCH.DOLLY_ROTATE:
// 						// 	if (this.enableZoom === false && this.enableRotate === false) return;

// 						// 	handleTouchStartDollyRotate();

// 						// 	state = STATE.TOUCH_DOLLY_ROTATE;

// 						// 	break;

// 						default:
// 							state = STATE.NONE;
// 					}

// 					break;

// 				default:
// 					state = STATE.NONE;
// 			}

// 			if (state !== STATE.NONE) {
// 				this.dispatchEvent(_startEvent);
// 			}
// 		};
// 		const onMouseDown = (event: PointerEvent) => {
// 			let mouseAction;

// 			switch (event.button) {
// 				case 0:
// 					mouseAction = this.mouseButtons.LEFT;
// 					break;

// 				case 1:
// 					mouseAction = this.mouseButtons.MIDDLE;
// 					break;

// 				case 2:
// 					mouseAction = this.mouseButtons.RIGHT;
// 					break;

// 				default:
// 					mouseAction = -1;
// 			}

// 			switch (mouseAction) {
// 				case MOUSE.DOLLY:
// 					if (this.enableZoom === false) return;

// 					handleMouseDownDolly(event);

// 					state = STATE.DOLLY;

// 					break;

// 				// case MOUSE.ROTATE:
// 				// 	// when using the physical player,
// 				// 	// we need to be able to rotate the camera while
// 				// 	// having shiftKey pressed to run.
// 				// 	// Therefore the following condition is replaced,
// 				// 	// so that we only check the modifier key
// 				// 	// if enablePan is true.
// 				// 	//
// 				// 	// if (event.ctrlKey || event.metaKey || event.shiftKey) {
// 				// 	// if (scope.enablePan === false) return;
// 				// 	//
// 				// 	if (scope.enablePan === true && (event.ctrlKey || event.metaKey || event.shiftKey)) {
// 				// 		handleMouseDownPan(event);

// 				// 		state = STATE.PAN;
// 				// 	} else {
// 				// 		if (scope.enableRotate === false) return;

// 				// 		handleMouseDownRotate(event);

// 				// 		state = STATE.ROTATE;
// 				// 	}

// 				// 	break;

// 				case MOUSE.PAN:
// 					// if (event.ctrlKey || event.metaKey || event.shiftKey) {
// 					// 	if (this.enableRotate === false) return;

// 					// 	handleMouseDownRotate(event);

// 					// 	state = STATE.ROTATE;
// 					// } else {
// 					if (this.enablePan === false) return;

// 					handleMouseDownPan(event);

// 					state = STATE.PAN;
// 					// }

// 					break;

// 				default:
// 					state = STATE.NONE;
// 			}

// 			if (state !== STATE.NONE) {
// 				this.dispatchEvent(_startEvent);
// 			}
// 		};
// 		const onTouchMove = (event: PointerEvent) => {
// 			trackPointer(event);

// 			switch (state) {
// 				// case STATE.TOUCH_ROTATE:
// 				// 	if (this.enableRotate === false) return;

// 				// 	handleTouchMoveRotate(event);

// 				// 	this.update();

// 				// 	break;

// 				case STATE.TOUCH_PAN:
// 					if (this.enablePan === false) return;

// 					handleTouchMovePan(event);

// 					this.update();

// 					break;

// 				case STATE.TOUCH_DOLLY_PAN:
// 					if (this.enableZoom === false && this.enablePan === false) return;

// 					handleTouchMoveDollyPan(event);

// 					this.update();

// 					break;

// 				// case STATE.TOUCH_DOLLY_ROTATE:
// 				// 	if (this.enableZoom === false && this.enableRotate === false) return;

// 				// 	handleTouchMoveDollyRotate(event);

// 				// 	this.update();

// 				// 	break;

// 				default:
// 					state = STATE.NONE;
// 			}
// 		};
// 		const onMouseMove = (event: PointerEvent) => {
// 			switch (state) {
// 				// case STATE.ROTATE:
// 				// 	if (scope.enableRotate === false) return;

// 				// 	handleMouseMoveRotate(event);

// 				// 	break;

// 				case STATE.DOLLY:
// 					if (this.enableZoom === false) return;

// 					handleMouseMoveDolly(event);

// 					break;

// 				case STATE.PAN:
// 					if (this.enablePan === false) return;

// 					handleMouseMovePan(event);

// 					break;
// 			}
// 		};

// 		this.domElement.addEventListener('contextmenu', onContextMenu);

// 		this.domElement.addEventListener('pointerdown', onPointerDown);
// 		this.domElement.addEventListener('pointercancel', onPointerUp);
// 		this.domElement.addEventListener('wheel', onMouseWheel, {passive: false});
// 	}
// 	update() {
// 		console.log('needed?');
// 	}
// }
