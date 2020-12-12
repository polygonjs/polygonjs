// import {SceneExporter} from '../../../../src/Engine/IO/Code/Export/Scene'
// import {SceneJsonExporter} from '../../../../src/Engine/IO/Json/Export/Scene'
// import {ParamType} from '../../../../src/Engine/Param/_Module'

// QUnit.test( "param can be marked as referencing an asset", async ( assert ) => {

// 	const scene = window.scene
// 	const geo1 = window.geo1
// 	const MAT = window.MAT

// 	const root = scene.root()
// 	const camera1 = root.createNode('perspective_camera')
// 	camera1.set_as_master_camera()

// 	const mesh_basic1 = MAT.createNode('mesh_basic')
// 	mesh_basic1.param('use_texture_map').set(1)

// 	const mesh_basic2 = MAT.createNode('mesh_basic')
// 	mesh_basic2.param('texture_map').set('/textures/red.png')

// 	const box1 = geo1.createNode('box')
// 	const material1 = geo1.createNode('material')
// 	material1.set_input(0, box1)
// 	material1.set_display_flag()
// 	material1.param('material').set(mesh_basic1.full_path())

// 	await material1.request_container_p()

// 	assert.ok( 		mesh_basic1.param('texture_map').is_referencing_asset() )
// 	assert.notOk( mesh_basic2.param('texture_map').is_referencing_asset() )

// 	const scene_json_exporter = new SceneJsonExporter(scene)
// 	const data = scene_json_exporter.data()

// 	const old_max_depth = QUnit.dump.maxDepth
// 	QUnit.dump.maxDepth = 10
// assert.deepEqual(data, {
//   "properties": {
//     "fps": 30,
//     "frame": 1,
//     "frame_range": [
//       1,
//       240
//     ],
//     "frame_range_locked": [
//       true,
//       true
//     ],
//     "master_camera_node_path": "/perspective_camera1",
//   },
//   "root": {
//     "nodes": {
//       "MAT": {
//         "inputs": [],
//         "nodes": {
//           "mesh_basic1": {
//             "inputs": [],
//             "params": {
// 							"texture_map": {
//               },
//               "use_texture_map": {
//                 "value": true
//               }
//             },
//             "type": "mesh_basic"
//           },
//           "mesh_basic2": {
//             "inputs": [],
//             "params": {
//               "texture_map": {
//                 "value": "/textures/red.png"
//               }
//             },
//             "type": "mesh_basic"
//           }
//         },
//         "params": {},
//         "selection": [],
//         "type": "materials"
//       },
//       "geo1": {
//         "display_flag": true,
//         "display_node_name": "material1",
//         "inputs": [],
//         "nodes": {
//           "box1": {
//             "inputs": [],
//             "params": {},
//             "type": "box"
//           },
//           "material1": {
//             "inputs": [
//               "box1"
//             ],
//             "params": {
// 							"material": {
//                 "value": "/MAT/mesh_basic1"
//               }
// 						},
//             "type": "material"
//           }
//         },
//         "params": {},
//         "selection": [],
//         "type": "geo"
//       },
//       "perspective_camera1": {
//         "display_flag": true,
//         "inputs": [],
//         "params": {},
//         "type": "perspective_camera"
//       }
//     },
//     "selection": [],
//     "type": "obj"
//   },
//   "ui": {
//     "nodes": {
//       "MAT": {
//         "nodes": {
//           "mesh_basic1": {
//             "pos": [
//               0,
//               0
//             ]
//           },
//           "mesh_basic2": {
//             "pos": [
//               0,
//               0
//             ]
//           }
//         },
//         "pos": [
//           0,
//           0
//         ]
//       },
//       "geo1": {
//         "nodes": {
//           "box1": {
//             "pos": [
//               0,
//               0
//             ]
//           },
//           "material1": {
//             "pos": [
//               0,
//               0
//             ]
//           }
//         },
//         "pos": [
//           0,
//           0
//         ]
//       },
//       "perspective_camera1": {
//         "pos": [
//           0,
//           0
//         ]
//       }
//     }
//   }
// })
// 	QUnit.dump.maxDepth = old_max_depth

// 	const new_scene = window.POLY.load_json(data)

// 	assert.ok( 		new_scene.node('/MAT/mesh_basic1').param('texture_map').is_referencing_asset() )
// 	assert.notOk( new_scene.node('/MAT/mesh_basic2').param('texture_map').is_referencing_asset() )

// });
