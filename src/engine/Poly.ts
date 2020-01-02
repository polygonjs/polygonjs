import {PolyScene} from './scene/PolyScene'

declare global {
	const POLY: Poly
}

class Poly {
	in_worker_thread() {
		return false
	}
}
