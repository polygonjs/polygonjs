export const Json = {
	methods: {
		from_json(json) {
			const camera_data = json['camera'];
			if (camera_data) {
				const position = camera_data.position;
				const zoom = camera_data.zoom;
				// this.camera = camera_data
				if (position) {
					this.camera.position.x = position.x;
					this.camera.position.y = position.y;
				}
				if (zoom) {
					this.camera.zoom = zoom;
				}
			}

			const camera_history = json['camera_history'];
			if (camera_history) {
				this.set_camera_history(camera_history);
			}
		},

		to_json() {
			return {
				camera: {
					position: {
						x: this.camera.position.x,
						y: this.camera.position.y,
					},
					zoom: this.camera.zoom,
				},
				camera_history: this.camera_history(),
			};
		},
	},
};
