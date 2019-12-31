// import * as THREE from 'three'

import {Scene} from 'three/src/scenes/Scene'
// namespace {Scene}
// namespace THREE {
// 	export type TScene = Scene
// }

export class ThreeDebug {
	_display_scene: Scene = new Scene()

	constructor() {
		console.log('three ok!!!!!!!!!!!!!!!!!!', this._display_scene)
	}
}
new ThreeDebug()
