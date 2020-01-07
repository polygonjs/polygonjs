import {BaseSopNode} from '../_Base';

import {CoreConstant} from 'src/core/geometry/Constant';

export function AttribTypeParam<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseSopNode = (<unknown>this) as BaseSopNode;

		_add_attrib_class_param(attrib_name = 'attrib_class') {
			const keys = Object.keys(CoreConstant.ATTRIB_CLASS);

			this.self.add_param(ParamType.INTEGER, attrib_name, CoreConstant.ATTRIB_CLASS.VERTEX, {
				menu: {
					type: 'radio',
					entries: keys.map((name) => {
						return {
							name: name,
							value: (CoreConstant.ATTRIB_CLASS as any)[name],
						};
					}),
				},
			});
		}
	};
}
