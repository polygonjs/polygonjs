import lodash_merge from 'lodash/merge';
import {BaseSopNode} from '../_Base';

import {CoreConstant} from 'src/core/geometry/Constant';

export class ObjectTypeParamController {
	static add_object_type_param(node: BaseSopNode, other_options = {}) {
		node.add_param(
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
}
