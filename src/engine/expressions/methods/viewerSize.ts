/**
 * Returns the size of the viewer.
 *
 * @remarks
 * It takes 0 arguments.
 *
 * `viewerSize()`
 *
 *
 * ## Usage
 *
 * - `viewerSize()` - returns a THREE.Vector2
 * - `viewerSize().x` - returns a float
 * - `viewerSize().y` - returns a float
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {Vector2} from 'three';

export class ViewerSizeExpression extends BaseMethod {
	static override requiredArguments() {
		return [[]];
	}

	override findDependency(indexOrPath: BaseMethodFindDependencyArgs): null {
		this.param.addGraphInput(this.param.scene().viewersRegister.graphNode());
		return null;
	}

	private _size = new Vector2();
	override async processArguments(args: any[]): Promise<Vector2> {
		this.param.scene().viewersRegister.lastRenderedViewer()?.size(this._size);
		return this._size;
	}
}
