/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let component;
import {CoreDom} from 'src/Core/Dom';

export default component = {
	name: 'play_bar',

	// data: ->
	// 	mouse_dragging: false

	computed: {
		scrubber_width() {
			return this.$refs.scrubber.offsetWidth;
		},

		frame: {
			get() {
				return this.$store.getters['engine/frame'];
			},
			set(val){
				return this.$store.scene.set_frame(val);
			}
		},

		frame_range() {
			return this.$store.getters['engine/frame_range'];
		},
		frame_range_locked() {
			return this.$store.getters['engine/frame_range_locked'];
		},
		frame_range_start: {
			get() {
				return this.frame_range[0];
			},
			set(val){
				return this.$store.scene.set_frame_range(val, this.frame_range[1]);
			}
		},
		frame_range_end: {
			get() {
				return this.frame_range[1];
			},
			set(val){
				return this.$store.scene.set_frame_range(this.frame_range[0], val);
			}
		},
		frame_range_start_locked: {
			get() {
				return this.frame_range_locked[0];
			},
			set(val){
				return this.$store.scene.set_frame_range_locked(val, this.frame_range_locked[1]);
			}
		},
		frame_range_end_locked: {
			get() {
				return this.frame_range_locked[1];
			},
			set(val){
				return this.$store.scene.set_frame_range_locked(this.frame_range_locked[0], val);
			}
		},
		fps: {
			get() {
				return this.$store.getters['engine/fps'];
			},
			set(val){
				return this.$store.scene.set_fps(val);
			}
		},

		playing() {
			return this.$store.getters['engine/playing_state'];
		},
		frames_count() {
			return (this.frame_range[1] - this.frame_range[0]) + 1;
		},

		frame_indicator_style_object() {
			let object;
			const ratio = (this.frame - this.frame_range[0]) / (this.frames_count+1);
			const percent = 100*(ratio);
			return object =
				{left: `${percent}%`};
		}
	},


	methods: {

		toggle_play_pause() {
			return this.$store.scene.toggle_play_pause();
		},

		decrement_frame(e){
			if (e.ctrlKey) {
				return this.$store.scene.set_frame( this.frame_range[0] );
			} else {
				return this.$store.scene.decrement_frame();
			}
		},
		increment_frame(e){
			if (e.ctrlKey) {
				return this.$store.scene.set_frame( this.frame_range[1] );
			} else {
				return this.$store.scene.increment_frame();
			}
		},

		scrubber_set_frame(e){
			const ratio = e.clientX / this.scrubber_width;
			let frame = (ratio * this.frames_count) + this.frame_range[0];
			frame = Math.floor(frame);
			return this.$store.scene.set_frame(frame);
		},
		on_mouse_down() {
			// this.mouse_dragging = true
			this._mouse_move_event_method = this.on_mouse_move.bind(this);
			this._mouse_up_event_method = this.on_mouse_up.bind(this);
			CoreDom.add_drag_classes();
			document.addEventListener('mousemove', this._mouse_move_event_method);
			return document.addEventListener('mouseup', this._mouse_up_event_method);
		},
		on_mouse_up() {
			// this.mouse_dragging = false
			document.removeEventListener('mousemove', this._mouse_move_event_method);
			document.removeEventListener('mouseup', this._mouse_up_event_method);
			return CoreDom.remove_drag_classes();
		},
		// on_mouse_leave: ->
		// 	# this.mouse_dragging = false
		on_mouse_move(e){
			// if this.mouse_dragging
			return this.scrubber_set_frame(e);
		}
	}
};