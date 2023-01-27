/**
 * Returns true if the page is on a touch device, false if not.
 *
 * @remarks
 * It takes 0 arguments.
 *
 * `isDeviceTouch()`
 *
 *
 * ## Usage
 *
 * - `isDeviceTouch()` - returns true or false depending if the device is a touch device or not.
 *
 */
import {BaseMethod} from './_Base';
import {CoreUserAgent} from '../../../core/UserAgent';

export class isDeviceTouchExpression extends BaseMethod {
	protected override _requireDependency = true;

	static override requiredArguments() {
		return [];
	}

	override async processArguments(args: any[]): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			resolve(CoreUserAgent.isTouchDevice());
		});
	}
}
