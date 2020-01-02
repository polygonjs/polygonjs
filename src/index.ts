import {PolyScene} from 'src/engine/scene/PolyScene'
new PolyScene()

// import {Print} from './print'

// const lodashReduce = require('lodash/reduce')
// import numRef from './ref.json'

// console.log(`mode:${process.env.NODE_ENV}`)
// console.log(numRef, numRef)

// interface NumRefElem {
// 	num: number
// 	word: string
// }

// export function numToWord(num: number): string {
// 	const refs = numRef as object[]
// 	for (let i = 0; i < refs.length; i++) {
// 		const obj = refs[i] as NumRefElem
// 		if ((obj.num as number) == num) {
// 			return obj.word
// 		}
// 	}
// 	// return numRef[`${num}`] as string;
// 	// return lodashReduce(numRef, (accum, ref) => {
// 	// 	return ref.num === num ? ref.word : accum;
// 	// }, '');
// }
// console.log('lodashReduce', lodashReduce)
// lodashReduce([], (a: any, e: any) => {
// 	return [a, e]
// })

// // export function wordToNum(word: string): number {
// // 	return lodashReduce(numRef, (accum, ref) => {
// // 		return ref.word === word && word.toLowerCase() ? ref.num : accum;
// // 	}, -1);
// // }

// function reallyLongArg() {}
// function omgSoManyParameters() {}
// function IShouldRefactorThis() {}
// function isThereSeriouslyAnotherOne() {}
// function isThereSeriouslyAnotherOne2() {}
// type Fn = () => void
// function foo(a: Fn, b: Fn, c: Fn, d: Fn, e: Fn) {}
// foo(
// 	reallyLongArg,
// 	omgSoManyParameters,
// 	IShouldRefactorThis,
// 	isThereSeriouslyAnotherOne,
// 	isThereSeriouslyAnotherOne2
// )

// function component(): HTMLElement {
// 	const element = document.createElement('div') as HTMLElement

// 	element.innerHTML = ['Hello', 'webpack 2'].join('___')

// 	const btn = document.createElement('button')
// 	btn.innerHTML = 'Click me and check the console!'
// 	btn.onclick = (): void => {
// 		Print()
// 	}
// 	element.appendChild(btn)

// 	return element
// }

// document.body.appendChild(component())

// // declare interface NodeModule {
// // 	hot: {
// // 		accept(path: string, fn: () => void, callback?: () => void): void;
// // 	};
// //  }
// // if ((<unknown>module as NodeModule).hot as object) {
// // 	(<unknown>module as NodeModule).hot.accept('./print', function() {
// // 		console.log('Accepting the updated printMe module!');
// // 		Print()
// // 	})
// // }
