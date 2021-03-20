export class AnimationUpdateCallback {
	private _update_matrix: boolean = false;

	clone() {
		const new_update_callback = new AnimationUpdateCallback();
		new_update_callback.setUpdateMatrix(this._update_matrix);
		return new_update_callback;
	}

	setUpdateMatrix(update_matrix: boolean) {
		this._update_matrix = update_matrix;
	}
	updateMatrix() {
		return this._update_matrix;
	}
}
