
#define DISTANCE

uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <clipping_planes_pars_fragment>

void main () {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( 1.0 );

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>

	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist ); // clamp to [ 0, 1 ]

	gl_FragColor = packDepthToRGBA( dist );

	// INSERT BODY

	// all this shader above the INSERT BODY line
	// is copied from the threejs ShaderLib.depth template fragment shader.
	// The line below is necessary to tie the alpha to the one that is computed by the gl nodes.
	// I'm not entirely sure why I need to negate diffuseColor.a with '1.0 -'
	// but it seems to be what make the shader match the alpha of the main material.
	gl_FragColor.a = 1.0 - diffuseColor.a;

}
