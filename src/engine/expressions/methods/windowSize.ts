import {BaseMethodFindDependencyArgs} from './_Base';
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
import {Vector2} from 'three';

export class WindowSizeExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [[]];
	}

	override findDependency(indexOrPath: BaseMethodFindDependencyArgs): null {
		this.param.addGraphInput(this.param.scene().windowController.graphNode());
		return null;
	}

	private _windowSize = new Vector2();
	override processArguments(args: any[]): Promise<Vector2> {
		return new Promise((resolve) => {
			this._windowSize.set(window.innerWidth, window.innerHeight);
			resolve(this._windowSize);
		});
	}
}
