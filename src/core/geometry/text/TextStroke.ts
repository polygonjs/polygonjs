import {Shape, Path, Vector3, BufferGeometry} from 'three';
import {CoreLoaderFont} from '../../loader/font/CoreFontLoader';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader';
import {mergeBufferGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';

interface TextStrokesParams {
	shapes?: Array<Array<Shape | Path>>;
	strokeWidth: number;
}
interface TextStrokeParams {
	shapes?: Array<Shape | Path>;
	strokeWidth: number;
	loader: typeof SVGLoader;
}
export async function createGeometriesFromTypeStroke(params: TextStrokesParams) {
	const loader = await CoreLoaderFont.loadSVGLoader();
	if (!loader) {
		return;
	}
	return params.shapes?.map((shape) =>
		createGeometryFromTypeStroke({
			loader,
			shapes: shape,
			strokeWidth: params.strokeWidth,
		})
	);
}
function createGeometryFromTypeStroke(params: TextStrokeParams) {
	if (!params.shapes) {
		return;
	}
	// TODO: typescript: correct definition for last 3 optional args
	var style = params.loader.getStrokeStyle(params.strokeWidth, 'white', 'miter', 'butt', 4);
	const geometries: BufferGeometry[] = [];

	for (let i = 0; i < params.shapes.length; i++) {
		const shape = params.shapes[i];
		const points = shape.getPoints();
		const arcDivisions = 12;
		const minDistance = 0.001;
		const geometry = params.loader.pointsToStroke((<unknown>points) as Vector3[], style, arcDivisions, minDistance);
		geometries.push(geometry);
	}
	if (geometries.length > 0) {
		const mergedGeometry = mergeBufferGeometries(geometries);
		return mergedGeometry;
	}
}
