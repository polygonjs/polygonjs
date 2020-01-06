import {BaseMethod} from './_Base'
import {MethodDependency} from '../MethodDependency'
import axios from 'axios'

export class Asset extends BaseMethod {
	// constructor() {
	// 	super();
	// }

	static required_arguments() {
		return [['string', 'path']]
	}

	process_arguments(args: any[]): Promise<string> {
		return new Promise((resolve, reject) => {
			this.request_asset_url(args[0]).then((url) => {
				resolve(url)
			})
		})
	}
	find_dependency(index_or_path: number | string): MethodDependency {
		return null
	}

	// TODO: add error management
	request_asset_url(name: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const scene = this.node.scene()
			const scene_uuid = scene.uuid()

			let url

			name = encodeURIComponent(name)
			if (scene_uuid) {
				url = `/api/scenes/${scene_uuid}/uploads/${name}`
			} else {
				// in case the scene has not been saved yet
				url = `/api/uploads/${name}`
			}

			axios.get(url).then(function(response) {
				let data
				if ((data = response.data) != null) {
					if ((url = data['url']) != null) {
						resolve(url)
					} else {
						resolve('')
					}
				} else {
					return resolve('')
				}
			})
		})
	}
}
