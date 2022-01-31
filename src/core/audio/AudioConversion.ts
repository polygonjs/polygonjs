export function convertFrequencyBandsToOctaveBandsDivisions2(
	values: Float32Array | number[],
	target: Float32Array,
	divisions: number
) {
	const divisionsMult = divisions;
	let octaveIndex = 0;
	let currentOctaveSize = 1;
	const valuesCount = values.length;
	const divideMethod = divisions == 2 ? divideOctave2 : divideOctave4;
	for (let i = 0; i < valuesCount; ) {
		// let currentOctaveValue = 0;
		// const valuesCount0 = Math.max(1, Math.floor(currentOctaveSize / 3));
		// const valuesCount1 = currentOctaveSize - valuesCount0;
		// let j = 0;
		// for (; j < valuesCount0; j++) {
		// 	const currentIndex = i + j;
		// 	currentOctaveValue += values[currentIndex];
		// }
		// target[octaveIndex] = currentOctaveValue * divisionsMult;
		// octaveIndex++;
		// currentOctaveValue = 0;
		// for (; j < valuesCount1; j++) {
		// 	const currentIndex = i + j;
		// 	currentOctaveValue += values[currentIndex];
		// }
		// target[octaveIndex] = currentOctaveValue * divisionsMult;
		// octaveIndex++;
		const {octaveIndexTmp} = divideMethod({values, target, currentOctaveSize, i, octaveIndex, divisionsMult});
		octaveIndex = octaveIndexTmp;

		i += currentOctaveSize;
		currentOctaveSize *= 2;
	}
}
interface DivideParams {
	values: Float32Array | number[];
	target: Float32Array;
	currentOctaveSize: number;
	i: number;
	octaveIndex: number;
	divisionsMult: number;
}
// function divideOctave2(params: DivideParams) {
// 	const {values, target, currentOctaveSize, i, octaveIndex, divisionsMult} = params;
// 	let octaveIndexTmp = octaveIndex;
// 	let currentOctaveValue = 0;
// 	const valuesCount0 = Math.max(1, Math.floor(currentOctaveSize / 3));
// 	const valuesCount1 = currentOctaveSize - valuesCount0;
// 	let j = 0;
// 	for (; j < valuesCount0; j++) {
// 		const currentIndex = i + j;
// 		currentOctaveValue += values[currentIndex];
// 	}
// 	target[octaveIndexTmp] = currentOctaveValue * divisionsMult;
// 	octaveIndexTmp++;
// 	currentOctaveValue = 0;
// 	j = 0;
// 	for (; j < valuesCount1; j++) {
// 		const currentIndex = i + j;
// 		currentOctaveValue += values[currentIndex];
// 	}
// 	target[octaveIndexTmp] = currentOctaveValue * divisionsMult;
// 	octaveIndexTmp++;
// 	return {octaveIndexTmp};
// }
function divideOctave2(params: DivideParams) {
	const {values, target, currentOctaveSize, i, octaveIndex, divisionsMult} = params;
	let octaveIndexTmp = octaveIndex;
	const [valuesCount0, valuesCount1] = octaveSubSizes(currentOctaveSize);

	let currentOctaveStart = 0;
	const sizes = [valuesCount0, valuesCount1];
	for (let size of sizes) {
		let currentOctaveValue = 0;
		for (let j = 0; j < size; j++) {
			const currentIndex = i + j + currentOctaveStart;
			currentOctaveValue += values[currentIndex];
		}
		currentOctaveStart += size;
		target[octaveIndexTmp] = currentOctaveValue * divisionsMult;

		octaveIndexTmp++;
	}

	return {octaveIndexTmp};
}
function octaveSubSizes(currentOctaveSize: number) {
	const valuesCount0 = Math.max(1, Math.floor(currentOctaveSize / 3));
	const valuesCount1 = currentOctaveSize - valuesCount0;
	return [valuesCount0, valuesCount1];
}
function divideOctave4(params: DivideParams) {
	const {values, target, currentOctaveSize, i, octaveIndex, divisionsMult} = params;
	let octaveIndexTmp = octaveIndex;

	const [valuesCount0, valuesCount1] = octaveSubSizes(currentOctaveSize);
	const [valuesCount00, valuesCount01] = octaveSubSizes(valuesCount0);
	const [valuesCount10, valuesCount11] = octaveSubSizes(valuesCount1);

	let currentOctaveStart = 0;
	const sizes = [valuesCount00, valuesCount01, valuesCount10, valuesCount11];
	for (let size of sizes) {
		let currentOctaveValue = 0;
		for (let j = 0; j < size; j++) {
			const currentIndex = i + j + currentOctaveStart;
			currentOctaveValue += values[currentIndex];
		}
		currentOctaveStart += size;
		target[octaveIndexTmp] = currentOctaveValue * divisionsMult;

		octaveIndexTmp++;
	}

	return {octaveIndexTmp};
}

export function convertFrequencyBandsToOctaveBands(values: Float32Array | number[], target: Float32Array) {
	let octaveIndex = 0;
	let currentOctaveSize = 1;
	const valuesCount = values.length;
	for (let i = 0; i < valuesCount; ) {
		let currentOctaveValue = 0;
		// let frequenciesCount = 0;
		for (let j = 0; j < currentOctaveSize; j++) {
			currentOctaveValue += values[i + j];
			// frequenciesCount++;
		}
		target[octaveIndex] = currentOctaveValue; // / frequenciesCount;
		i += currentOctaveSize;
		currentOctaveSize *= 2;
		octaveIndex++;
	}
}
