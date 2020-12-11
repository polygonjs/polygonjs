import {CoreMapboxTransform} from "../../../../core/mapbox/Transform";
import {WebGLRenderer as WebGLRenderer2} from "three/src/renderers/WebGLRenderer";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import mapboxgl from "mapbox-gl";
const ID = "threejs_layer";
export class ThreejsLayer {
  constructor(_camera_node, _display_scene, _viewer) {
    this._camera_node = _camera_node;
    this._display_scene = _display_scene;
    this._viewer = _viewer;
    this.id = ID;
    this.type = "custom";
    this.renderingMode = "3d";
    this._camera = this._camera_node.object;
  }
  onAdd(map, gl) {
    this._map = map;
    this._gl = gl;
    this.create_renderer();
  }
  create_renderer() {
    if (this._renderer != null) {
      this._renderer.dispose();
    }
    if (!this._map) {
      return;
    }
    this._renderer = new WebGLRenderer2({
      canvas: this._map.getCanvas(),
      context: this._gl
    });
    this._renderer.autoClear = false;
    this._renderer.shadowMap.enabled = true;
  }
  onRemove() {
    this._renderer?.dispose();
  }
  resize() {
    this.create_renderer();
  }
  render(gl, matrix) {
    if (!this._renderer || !this._map) {
      return;
    }
    this._update_camera_matrix2(gl, matrix);
    this._renderer.state.reset();
    this._renderer.render(this._display_scene, this._camera);
    this._map.triggerRepaint();
  }
  _update_camera_matrix2(gl, matrix) {
    const lng_lat = this._viewer.camera_lng_lat();
    if (!lng_lat) {
      return;
    }
    const mercator = mapboxgl.MercatorCoordinate.fromLngLat([lng_lat.lng, lng_lat.lat], 0);
    const transform = {
      position: mercator,
      rotation: {x: Math.PI / 2, y: 0, z: 0},
      scale: CoreMapboxTransform.WORLD_SCALE
    };
    const rotationX = new Matrix42().makeRotationAxis(new Vector32(1, 0, 0), transform.rotation.x);
    const rotationY = new Matrix42().makeRotationAxis(new Vector32(0, 1, 0), transform.rotation.y);
    const rotationZ = new Matrix42().makeRotationAxis(new Vector32(0, 0, 1), transform.rotation.z);
    const m = new Matrix42().fromArray(matrix);
    const l = new Matrix42().makeTranslation(1 * transform.position.x, 1 * transform.position.y, 1 * (transform.position.z || 0)).scale(new Vector32(transform.scale, -transform.scale, transform.scale)).multiply(rotationX).multiply(rotationY).multiply(rotationZ);
    this._camera.projectionMatrix.elements = matrix;
    this._camera.projectionMatrix = m.multiply(l);
  }
}
