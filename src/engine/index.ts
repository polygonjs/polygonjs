import {PolyScene} from './scene/PolyScene';
import {AllRegister} from './poly/registers/All';
AllRegister.run();

// console.log('importing lib', PolyScene);
// // for webpack export
// export {PolyScene};

// // for esbuild export
// declare global {
// 	interface Window {
// 		POLY: {
// 			PolyScene: typeof PolyScene;
// 		};
// 	}
// }
// window.POLY = {
// 	PolyScene,
// };
// console.log(window.POLY);

// // for esbuild export
// declare global {
// 	interface Window {
// 		POLY: {
// 			// PolyScene: typeof PolyScene;
// 			TestClass: typeof TestClass;
// 			// TestClass2: typeof TestClass;
// 		};
// 	}
// }
export {PolyScene};
// (window as any).POLY = {
// 	PolyScene,
// 	TestClass,
// 	TestClass2,
// };
// console.log((window as any).POLY);
