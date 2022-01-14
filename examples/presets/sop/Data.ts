import {DataSopNode} from '../../../src/engine/nodes/sop/Data';
import {BasePreset, NodePresetsCollection, PresetsCollectionFactory} from '../BasePreset';
const BASIC_DATA = [{height: 3}, {height: 4}];
const DEFAULT_DATA = [
	{value: -40},
	{value: -30},
	{value: -20},
	{value: -10},
	{value: 0},
	{value: 10},
	{value: 20},
	{value: 30},
	{value: 40},
	{value: 50},
	{value: 60},
	{value: 70},
	{value: 80},
];

// export function DataSopNodePresets() {
// 	return {
// 		basic: function (node: DataSopNode) {
// 			node.p.data.set(JSON.stringify(BASIC_DATA));
// 		},
// 		default: function (node: DataSopNode) {
// 			node.p.data.set(JSON.stringify(DEFAULT_DATA));
// 		},
// 	};
// }

const dataSopNodePresetsCollectionFactory: PresetsCollectionFactory<DataSopNode> = (node: DataSopNode) => {
	const collection = new NodePresetsCollection();

	const basic = new BasePreset().addEntry(node.p.data, JSON.stringify(BASIC_DATA));
	const defaultPreset = new BasePreset().addEntry(node.p.data, JSON.stringify(DEFAULT_DATA));
	collection.setPresets({
		basic,
		default: defaultPreset,
	});

	return collection;
};
export {DataSopNode, dataSopNodePresetsCollectionFactory};
