/**
 * Returns the size of the window.
 *
 * @remarks
 * It takes 0 arguments.
 *
 * windowSize()
 *
 *
 * ## Usage
 *
 * - `windowSize()` - returns a THREE.Vector2
 * - `windowSize().x` - returns a float
 * - `windowSize().y` - returns a float
 *
 */
import {BaseMethod} from './_Base';
import {Vector2} from 'three/src/math/Vector2';

export class WindowSizeExpression extends BaseMethod {
	protected _require_dependency = true;
	static requiredArguments() {
		return [[]];
	}

	findDependency(index_or_path: number | string): null {
		this.param.addGraphInput(this.param.scene().windowController.graphNode());
		return null;
	}

	private _windowSize = new Vector2();
	processArguments(args: any[]): Promise<Vector2> {
		return new Promise((resolve) => {
			this._windowSize.set(window.innerWidth, window.innerHeight);
			resolve(this._windowSize);
		});
	}
}
