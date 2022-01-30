
uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>

varying float vViewZDepth;

// INSERT DEFINES



void main() {

	// INSERT BODY


	vLineDistance = scale * lineDistance;
	gl_Position = projectionMatrix * mvPosition;

	vViewZDepth = - mvPosition.z;


}
