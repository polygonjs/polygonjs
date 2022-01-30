
#include <common>

varying float vViewZDepth;

// INSERT DEFINES



void main() {

	// INSERT BODY


	#include <project_vertex>

	vViewZDepth = - mvPosition.z;
}
