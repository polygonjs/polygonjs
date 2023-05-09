// type Callback = () => void;

// export class AttributeCallbackQueue {
// 	private static _blocked: boolean = true;
// 	private static _lastCallback: Callback | undefined;

// 	static block() {
// 		this._blocked = true;
// 	}
// 	static runOrEnqueue(callback: Callback) {
// 		if (this._blocked) {
// 			this._lastCallback = callback;
// 		} else {
// 			callback();
// 		}
// 	}
// 	static unblock() {
// 		this._blocked = false;
// 		if (this._lastCallback) {
// 			this._lastCallback();
// 			this._lastCallback = undefined;
// 		}
// 	}
// }
