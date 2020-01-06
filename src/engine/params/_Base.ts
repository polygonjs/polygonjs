// import {Vector3} from 'three/src/math/Vector3'
// import {Vector2} from 'three/src/math/Vector2'

import {NodeScene} from 'src/core/graph/NodeScene'
import {NamedGraphNode} from 'src/core/graph/NamedGraphNode'

import {CallbackOption} from './concerns/options/Callback'
// import {ColorOption} from './concerns/options/Color'
import {CookOption} from './concerns/options/Cook'
import {DesktopOption} from './concerns/options/Desktop'
import {ExpressionOption} from './concerns/options/Expression'
import {MenuOption} from './concerns/options/Menu'
import {NodeSelectionOption} from './concerns/options/NodeSelection'
import {RangeOption} from './concerns/options/Range'
import {AssetReferenceOption} from './concerns/options/AssetReference'
import {SpareOption} from './concerns/options/Spare'
import {MultilineOption} from './concerns/options/Multiline'
import {TextureOption} from './concerns/options/Texture'
import {VisibleOption} from './concerns/options/Visible'

import {AssetReference} from './concerns/AssetReference'
import {Emit} from './concerns/Emit'
import {Errored} from './concerns/Errored'
import {Eval} from './concerns/Eval'
import {Expression} from './concerns/Expression'
import {Hierarchy} from './concerns/Hierarchy'
import {Json} from './concerns/Json'
import {Named} from './concerns/Named'
import {Node} from './concerns/Node'
import {Options} from './concerns/Options'
import {TimeDependent} from './concerns/TimeDependent'
import {Type} from './concerns/Type'
import {UIDataOwner} from './concerns/UIDataOwner'
import {VisitorsBase} from './concerns/visitors/_Base'

class BaseParamOptions extends Options(
	CallbackOption(
		// ColorOption(
		CookOption(
			DesktopOption(
				ExpressionOption(
					MenuOption(
						NodeSelectionOption(
							RangeOption(
								AssetReferenceOption(
									SpareOption(
										MultilineOption(
											TextureOption(
												VisibleOption(
													NamedGraphNode(NodeScene)
												)
											)
										)
									)
								)
							)
						)
					)
				)
			)
		)
		// )
	)
) {}

class BaseParamConcerns extends TimeDependent(
	VisitorsBase(
		Json(
			AssetReference(
				Emit(
					Errored(
						Eval(
							Expression(
								Hierarchy(
									Named(
										Node(
											Type(UIDataOwner(BaseParamOptions))
										)
									)
								)
							)
						)
					)
				)
			)
		)
	)
) {}

export class TypedParam<T> extends BaseParamConcerns {
	constructor() {
		super()

		// this.add_post_dirty_hook(this._remove_node_param_cache.bind(this))
	}
	protected _raw_input: T
	protected _default_value: T
	protected _value: T
	protected _expression: string

	initialize() {
		this.init_components()
		// this.init_expression()
		// this._init_ui_data()
	}
	init_components() {}
	//
	// init_expression() {}

	// TODO: typescript
	value(): T {
		return null
	}
	set(new_value: T): void {}
	default_value() {
		return this._default_value
	}
	is_raw_input_default(value: T): boolean {
		return true
	}
	set_default_value(default_value: T) {
		this._default_value = default_value
	}
	eval_p(): Promise<T> {
		return new Promise((resolve, reject) => {
			resolve()
		})
	}
}
export abstract class BaseParam extends TypedParam<any> {}
