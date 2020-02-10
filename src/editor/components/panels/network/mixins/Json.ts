import {CameraData} from '../helpers/CameraAnimation';

export interface NetworkPanelInitProperties {
	camera: CameraData;
	history: Dictionary<CameraData>;
}

export function SetupJson(camera_data: CameraData, camera_history: Dictionary<CameraData>) {
	function from_json(json: NetworkPanelInitProperties) {
		const camera_data = json['camera'];
		if (camera_data) {
			const position = camera_data.position;
			const zoom = camera_data.zoom;
			// this.camera = camera_data
			if (position) {
				camera_data.position.x = position.x;
				camera_data.position.y = position.y;
			}
			if (zoom) {
				camera_data.zoom = zoom;
			}
		}

		const json_camera_history = json['history'];
		if (json_camera_history) {
			for (let id of Object.keys(json_camera_history)) {
				camera_history[id] = json_camera_history[id];
			}
		}
	}

	function to_json(): NetworkPanelInitProperties {
		return {
			camera: {
				position: {
					x: camera_data.position.x,
					y: camera_data.position.y,
				},
				zoom: camera_data.zoom,
			},
			history: camera_history,
		};
	}

	return {from_json, to_json};
}
