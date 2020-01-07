interface BaseParamVisitor {
	visit_param: (param: any) => void;
}

export function VisitorsBase<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		visit(visitor: BaseParamVisitor) {
			return visitor.visit_param(this);
		}
	};
}
