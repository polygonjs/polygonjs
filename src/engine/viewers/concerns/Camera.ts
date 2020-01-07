import {Camera} from 'three/src/cameras/Camera'
import {Vector2} from 'three/src/math/Vector2'
import {ComponentGraphNode} from 'src/Editor/Component/Helper/GraphNode'
import {BaseCamera} from 'src/engine/nodes/Obj/_BaseCamera'
import {BaseViewer} from '../_Base'

export function CameraMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseViewer = (<unknown>this) as BaseViewer

		// computed:
		// 	size: ->
		// 		[this.$el.offsetWidth, this.$el.offsetHeight]
		// 	aspect: ->
		// 		@size[0] / @size[1]
		protected _is_active: boolean = false
		protected _camera_node: BaseCamera
		protected _camera: Camera

		protected _size: Vector2 = new Vector2(100, 100)
		protected _aspect: number = 1
		protected current_camera_controls_node_graph_id: number = null

		// props:
		// 	current_camera_node_graph_id:
		// 		type: String
		// 		default: null

		// data: ->
		// 	_size: [100, 100]
		// 	_aspect: 1
		// 	current_camera_controls_node_graph_id: null

		_init_active() {
			this._is_active = true
		}

		set_camera_node(camera_node: BaseCamera) {
			if (!this._camera_node || camera_node.graph_node_id() != this._camera_node.graph_node_id()) {
				this._camera_node = camera_node
				this._camera = camera_node.object()
			}
		}
		// private is_camera_updating():boolean{
		// 	if(this._camera_node){
		// 		return this._camera_node.is_updating()
		// 	} else {
		// 		return false
		// 	}
		// }

		// _init_graph_node(){
		// 	this._graph_node = new ComponentGraphNode(this)
		// 	this._graph_node.set_scene(this.$store.scene)

		// 	this.set_graph_node_dependency()
		// 	this.prepare_current_camera()
		// }

		// _dispose_graph_node(){
		// 	this._graph_node.graph_disconnect_predecessors()
		// 	// this.remove_cloned_camera()
		// 	// this.dispose_camera()
		// 	// this._is_active = false
		// }

		// watch:
		// 	// this is currently never called
		// 	// as the threejs and mapbox components are re-created when the camera changes
		// 	current_camera_node_graph_id: (new_camera_node_graph_id, old_camera_node_graph_id)->
		// 		this.$nextTick =>
		// 			//if old_camera_node?
		// 			//	old_camera_node.dispose_controls()

		// 			this.set_graph_node_dependency()
		// 			//this.dispose_camera(old_camera_node_graph_id)
		// 			this.prepare_current_camera()

		// methods:
		// 	update_from_graph_node: (graph_node)->
		// 		// this.set_background_color_and_image()
		// 		this.prepare_current_camera()

		// 	set_graph_node_dependency: ->
		// 		// this.set_background_color_and_image()

		// 		@_graph_node.graph_disconnect_predecessors()
		// 		if this.current_camera_node?
		// 			@_graph_node.add_graph_input( this.current_camera_node )

		// set_background_color_and_image: ->
		// 	await this.current_camera_node.request_container_p()
		// 	color = this.current_camera_node.background_color()
		// 	if color
		// 		this.bg_color = color.toArray()
		// 	else
		// 		this.bg_color = null
		// 	// this.bg_image_url = this.current_camera_node.background_image_url()
		// 	this.bg_texture = this.current_camera_node.background_texture()
		// 	this.bg_texture_uuid = if this.bg_texture then this.bg_texture.uuid else null
		on_resize() {
			this._compute_size_and_aspect()
			this._camera_node.set_renderer_size(this.self._canvas, this._size)
			this.update_camera_aspect()
		}
		protected _compute_size_and_aspect() {
			this._update_size()
			this._camera_node.scene().update_resolution_dependent_uniform_owners(this._size)
			this._aspect = this._get_aspect()
		}

		private _update_size() {
			this._size.x = this.self._element.offsetWidth
			this._size.y = this.self._element.offsetHeight
		}
		private _get_aspect(): number {
			return this._size.x / this._size.y
		}

		update_camera_aspect() {
			this._camera_node.setup_for_aspect_ratio(this._aspect)
		}
		// dispose_camera: ->
		// 	this.$emit('before_controls_apply', null)
		// 	// if @_controls?
		// 	// 	@_controls.dispose()
		// 	// camera_graph_node_id ?= this.current_camera_node_graph_id
		// 	// camera_node = this.$store.scene.graph().node_from_id(camera_graph_node_id)
		// 	// this.current_camera_node.dipose_controls()
		// 	//if this.current_camera_node?
		// 	//	this.current_camera_node.dispose_controls()
		async prepare_current_camera() {
			if (this._camera_node) {
				// we dispose the controls first, so they can be applied
				// if they were not disposed properly when we closed the viewer
				// but I'm now trying in the destroyed callback
				//this.current_camera_node.dispose_controls()

				//this.current_camera_node.apply_controls()
				//this.current_camera_node.prepare_for_viewer(this.aspect())
				// const name = this.current_camera_node.name()
				// const graph_node_id = this._camera_node.graph_node_id()
				/*const container = */ await this._camera_node.request_container_p() // ensure the camera is cooked
				await this._update_from_camera_container() //container, graph_node_id)
			}
		}
		// remove_cloned_camera: ->
		// 	if @_current_camera?
		// 		@_current_camera.camera_source.node.remove_clone(@_current_camera)

		async _update_from_camera_container() {
			//container, graph_node_id:number){
			// ensure that we get the same as we requested
			// if(graph_node_id == this._camera_node.graph_node_id()){

			// this.remove_cloned_camera()
			// cloned_camera = this.current_camera_node.clone_camera()
			// @_current_camera = cloned_camera
			this.update_camera_aspect()

			//this.dispose_camera()

			// @_is_active is use to check if the component has been destroyed
			// which can happen on app load, but also when user switches the camera menu

			// if this.current_camera_controls_node_graph_id == null || ()

			// if(@_is_active == true)
			await this._create_controls()

			// }
		}
	}
}
