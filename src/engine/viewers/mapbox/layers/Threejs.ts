import {CoreMapboxTransform} from '../../../../core/mapbox/Transform';
import {MapboxCameraObjNode} from '../../../nodes/obj/MapboxCamera';
import {MapboxViewer} from '../../Mapbox';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Vector3} from 'three/src/math/Vector3';
import {Scene} from 'three/src/scenes/Scene';
import {Matrix4} from 'three/src/math/Matrix4';
import {Camera} from 'three/src/cameras/Camera';
import mapboxgl from 'mapbox-gl';

// import { mat4 } from "gl-matrix";

const ID = 'threejs_layer';

export class ThreejsLayer {
	public readonly id: string = ID;
	public readonly type: 'custom' = 'custom';
	public readonly renderingMode: '3d' = '3d'; // 2d or 3d, the threejs will be either as an overlay or intersecting with buildings
	private _camera: Camera;
	private _renderer: WebGLRenderer | undefined;
	private _map: mapboxgl.Map | undefined;
	private _gl: WebGLRenderingContext | undefined;

	constructor(
		private _camera_node: MapboxCameraObjNode,
		private _display_scene: Scene,
		private _viewer: MapboxViewer
	) {
		this._camera = this._camera_node.object;
	}

	// camera(): Camera {
	// 	return this._camera;
	// }

	onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
		this._map = map;
		this._gl = gl;

		//@_world = this.$store.scene.root().object()
		//@_camera_converter = new CameraConverter(@_map, @_camera, @_world)

		//loader = new JSONLoader()
		//geometry_url = '/geometries/streets_geojson.json'
		//geometry_url = '/geometries/streets_geojson_bbox.json'
		// loader.load geometry_url, (objects)=>
		// 	objects_to_add = lodash_clone(objects)
		// 	lodash_each objects_to_add, (object)=>
		// 		object.material.linewidth = 1
		// 		object.material.needsUpdate = true
		// 		@_display_scene.add(object)
		this.create_renderer();
	}

	create_renderer() {
		if (this._renderer != null) {
			this._renderer.dispose();
		}
		if (!this._map) {
			return;
		}
		this._renderer = new WebGLRenderer({
			// alpha: true
			// antialias: true
			canvas: this._map.getCanvas(),
			context: this._gl,
		});

		this._renderer.autoClear = false;
		this._renderer.shadowMap.enabled = true;
	}

	onRemove() {
		this._renderer?.dispose();
	}

	resize() {
		// re-creating a renderer is the only I found to reliably resize
		this.create_renderer();
	}
	// canvas = @_map.getCanvas()
	// console.log(canvas, canvas.width, canvas.height)
	// @_renderer.setSize(
	// 	canvas.width * window.devicePixelRatio,
	// 	canvas.height * window.devicePixelRatio
	// )

	// debug: ->
	// 	if !@_test
	// 		@_test = true
	// 		console.log(@_camera.toJSON())
	// 		console.log(@_camera_node.object().toJSON())

	render(gl: WebGLRenderingContext, matrix: number[]) {
		if (!this._renderer || !this._map) {
			return;
		}
		//this._render_0(gl, matrix)
		// this._render_1(gl, matrix)
		this._update_camera_matrix2(gl, matrix);

		this._renderer.state.reset();
		this._renderer.render(this._display_scene, this._camera);

		this._map.triggerRepaint();

		// if (this._viewer.capturer()) {
		// 	this._viewer.capturer().perform_capture();
		// }
	}

	// https://github.com/mapbox/mapbox-gl-js/issues/7395
	// _update_camera_matrix3(gl, matrix){
	// 	this._camera.projectionMatrix.elements = matrix;
	// }

	// _render_0: (gl, matrix)->

	// 	# use threebox in the initalizer
	// 	#world = @_display_scene.children[0]
	// 	#obj = world.children[0]

	// _render_1: (gl, matrix)->

	// 	translate = Core.Mapbox.Utils.fromLL(@_start_lng_lat[0], @_start_lng_lat[1])

	// 	transform =
	// 		translateX: translate[0]
	// 		translateY: translate[1]
	// 		translateZ: 0
	// 		rotateX: 0 #Math.PI / 2
	// 		rotateY: 0
	// 		rotateZ: 0
	// 		scale: 1 #1e-8 #0.00000001 #0.00001 #5.41843220338983e-8

	// 	#console.log(matrix)
	// 	# TODO: compute transform only once
	// 	#rotationX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), transform.rotateX)
	// 	#rotationY = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), transform.rotateY)
	// 	#rotationZ = new Matrix4().makeRotationAxis(new Vector3(0, 0, 1), transform.rotateZ)

	// 	position = new Vector3()
	// 	quaternion = new Quaternion()
	// 	scale = new Vector3()
	// 	m_tmp = new Matrix4().fromArray(matrix)
	// 	m_tmp.decompose( position, quaternion, scale )
	// 	if !@_prints_count?
	// 		console.log("map matrix:")
	// 		console.log("position:", position)
	// 		console.log("quaternion:", quaternion)
	// 		console.log("scale:", scale)
	// 		@_prints_count = 1

	// 	m = new Matrix4().fromArray(matrix)
	// 	l = new Matrix4().makeTranslation(transform.translateX, transform.translateY, transform.translateZ)

	// 	# now = performance.now()
	// 	# if !@_printed_at? || (now - @_printed_at) > 5000
	// 	# 	console.log(matrix, m, l, m.multiply(l))
	// 	# 	@_printed_at = now

	// 	#.scale(new Vector3(transform.scale, -transform.scale, transform.scale))
	// 	#.multiply(rotationX)
	// 	#.multiply(rotationY)
	// 	#.multiply(rotationZ)

	// 	#@_camera.projectionMatrix.elements = matrix
	// 	@_camera.projectionMatrix = m.multiply(l)
	// 	# raycaster debug
	// 	# raycaster = new Raycaster()
	// 	# mouse =
	// 	# 	x: 0
	// 	# 	y: 0
	// 	# raycaster.setFromCamera( mouse, @_camera )
	// 	# raycaster.far = 1
	// 	#console.log(raycaster.ray.direction)
	// 	# objects = this.$store.scene.display_scene().children
	// 	# intersects = raycaster.intersectObjects( objects, true )
	// 	# intersected_objects = lodash_map intersects, (intersect)->intersect.object
	// 	# names = lodash_uniq lodash_map intersected_objects, (intersected_object)->intersected_object.name

	// 	# if (intersect = intersects[0])?
	// 	# 	console.log(intersect.distance, intersect.object.name)

	// from https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/
	// this now rotates objects correctly
	_update_camera_matrix2(gl: WebGLRenderingContext, matrix: number[]) {
		const lng_lat = this._viewer.camera_lng_lat();
		if (!lng_lat) {
			return;
		}
		const mercator = mapboxgl.MercatorCoordinate.fromLngLat([lng_lat.lng, lng_lat.lat], 0);
		const transform = {
			position: mercator,
			rotation: {x: Math.PI / 2, y: 0, z: 0},
			scale: CoreMapboxTransform.WORLD_SCALE, //5.41843220338983e-8
		};

		const rotationX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), transform.rotation.x);
		const rotationY = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), transform.rotation.y);
		const rotationZ = new Matrix4().makeRotationAxis(new Vector3(0, 0, 1), transform.rotation.z);

		const m = new Matrix4().fromArray(matrix);
		const l = new Matrix4()
			.makeTranslation(1 * transform.position.x, 1 * transform.position.y, 1 * (transform.position.z || 0))
			.scale(new Vector3(transform.scale, -transform.scale, transform.scale))
			.multiply(rotationX)
			.multiply(rotationY)
			.multiply(rotationZ);

		// cam_transform_mat = (new Matrix4()).fromArray(matrix)

		// console.log(cam_transform_mat)
		// m.decompose(this._camera.position, this._camera.quaternion, this._camera.scale)
		// this._camera.matrixWorld.makeTranslation(
		// 	transform.position.x,
		// 	transform.position.y,
		// 	transform.position.z
		// )
		// console.log(this._camera.uuid, this._camera.matrixWorld.elements, transform.position.x, transform.position.y, transform.position.z)
		// this._camera.matrixAutoUpdate = false;
		// pos_offset = CoreMapboxUtils.fromLL(@_component.camera_lng_lat.lng, @_component.camera_lng_lat.lat)
		// @_camera.position.x -= pos_offset[0]
		// @_camera.position.y -= pos_offset[1]
		// console.log(@_camera.position)

		this._camera.projectionMatrix.elements = matrix;
		this._camera.projectionMatrix = m.multiply(l);
		// console.log(this._camera.matrixWorld.elements) //, this._camera.quaternion, this._camera.scale)
	}

	// from https://github.com/mapbox/mapbox-gl-js/issues/7395
	// _update_camera_matrix(gl, viewProjectionMatrix){

	// 	const { transform } = this._map;

	// 	const projectionMatrix = new Float64Array(16);
	// 	const projectionMatrixI = new Float64Array(16);
	// 	const viewMatrix = new Float64Array(16);
	// 	const viewMatrixI = new Float64Array(16);

	// 	// from https://github.com/mapbox/mapbox-gl-js/blob/master/src/geo/transform.js#L556-L568
	// 	const halfFov = transform._fov / 2;
	// 	const groundAngle = (Math.PI / 2) + transform._pitch;
	// 	const topHalfSurfaceDistance = (Math.sin(halfFov) * transform.cameraToCenterDistance) / Math.sin(Math.PI - groundAngle - halfFov);
	// 	const furthestDistance = (Math.cos((Math.PI / 2) - transform._pitch) * topHalfSurfaceDistance) + transform.cameraToCenterDistance;
	// 	const farZ = furthestDistance * 1.01;

	// 	const near = 1.0; //1
	// 	mat4.perspective(projectionMatrix, transform._fov, transform.width / transform.height, near, farZ);
	// 	mat4.invert(projectionMatrixI, projectionMatrix);
	// 	mat4.multiply(viewMatrix, projectionMatrixI, viewProjectionMatrix);
	// 	mat4.invert(viewMatrixI, viewMatrix);

	// 	const matrix = new Matrix4().fromArray(viewMatrixI);
	// 	// position = new Vector3()
	// 	const scale = new Vector3();

	// 	matrix.decompose(this._camera.position, this._camera.quaternion, this._camera.scale);
	// 	const lng_lat = this._viewer.camera_lng_lat()
	// 	const pos_offset = CoreMapboxUtils.fromLL(lng_lat.lng, lng_lat.lat);
	// 	this._camera.position.x -= pos_offset[0];
	// 	this._camera.position.y -= pos_offset[1];

	// 	// console.log("@_camera", @_camera.rotateX(0.1))

	// 	this._camera.projectionMatrix = new Matrix4().fromArray(projectionMatrix);

	// 	// @_camera_node.update_camera_from_cloned_camera(@_camera);

	// 	// console.log("threejs layer: ", camera.camera_source)

	// 	//scale_mult_scalar = 1.0 #1/@_camera.scale.x
	// 	//scale_mult = new Vector3(scale_mult_scalar, scale_mult_scalar, scale_mult_scalar)
	// 	//@_camera.position.multiplyScalar(scale_mult_scalar)
	// 	//@_camera.scale.multiplyScalar(scale_mult_scalar)
	// 	//@_world.scale.copy(scale_mult)

	// 	// if !@_prints_count?
	// 	//console.log(@_camera.position, pos_offset)
	// 	// @_prints_count = 1

	// 	//scale_scalar = scale.x
	// 	//inverted_scale_scalar = 1 / scale_scalar
	// 	//world_scale = new Vector3(inverted_scale_scalar, inverted_scale_scalar, inverted_scale_scalar)
	// 	//@_world.scale.copy(world_scale)
	// 	//console.log(scale, @_world.scale)

	// 	//if !@_prints_count?
	// 	//console.log(@_camera.position)
	// 	//	@_prints_count = 1

	// 	//console.log("camera:", @_camera.position, @_camera.quaternion, @_camera.scale)

	// 	//
	// 	//
	// 	// try and get the world matrix
	// 	//
	// 	//
	// }
}
