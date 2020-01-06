interface StringParamVisitor {
	param_string: (param: any) => void
}
export function AsCodeString<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		visit(visitor: StringParamVisitor) {
			return visitor.param_string(this)
		}
	}
}
