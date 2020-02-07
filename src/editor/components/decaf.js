/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// mixins
	let component;
	import {CameraCommon} from '../Mixin/CameraCommon';
	import {Camera} from './Mixin/Camera';
	import NodeOwner from 'src/Editor/Component/Mixin/NodeOwner';
	import {Picker} from '../Mixin/Picker';
	import {Player} from '../Mixin/Player';
	import {ViewerComponentCapture} from './Mixin/ViewerComponentCapture';
	import {WindowResize} from './Mixin/WindowResize';

	export default component = {
		name: 'viewer-threejs',
		mixins: [
			Camera,
			CameraCommon,
			NodeOwner,
			Picker,
			Player,
			ViewerComponentCapture,
			WindowResize
		],


		data() {
			return {do_render: true};
		},

		mounted() {
			return this._viewer = this.current_camera_node.viewer(this.$refs.viewer);
		},
			// this._viewer = new viewer_constructor(this.$refs.viewer, this.$store.scene)
			// this._viewer.set_camera_node(this.current_camera_node)


		beforeDestroy() {
			return this._viewer.dispose();
		},

		computed: {
			display_scene() {
				return this._display_scene != null ? this._display_scene : (this._display_scene = this.$store.scene.display_scene());
			}
		},



		methods: {
			on_resize(e){
				if (this._viewer) {
					return this._viewer.on_resize();
				}
			},


			canvas_for_capture() {
				if (this._viewer) {
					return this._viewer.canvas();
				}
			}
		}
	};