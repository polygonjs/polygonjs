# mixins
	import {CameraCommon} from '../Mixin/CameraCommon'
	import {Camera} from './Mixin/Camera'
	import NodeOwner from 'src/Editor/Component/Mixin/NodeOwner'
	import {Picker} from '../Mixin/Picker'
	import {Player} from '../Mixin/Player'
	import {ViewerComponentCapture} from './Mixin/ViewerComponentCapture'
	import {WindowResize} from './Mixin/WindowResize'

	export default component =
		name: 'viewer-threejs'
		mixins: [
			Camera
			CameraCommon
			NodeOwner
			Picker
			Player
			ViewerComponentCapture
			WindowResize
		]


		data: ->
			do_render: true

		mounted: ->
			this._viewer = this.current_camera_node.viewer(this.$refs.viewer)
			# this._viewer = new viewer_constructor(this.$refs.viewer, this.$store.scene)
			# this._viewer.set_camera_node(this.current_camera_node)


		beforeDestroy: ->
			this._viewer.dispose()

		computed:
			display_scene: ->
				@_display_scene ?= this.$store.scene.display_scene()



		methods:
			on_resize: (e)->
				if this._viewer
					this._viewer.on_resize()


			canvas_for_capture: ->
				if this._viewer
					this._viewer.canvas()