import {BaseFlag} from './Base';

// export interface BypassOptions {
// 	has_bypass_flag?: boolean;
// }

export class BypassFlag extends BaseFlag {
	on_update() {
		this.node.emit(NodeEvent.FLAG_BYPASS_UPDATED);
		this.node.set_dirty();
	}
}

// export function Bypass<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		protected self: BaseNode = (<unknown>this) as BaseNode;
// 		_has_bypass_flag: boolean = true;
// 		_bypass_flag: boolean = false;

// 		_init_bypass_flag(options: BypassOptions = {}) {
// 			if (options['has_bypass_flag'] == null) {
// 				options['has_bypass_flag'] = true;
// 			}

// 			this._has_bypass_flag = options['has_bypass_flag'];
// 			this._bypass_flag = false;
// 		}

// 		has_bypass_flag(): boolean {
// 			return this._has_bypass_flag;
// 		}

// 		is_bypassed(): boolean {
// 			return this._bypass_flag;
// 		}

// 		set_bypass_flag(state: boolean) {
// 			if (state == null) {
// 				state = true;
// 			}
// 			if (state !== this._bypass_flag) {
// 				this._bypass_flag = state;
// 				this.self.emit('bypass_flag_update');
// 				this.self.set_dirty();
// 				// this.post_set_bypass_flag()
// 			}
// 		}

// 		// post_process_container_request_as_bypassed(input_node: BaseNode){}
// 		// post_set_bypass_flag(){}

// 		toggle_bypass_flag() {
// 			this.set_bypass_flag(!this.is_bypassed());
// 		}
// 	};
// }
