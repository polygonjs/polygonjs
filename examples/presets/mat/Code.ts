import {CodeMatNode, VERTEX_DEFAULT} from '../../../src/engine/nodes/mat/Code';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const EvanWallaceCC0 = `// https://madebyevan.com/shaders/grid/`;

const AntialiasedGridY = {
	vertex: VERTEX_DEFAULT,
	fragment: `
${EvanWallaceCC0}
varying vec3 vWorldPosition;

void main() {

	// Pick a coordinate to visualize in a grid
  float coord = 5.0 * vWorldPosition.y;

  // Compute anti-aliased world-space grid lines
  float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

  // Just visualize the grid lines directly
  float color = 1.0 - min(line, 1.0);

  // Apply gamma correction
  color = pow(color, 1.0 / 2.2);
  gl_FragColor = vec4(vec3(color), 1.0);

}
`,
};

const AntialiasedGridXZ = {
	vertex: VERTEX_DEFAULT,
	fragment: `
${EvanWallaceCC0}
varying vec3 vWorldPosition;

void main() {

	// Pick a coordinate to visualize in a grid
	vec2 coord = 5.0 * vWorldPosition.xz;

	// Compute anti-aliased world-space grid lines
	vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
	float line = min(grid.x, grid.y);

	// Just visualize the grid lines directly
	float color = 1.0 - min(line, 1.0);

	// Apply gamma correction
	color = pow(color, 1.0 / 2.2);
	gl_FragColor = vec4(vec3(color), 1.0);

}
`,
};

const AntialiasedGridXYZ = {
	vertex: VERTEX_DEFAULT,
	fragment: `
${EvanWallaceCC0}
varying vec3 vWorldPosition;

void main() {

	// Pick a coordinate to visualize in a grid
	vec3 coord = 5.0 * vWorldPosition.xyz;

	// Compute anti-aliased world-space grid lines
	vec3 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
	float line = min(min(grid.x, grid.y), grid.z);

	// Just visualize the grid lines directly
	float color = 1.0 - min(line, 1.0);

	// Apply gamma correction
	color = pow(color, 1.0 / 2.2);
	gl_FragColor = vec4(vec3(color), 1.0);
}
`,
};

const AntialiasedGridLengthXZ = {
	vertex: VERTEX_DEFAULT,
	fragment: `
${EvanWallaceCC0}
varying vec3 vWorldPosition;

void main() {

	// Pick a coordinate to visualize in a grid
	float coord = 5.0 * length(vWorldPosition.xz);

	// Compute anti-aliased world-space grid lines
	float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

	// Just visualize the grid lines directly
	float color = 1.0 - min(line, 1.0);

	// Apply gamma correction
	color = pow(color, 1.0 / 2.2);
	gl_FragColor = vec4(vec3(color), 1.0);
	}
`,
};

const AntialiasedGridWeb = {
	vertex: VERTEX_DEFAULT,
	fragment: `
${EvanWallaceCC0}
varying vec3 vWorldPosition;

void main() {

	// Pick a coordinate to visualize in a grid
	const float pi = 3.141592653589793;
	const float scale = 10.0;
	vec2 coord = vec2(length(5.0 * vWorldPosition.xz), atan(5.0 * vWorldPosition.x, 5.0 * vWorldPosition.z) * scale / pi);

	// Handling the wrap-around is tricky in this case. The function atan()
	// is not continuous and jumps when it wraps from -pi to pi. The screen-
	// space partial derivative will be huge along that boundary. To avoid
	// this, compute another coordinate that places the jump at a different
	// place, then use the coordinate where the jump is farther away.
	//
	// When doing this, make sure to always evaluate both fwidth() calls even
	// though we only use one. All fragment shader threads in the thread group
	// actually share a single instruction pointer, so threads that diverge
	// down different conditional branches actually cause both branches to be
	// serialized one after the other. Calling fwidth() from a thread next to
	// an inactive thread ends up reading inactive registers with old values
	// in them and you get an undefined value.
	//
	// The conditional uses +/-scale/2 since coord.y has a range of +/-scale.
	// The jump is at +/-scale for coord and at 0 for wrapped.
	vec2 wrapped = vec2(coord.x, fract(coord.y / (2.0 * scale)) * (2.0 * scale));
	vec2 coordWidth = fwidth(coord);
	vec2 wrappedWidth = fwidth(wrapped);
	vec2 width = coord.y < -scale * 0.5 || coord.y > scale * 0.5 ? wrappedWidth : coordWidth;

	// Compute anti-aliased world-space grid lines
	vec2 grid = abs(fract(coord - 0.5) - 0.5) / width;
	float line = min(grid.x, grid.y);

	// Just visualize the grid lines directly
	float color = 1.0 - min(line, 1.0);

	// Apply gamma correction
	color = pow(color, 1.0 / 2.2);
	gl_FragColor = vec4(vec3(color), 1.0);
}
`,
};

const codeMatNodePresetsCollectionFactory: PresetsCollectionFactory<CodeMatNode> = (node: CodeMatNode) => {
	const collection = new NodePresetsCollection();

	const antialiasedGridY = new BasePreset()
		.addEntry(node.p.vertex, AntialiasedGridY.vertex)
		.addEntry(node.p.fragment, AntialiasedGridY.fragment)
		.addEntry(node.p.clipCullDistance, true)
		.addEntry(node.p.multiDraw, true);
	const antialiasedGridXZ = new BasePreset()
		.addEntry(node.p.vertex, AntialiasedGridXZ.vertex)
		.addEntry(node.p.fragment, AntialiasedGridXZ.fragment)
		.addEntry(node.p.clipCullDistance, true)
		.addEntry(node.p.multiDraw, true);
	const antialiasedGridXYZ = new BasePreset()
		.addEntry(node.p.vertex, AntialiasedGridXYZ.vertex)
		.addEntry(node.p.fragment, AntialiasedGridXYZ.fragment)
		.addEntry(node.p.clipCullDistance, true)
		.addEntry(node.p.multiDraw, true);
	const antialiasedGridLengthXZ = new BasePreset()
		.addEntry(node.p.vertex, AntialiasedGridLengthXZ.vertex)
		.addEntry(node.p.fragment, AntialiasedGridLengthXZ.fragment)
		.addEntry(node.p.clipCullDistance, true)
		.addEntry(node.p.multiDraw, true);
	const antialiasedGridWeb = new BasePreset()
		.addEntry(node.p.vertex, AntialiasedGridWeb.vertex)
		.addEntry(node.p.fragment, AntialiasedGridWeb.fragment)
		.addEntry(node.p.clipCullDistance, true)
		.addEntry(node.p.multiDraw, true);

	collection.setPresets({
		antialiasedGridY,
		antialiasedGridXZ,
		antialiasedGridXYZ,
		antialiasedGridLengthXZ,
		antialiasedGridWeb,
	});

	return collection;
};
export const codeMatPresetRegister: PresetRegister<typeof CodeMatNode, CodeMatNode> = {
	nodeClass: CodeMatNode,
	setupFunc: codeMatNodePresetsCollectionFactory,
};
