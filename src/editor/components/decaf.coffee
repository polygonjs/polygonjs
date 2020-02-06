import {CoreDom} from 'src/Core/Dom'

export default component =
	name: 'play_bar'

	# data: ->
	# 	mouse_dragging: false

	computed:
		scrubber_width: ->
			this.$refs.scrubber.offsetWidth

		frame:
			get: ->
				this.$store.getters['engine/frame']
			set: (val)->
				this.$store.scene.set_frame(val)

		frame_range: ->
			this.$store.getters['engine/frame_range']
		frame_range_locked: ->
			this.$store.getters['engine/frame_range_locked']
		frame_range_start:
			get: ->
				@frame_range[0]
			set: (val)->
				this.$store.scene.set_frame_range(val, @frame_range[1])
		frame_range_end:
			get: ->
				@frame_range[1]
			set: (val)->
				this.$store.scene.set_frame_range(@frame_range[0], val)
		frame_range_start_locked:
			get: ->
				@frame_range_locked[0]
			set: (val)->
				this.$store.scene.set_frame_range_locked(val, @frame_range_locked[1])
		frame_range_end_locked:
			get: ->
				@frame_range_locked[1]
			set: (val)->
				this.$store.scene.set_frame_range_locked(@frame_range_locked[0], val)
		fps:
			get: ->
				this.$store.getters['engine/fps']
			set: (val)->
				this.$store.scene.set_fps(val)

		playing: ->
			this.$store.getters['engine/playing_state']
		frames_count: ->
			(this.frame_range[1] - this.frame_range[0]) + 1

		frame_indicator_style_object: ->
			ratio = (this.frame - this.frame_range[0]) / (this.frames_count+1)
			percent = 100*(ratio)
			object =
				left: "#{percent}%"


	methods:

		toggle_play_pause: ->
			this.$store.scene.toggle_play_pause()

		decrement_frame: (e)->
			if e.ctrlKey
				this.$store.scene.set_frame( this.frame_range[0] )
			else
				this.$store.scene.decrement_frame()
		increment_frame: (e)->
			if e.ctrlKey
				this.$store.scene.set_frame( this.frame_range[1] )
			else
				this.$store.scene.increment_frame()

		scrubber_set_frame: (e)->
			ratio = e.clientX / this.scrubber_width
			frame = ratio * this.frames_count + this.frame_range[0]
			frame = Math.floor(frame)
			this.$store.scene.set_frame(frame)
		on_mouse_down: ->
			# this.mouse_dragging = true
			@_mouse_move_event_method = this.on_mouse_move.bind(this)
			@_mouse_up_event_method = this.on_mouse_up.bind(this)
			CoreDom.add_drag_classes()
			document.addEventListener 'mousemove', @_mouse_move_event_method
			document.addEventListener 'mouseup', @_mouse_up_event_method
		on_mouse_up: ->
			# this.mouse_dragging = false
			document.removeEventListener 'mousemove', @_mouse_move_event_method
			document.removeEventListener 'mouseup', @_mouse_up_event_method
			CoreDom.remove_drag_classes()
		# on_mouse_leave: ->
		# 	# this.mouse_dragging = false
		on_mouse_move: (e)->
			# if this.mouse_dragging
			this.scrubber_set_frame(e)