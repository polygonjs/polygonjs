import lodash_merge from 'lodash/merge';
import {BaseSopNode} from '../_Base';

import {CoreConstant} from 'src/core/geometry/Constant';

export function ObjectTypeParam<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseSopNode = (<unknown>this) as BaseSopNode;

		_add_object_type_param(other_options = {}) {
			this.self.add_param(
				ParamType.INTEGER,
				'object_type',
				0,
				lodash_merge(other_options, {
					color: 'purple',
					menu: {
						type: 'radio',
						entries: CoreConstant.OBJECT_TYPES.map((name, i) => {
							return {name: name, value: i};
						}),
						// entries: lodash_map((Core.Geometry.OBJECT_TYPES), (object_type, i)=>
						// 		({
						// 			name: object_type,
						// 			value: i
						// 		})
						// )
					},
				})
			);
		}
	};
}
