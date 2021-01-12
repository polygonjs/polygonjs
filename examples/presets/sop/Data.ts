import {DataSopNode} from '../../../src/engine/nodes/sop/Data';

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

export function DataSopNodePresets() {
	return {
		basic: function (node: DataSopNode) {
			node.p.data.set(JSON.stringify(BASIC_DATA));
		},
		default: function (node: DataSopNode) {
			node.p.data.set(JSON.stringify(DEFAULT_DATA));
		},
	};
}
