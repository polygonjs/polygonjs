import {Scene} from 'three/src/scenes/Scene'
import {CoreGraph} from 'src/core/graph/CoreGraph'
import {CorePerformance} from 'src/core/performance/CorePerformance'
import {Cooker} from 'src/core/graph/Cooker'
import {EmitPayload} from 'src/core/graph/NodeScene'

// export function ClassDecorator<T>(beanName: string): Function {
// 	return (classConstructor: any) => {
// 		console.log('classConstructor')
// 		console.log(classConstructor)
// 		// const props = getOrCreateProps(classConstructor)
// 		// props.beanName = beanName
// 	}
// }

// export function Param(param_type: string, default_value: number): Function {
// 	return (
// 		target: any,
// 		propertyKey: string,
// 		descriptor: PropertyDescriptor
// 	) => {
// 		console.log('Param')
// 		console.log(target, propertyKey, descriptor)
// 		// Object.assign(target, `_param_${propertyKey}`, 'ta')
// 		// const props = getOrCreateProps(classConstructor)
// 		// props.beanName = beanName
// 	}
// }
export function ParamFloat(
	default_value: number,
	options: object = {}
): Function {
	return (target: any, propertyKey: string) => {
		console.log('Param Float', default_value)
		const param_name = propertyKey.substring(7) // removes _param_
		console.log('param_name', param_name)
		// target.prepare_param_on_init('Float', param_name, default_value)
		// console.log(target, propertyKey)
		// Object.assign(target, `_param_${propertyKey}`, 'ta')
		// const props = getOrCreateProps(classConstructor)
		// props.beanName = beanName
	}
}
// export function ClassMethod(value: boolean): Function {
// 	return (
// 		target: any,
// 		propertyKey: string,
// 		descriptor: PropertyDescriptor
// 	) => {
// 		console.log('ClassMethod')
// 		console.log(target, propertyKey, descriptor)
// 		Object.assign(target, `_param_${propertyKey}`, 'ta')
// 		// const props = getOrCreateProps(classConstructor)
// 		// props.beanName = beanName
// 	}
// }

// @ClassDecorator('bla')
export class PolyScene {
	_display_scene: Scene = new Scene()
	_graph: CoreGraph
	_performance: CorePerformance
	_cooker: Cooker

	@ParamFloat(3, {visible_if: {test: 2}}) _param_radius: number

	// constructor() {
	// 	const co = new CoreObject()
	// 	console.log('CoreObject', co)
	// }
	graph() {
		return this._graph
	}
	performance() {
		return this._performance
	}
	cooker() {
		return this._cooker
	}
	store_commit(event_name: string, payload: EmitPayload) {}
	emit_allowed() {
		return true
	}
	node(path: string) {}

	display_scene() {
		return this._display_scene
	}

	is_loading() {
		return true
	}
	loaded(): boolean {
		return true
	}
	root(): any {}
	context(): any {}

	uuid() {
		return 'test-uuid'
	}
}
