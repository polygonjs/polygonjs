import 'qunit'

// QUnit.testStart( () => {
// 	return new Promise(async(resolve, reject) =>{

// 		window.scene = new Scene()
// 		window.scene.set_name('test scene')
// 		window.scene.set_uuid('test')
// 		window.POLY.set_env_override('test')

// 		const root = window.scene.root()
// 		window.perpective_camera1 = <unknown>root.create_node('perspective_camera') as PerspectiveCamera
// 		window.geo1 = <unknown>root.create_node('geo') as BaseNodeObjGeo
// 		window.MAT = <unknown>root.create_node('materials') as Materials
// 		window.MAT.set_name("MAT")
// 		window.POST = <unknown>root.create_node('post_process') as PostProcess
// 		window.POST.set_name("POST")
// 		window.COP = <unknown>root.create_node('cop') as Cop
// 		window.COP.set_name("COP")

// 		await window.scene.set_auto_update(true)
// 		await window.scene.mark_as_loaded()

// 		resolve();
// 	});
// });

// window.POLY.env = 'test'

// import './Runner/Helper'
// import './Helper'
// import './Core/_Module'
// import './Engine/_Module'
// import './Editor/_Module'

// // window.test_runner_manager.run()

// console.log("Qunit start")
// QUnit.start()
// console.log("Qunit started")

// window.sleep = (time)=>{
// 	return new Promise((resolve, reject)=>{
// 		setTimeout(()=>{
// 			// console.log("slept for ", time)
// 			resolve()
// 		}, time)
// 	})
// }

// import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer'
// const THREE = {WebGLRenderer}
// window.create_renderer_if_none = ()=>{

// 	const first_renderer = POLY.renderers_controller.first_renderer()
// 	if(!first_renderer){
// 		const renderer = new THREE.WebGLRenderer()
// 		POLY.renderers_controller.register_renderer(renderer)
// 	}

// }
