import {Vector3} from 'three/src/math/Vector3';
import {Scene} from 'three/src/scenes/Scene';
import {Raycaster} from 'three/src/core/Raycaster';
import {Plane} from 'three/src/math/Plane';
import {Object3D} from 'three/src/core/Object3D';
import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {EventHelper} from './EventHelper';

// interface MousePosition {
// 	x: number
// 	y: number
// }
interface Object3DsByString {
	[propName: string]: Object3D;
}

export class RayHelper {
	private raycaster: Raycaster = new Raycaster();
	private world_plane: Plane = new Plane(new Vector3(0, 0, 1));
	private _ignore_list: Object3DsByString = {};
	private _mouse: Vector2 = new Vector2();

	constructor(
		private event_helper: EventHelper,
		private display_scene: Scene,
		private _line_precision_mult: number = 1,
		private _point_threshold_mult: number = 1
	) {
		this.raycaster.linePrecision = 0.1;
		this.set_line_precision(0.1);
	}

	//
	//
	// LINE PRECISION
	//
	//
	line_precision() {
		return this.raycaster.linePrecision;
	}
	line_precision_mult() {
		return this._line_precision_mult;
	}
	set_line_precision(line_precision: number) {
		return (this.raycaster.linePrecision = line_precision);
	}

	//
	//
	// POINTS THRESHOLD
	//
	//
	point_threshold() {
		return this.raycaster.params?.Points?.threshold;
	}
	point_threshold_mult() {
		return this._point_threshold_mult;
	}
	set_point_threshold(point_threshold: number) {
		if (this.raycaster.params.Points) {
			this.raycaster.params.Points.threshold = point_threshold;
		}
	}

	ignore(mesh: Object3D) {
		return (this._ignore_list[mesh.uuid] = mesh);
	}

	mouse() {
		return this._mouse;
	}

	intersects_from_event(event: MouseEvent, camera: Camera, objects: Object3D[] | null) {
		this.event_helper.normalized_position(event, this._mouse);

		// console.log(this._mouse)
		// const cameraPosition = new Vector3(0, 0, 0).unproject(camera)
		// const mousePos = new Vector3(this._mouse.x, this._mouse.y, 0.99).unproject(camera)
		// const direction = mousePos.clone().sub(cameraPosition).normalize()
		// console.log(cameraPosition, mousePos, direction)
		// this.test_raycaster = this.test_raycaster || new Raycaster()
		// this.test_raycaster.near = -1;
		// this.test_raycaster.far = 5000;
		// this.test_raycaster.ray.set(mousePos, direction);
		// console.log(this.test_raycaster.intersectObjects(objects))

		this.raycaster.setFromCamera(this._mouse, camera);
		// console.log(camera.uuid, camera.matrixWorld.elements)
		// console.log(this.raycaster.ray.origin, this.raycaster.ray.direction)
		// this.raycaster.ray.origin = camera.position

		if (objects == null) {
			objects = this.display_scene.children;
		}
		let intersects = this.raycaster.intersectObjects(objects, true);
		// console.log(intersects)

		const ignored_uuids = Object.keys(this._ignore_list);
		intersects = intersects.filter((intersect) => {
			return !ignored_uuids.includes(intersect.object.uuid);
		});
		return intersects;
	}

	intersect_plane_from_event(event: MouseEvent, camera: Camera, plane: Plane) {
		this.event_helper.normalized_position(event, this._mouse);
		return this.intersect_plane(this._mouse, camera, plane);
	}

	intersect_plane(mouse: Vector2, camera: Camera, plane: Plane) {
		this.raycaster.setFromCamera(mouse, camera);

		const point = new Vector3();
		this.raycaster.ray.intersectPlane(plane, point);
		return point;
	}

	// was used to move the camera in network
	// intersect_plane_from_event(event: Event, camera: Camera){
	// 	this._mouse = this.event_helper.normalized_position(event);
	// 	return this.intersect_world_plane(camera);
	// }

	intersect_world_plane(camera: Camera) {
		this.raycaster.setFromCamera(this._mouse, camera);

		const point = new Vector3();
		this.raycaster.ray.intersectPlane(this.world_plane, point);
		return point;
	}
}
