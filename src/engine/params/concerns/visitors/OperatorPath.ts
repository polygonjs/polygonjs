interface OperatorPathParamVisitor {
	param_operator_path: (param: any) => void
}

export function AsCodeOperatorPath<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		visit(visitor: OperatorPathParamVisitor) {
			return visitor.param_operator_path(this)
		}
	}
}
