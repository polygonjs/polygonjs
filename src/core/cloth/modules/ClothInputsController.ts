import {Camera, Vector2, Vector3, Sphere, Plane, Raycaster} from 'three';
import {ClothController} from '../ClothController';

interface Pointer {
	vertex?: number;
	screenCoordinate: Vector2;
	worldCoordinate: Vector3;
}

export class ClothInputsController {
	// let camera: Camera | undefined;
	public readonly pointers: Record<string, Pointer> = {};
	public readonly vertices: number[] = new Array(3);
	public readonly coordinates: Vector3[] = new Array(3);
	public readonly tmpmouse = new Vector3();
	public readonly mouse3d = new Vector3();
	public readonly raycaster = new Raycaster();
	public readonly plane = new Plane(new Vector3(), -1.8);
	public readonly sphere = new Sphere(new Vector3(), 1);

	constructor(public readonly mainController: ClothController) {}
	init() {
		window.addEventListener('mousemove', this.eventsBound.mouse.move);
		window.addEventListener('mousedown', this.eventsBound.mouse.down);
		window.addEventListener('mouseout', this.eventsBound.mouse.out);
		window.addEventListener('mouseup', this.eventsBound.mouse.up);

		window.addEventListener('touchmove', this.eventsBound.touch.move, {passive: false});
		window.addEventListener('touchstart', this.eventsBound.touch.start, {passive: false});
		window.addEventListener('touchend', this.eventsBound.touch.end);
	}

	updating(camera: Camera): boolean {
		this.plane.normal.copy(camera.position).normalize();

		let count = 0;
		let isUpdating = false;

		const geoVertices = this.mainController.geometryInit.vertices;
		const pointerEntries = Object.entries(this.pointers);
		for (let [_, value] of pointerEntries) {
			let mouse = value.screenCoordinate;

			this.raycaster.setFromCamera(mouse, camera);

			if (value.vertex === undefined && this.raycaster.ray.intersectSphere(this.sphere, this.tmpmouse) != null) {
				this.mouse3d.copy(this.tmpmouse);

				let dist = Infinity;

				for (let i = 0; i < geoVertices.length; ++i) {
					const tmp = this.mouse3d.distanceTo(geoVertices[i]);

					if (tmp < dist) {
						dist = tmp;
						value.vertex = i;
					}
				}
			}

			if (value.vertex !== undefined) {
				isUpdating = true;
				this.raycaster.ray.intersectPlane(this.plane, this.tmpmouse);
				value.worldCoordinate.copy(this.tmpmouse);

				this.vertices[count] = value.vertex;
				this.coordinates[count] = value.worldCoordinate;

				count++;
			}
		}

		while (count < 3) {
			this.vertices[count] = -1;
			this.coordinates[count] = this.mouse3d;

			count++;
		}

		return isUpdating ? true : false;
	}
	//
	//
	//
	//
	//
	private eventsBound = {
		mouse: {
			move: this.onMouseMove.bind(this),
			down: this.onMouseDown.bind(this),
			up: this.onMouseUp.bind(this),
			out: this.onMouseOut.bind(this),
		},
		touch: {
			move: this.onTouchMove.bind(this),
			start: this.onTouchDown.bind(this),
			end: this.onTouchUp.bind(this),
		},
	};
	private onMouseMove(evt: MouseEvent) {
		if (this.pointers['mouse'] !== undefined) {
			this.pointers['mouse'].screenCoordinate.x = (evt.pageX / window.innerWidth) * 2 - 1;
			this.pointers['mouse'].screenCoordinate.y = -(evt.pageY / window.innerHeight) * 2 + 1;
		}
	}

	private onMouseDown(evt: MouseEvent) {
		if (evt.button == 0) {
			this.pointers['mouse'] = {
				vertex: undefined,
				screenCoordinate: new Vector2(),
				worldCoordinate: new Vector3(),
			};

			this.onMouseMove(evt);
		}
	}

	private onMouseUp(evt: MouseEvent) {
		if (evt.button == 0) {
			delete this.pointers['mouse'];
		}
	}

	private onMouseOut() {
		delete this.pointers['mouse'];
	}

	private onTouchMove(evt: TouchEvent) {
		evt.preventDefault();

		for (let i = 0; i < evt.changedTouches.length; ++i) {
			let touch = evt.changedTouches[i];

			this.pointers[touch.identifier].screenCoordinate.x = (touch.pageX / window.innerWidth) * 2 - 1;
			this.pointers[touch.identifier].screenCoordinate.y = -(touch.pageY / window.innerHeight) * 2 + 1;
		}
	}

	private onTouchDown(evt: TouchEvent) {
		for (let i = 0; i < evt.changedTouches.length; ++i) {
			let touch = evt.changedTouches[i];

			this.pointers[touch.identifier] = {
				vertex: undefined,
				screenCoordinate: new Vector2(),
				worldCoordinate: new Vector3(),
			};
		}

		this.onTouchMove(evt);
	}

	private onTouchUp(evt: TouchEvent) {
		for (let i = 0; i < evt.changedTouches.length; ++i) {
			let touch = evt.changedTouches[i];

			delete this.pointers[touch.identifier];
		}
	}
}
