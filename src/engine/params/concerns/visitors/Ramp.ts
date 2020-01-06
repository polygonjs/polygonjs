interface RampParamVisitor {
	param_ramp: (param: any) => void
}

export function AsCodeRamp<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		visit(visitor: RampParamVisitor) {
			return visitor.param_ramp(this)
		}
	}
}
