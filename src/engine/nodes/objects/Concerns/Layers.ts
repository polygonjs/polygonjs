// import lodash_each from 'lodash/each'
import {BaseObjectNode} from '../_Base';
// import {ParamType} from 'src/Engine/Param/_Module'

export function Layers<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseObjectNode = (<unknown>this) as BaseObjectNode;

		create_layers_params() {
			this.self.add_param(ParamType.INTEGER, 'layer', 0, {
				range: [0, 31],
				range_locked: [0, 31],
			});
		}

		update_layers() {
			const object = this.self.object();
			// const affected_objects = [object];
			// if (object.cloned_cameras != null) {
			// 	lodash_each(object.cloned_cameras, cloned_camera=> {
			// 		affected_objects.push(cloned_camera);
			// 	});
			// }

			// affected_objects.forEach((affected_object)=> {
			object.layers.set(0);
			object.layers.enable(this.self._param_layer);
			// });
		}
	};
}
