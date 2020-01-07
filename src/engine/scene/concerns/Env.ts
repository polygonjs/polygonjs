// export function Env<TBase extends Constructor>(Base: TBase) {
// 	return class extends Base {
// 		_env: string

// 		set_env(new_env: string): void{
// 			this._env = new_env;
// 		}
// 		env(): string {
// 			return POLY.env() //this._env || process.env.NODE_ENV || "unknown";
// 		}
// 		env_is_production() {
// 			return POLY.env_is_production()
// 		}

// 	}
// }
