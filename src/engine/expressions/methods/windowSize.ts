/**
 * Returns the size of the window.
 *
 * @remarks
 * It takes 0 arguments.
 *
 * `windowSize()`
 *
 *
 * ## Usage
 *
 * - `windowSize()` - returns a THREE.Vector2
 * - `windowSize().x` - returns a float
 * - `windowSize().y` - returns a float
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {Vector2} from 'three';

export class WindowSizeExpression extends BaseMethod {
	static override requiredArguments() {
		return [[]];
	}

	override findDependency(indexOrPath: BaseMethodFindDependencyArgs): null {
		this.param.addGraphInput(this.param.scene().windowController.graphNode());
		return null;
	}

	private _windowSize = new Vector2();
	override async processArguments(args: any[]): Promise<Vector2> {
		this._windowSize.set(globalThis.innerWidth, globalThis.innerHeight);
		return this._windowSize;
	}
}
