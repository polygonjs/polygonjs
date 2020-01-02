varying float vViewZDepth;

void main() {

	#include <begin_vertex>
	#include <project_vertex>

	vViewZDepth = - mvPosition.z;

}
