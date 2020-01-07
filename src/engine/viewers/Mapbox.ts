import {Scene} from 'three/src/scenes/Scene'
const THREE = {Scene}
import lodash_includes from 'lodash/includes'
import lodash_map from 'lodash/map'
import {Scene} from 'src/Engine/Scene'
import {BaseCamera} from 'src/engine/nodes/Obj/_BaseCamera'
import {MapboxCamera} from 'src/engine/nodes/Obj/MapboxCamera'

import {BaseViewer} from './_Base'
import {ViewerLoader} from './Loader'
import {MapboxEvent} from './Mapbox/Event'
import {MapboxStylesheet} from './Mapbox/Stylesheet'

import {ThreejsLayer} from './Mapbox/Layer/Threejs'
import {BuildingsLayer} from './Mapbox/Layer/Buildings'

const CSS_CLASS = 'CoreMapboxViewer'

export class MapboxViewer extends MapboxStylesheet(MapboxEvent(BaseViewer)) {
	private _canvas_container: HTMLElement
	private _canvas: HTMLCanvasElement
	private _display_scene: THREE.Scene
	private _camera_node: MapboxCamera

	_map: any // TODO
	_map_loaded: boolean = false
	_threejs_layer: ThreejsLayer

	constructor(private _element: HTMLElement, private _scene: Scene, camera_node: BaseCamera) {
		super(_element, _scene, camera_node)

		this.load_stylesheet()
		this._canvas_container = document.createElement('div')
		this._element.appendChild(this._canvas_container)
		this._element.classList.add(CSS_CLASS)
		this._canvas_container.id = `mapbox_container_id_${Math.random()}`.replace('.', '_')

		new ViewerLoader(this._element)
	}
	_build() {
		this.init_mapbox()
	}
	on_resize() {
		if (this._map) {
			this._map.resize()
		}
		if (this._threejs_layer) {
			this._threejs_layer.resize()
		}
		this._camera_node_move_end() // to update mapbox planes
	}
	dispose() {
		window.POLY.deregister_map(this._canvas_container.id)
		this._camera_node.remove_map(this._canvas_container)
	}
	async init_mapbox() {
		this._map = await this._camera_node.create_map(this, this._canvas_container)

		this._set_events()
		this._map.on('load', () => {
			this._map_loaded = true
			this._canvas = this.find_canvas()
			window.POLY.register_map(this._canvas_container.id, this._map) //(@panel_id, @_map)
			this.add_layers()
			this._camera_node_move_end() // to update mapbox planes
			// this.$store.app.dispatch_event(this.current_camera_node, {map_loaded: @panel_id.join('')})
		})
	}
	canvas(): HTMLCanvasElement {
		return this._canvas
	}
	camera_lng_lat() {
		return this._camera_node.lng_lat()
	}

	_set_events() {
		// this._map.on('styledata', this.on_styledata.bind(this))

		this._map.on('move', this.on_move.bind(this))
		this._map.on('moveend', this.on_moveend.bind(this))

		this._map.on('mousemove', this.on_mousemove.bind(this))
		this._map.on('mousedown', this.on_mousedown.bind(this))
		this._map.on('mouseup', this.on_mouseup.bind(this))

		// this._add_navigation_controls()
	}
	_add_navigation_controls() {
		const nav = new mapboxgl.NavigationControl()
		this._map.addControl(nav, 'bottom-right')
		// console.log("nav added")
	}
	add_layers() {
		if (this._map_loaded != true) {
			return
		}
		//return if @_adding_layers == true
		//@_adding_layers = true

		const current_style = this._map.getStyle()
		const layers = current_style.layers

		let label_layer_id = null
		for (let layer of layers) {
			if (layer.type == 'symbol' && layer.layout['text-field']) {
				label_layer_id = layer.id
			}
		}

		this._add_buildings_layer(label_layer_id)
		this._add_threejs_layer(label_layer_id)

		//@_adding_layers = false
	}

	_add_buildings_layer(label_layer_id: string) {
		if (this._has_layer_id(BuildingsLayer.id)) {
			return
		}

		this._map.addLayer(BuildingsLayer, label_layer_id)
	}

	_add_threejs_layer(label_layer_id: string) {
		//return if this._has_layer_id(ThreejsLayer.ID)

		//if !@_map.getLayer(ThreejsLayer.ID)?
		//sprite = @_map.getStyle()['sprite']

		//@_has_added_threejs_layer_by_style ?= {}
		//if @_has_added_threejs_layer_by_style[sprite] == true
		//	@_map.removeLayer(ThreejsLayer.ID)

		//if @_has_added_threejs_layer_by_style[sprite] != true
		// display_scene = this.$store.scene.display_scene()
		const line_precision_mult = 1 //0.0001
		this._init_ray_helper(line_precision_mult) //this._canvas_container, this._display_scene, line_precision_mult)

		this._threejs_layer = new ThreejsLayer(this._camera_node, this._display_scene, this)
		// @_map.setPaintProperty(label_layer_id, 'opacity', 0.5)
		/*const layer = */ this._map.addLayer(this._threejs_layer, label_layer_id)
		//@_has_added_threejs_layer_by_style[sprite] = true
	}

	_has_layer_id(layer_id: string): boolean {
		const current_style = this._map.getStyle()
		const layer_ids = lodash_map(current_style.layers, 'id')
		return lodash_includes(layer_ids, layer_id)
	}

	find_canvas() {
		return this._canvas_container.getElementsByTagName('canvas')[0]
	}
}
