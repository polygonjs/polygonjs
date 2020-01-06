interface MultipleParamVisitor {
	param_multiple: (param: any) => void
}

export function AsCodeMultiple<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		visit(visitor: MultipleParamVisitor) {
			return visitor.param_multiple(this)
		}
	}
}
