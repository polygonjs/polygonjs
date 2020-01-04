declare global {
	const POLY: Poly
}

export class Poly {
	in_worker_thread() {
		return false
	}
}
