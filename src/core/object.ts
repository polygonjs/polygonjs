const moduleKeywords = ['extended', 'included']

// declare global {
// 	interface Window {
// 		include_instance_methods: ((dest_class: any, src_class: any) => void);
// 	}
// }
function include_instance_methods(dest_class: any, src_class: any) {
	Object.keys(src_class).forEach((key) => {
		if (!moduleKeywords.includes(key)) {
			dest_class.prototype[key] = src_class[key]
		}
	})

	if (src_class.included) {
		src_class.included.apply(dest_class)
	}
}

export class CoreObject {
	constructor() {}

	static include(obj: any) {
		include_instance_methods(obj, this)
	}

	static is_a(object: any, constructor: any) {
		let current_proto = object
		while (current_proto) {
			if (current_proto.constructor == constructor) {
				return true
			} else {
				current_proto = current_proto.__proto__
			}
		}

		return false
	}
	is_a(constructor: any) {
		return CoreObject.is_a(this, constructor)
	}
	// assign_unless (member, value){
	// 	return this[member] || (this[member] = value);
	// }
}
