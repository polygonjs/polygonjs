// import {MeshSubsurfaceScatteringMatNode} from '../../../src/engine/nodes/mat/MeshSubsurfaceScattering';
// import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

// // export function MeshSubsurfaceScatteringMatNodePresets() {
// // 	return {
// // 		bunny: function (node: MeshSubsurfaceScatteringMatNode) {
// // 			node.p.map.set('/COP/white');
// // 			node.p.thicknessMap.set('/COP/bunny_thickness');
// // 			node.p.diffuse.set([1.0, 0.2, 0.2]);
// // 			node.p.shininess.set(500);
// // 			node.p.thicknessColor.set([0.5, 0.3, 0]);
// // 			node.p.thicknessDistortion.set(0.1);
// // 			node.p.thicknessAmbient.set(0.4);
// // 			node.p.thicknessAttenuation.set(0.8);
// // 			node.p.thicknessPower.set(2.0);
// // 			node.p.thicknessScale.set(16.0);
// // 		},
// // 	};
// // }

// const meshSubsurfaceScatteringMatNodePresetsCollectionFactory: PresetsCollectionFactory<MeshSubsurfaceScatteringMatNode> =
// 	(node: MeshSubsurfaceScatteringMatNode) => {
// 		const collection = new NodePresetsCollection();

// 		const bunny = new BasePreset()
// 			.addEntry(node.p.map, `/COP/white`)
// 			.addEntry(node.p.thicknessMap, '/COP/bunny_thickness')
// 			.addEntry(node.p.diffuse, [1.0, 0.2, 0.2])
// 			.addEntry(node.p.shininess, 500)
// 			.addEntry(node.p.thicknessColor, [0.5, 0.3, 0])
// 			.addEntry(node.p.thicknessDistortion, 0.1)
// 			.addEntry(node.p.thicknessAmbient, 0.4)
// 			.addEntry(node.p.thicknessAttenuation, 0.8)
// 			.addEntry(node.p.thicknessPower, 2.0)
// 			.addEntry(node.p.thicknessScale, 16.0);
// 		collection.setPresets({
// 			bunny,
// 		});

// 		return collection;
// 	};
// export const meshSubsurfaceScatteringMatPresetRegister: PresetRegister<
// 	typeof MeshSubsurfaceScatteringMatNode,
// 	MeshSubsurfaceScatteringMatNode
// > = {
// 	nodeClass: MeshSubsurfaceScatteringMatNode,
// 	setupFunc: meshSubsurfaceScatteringMatNodePresetsCollectionFactory,
// };
