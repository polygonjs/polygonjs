import {BaseViewer} from '../_Base'

export function WebglContext<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseViewer = (<unknown>this) as BaseViewer

		protected _on_webglcontextlost(event) {
			console.warn('context lost at frame', this.self._scene.frame())
			event.preventDefault()
			cancelAnimationFrame(this.self._request_animation_frame_id)
			console.warn('not canceled', this.self._request_animation_frame_id)
		}
		protected _on_webglcontextrestored(event) {
			console.log('context restored', event)
		}
	}
}
