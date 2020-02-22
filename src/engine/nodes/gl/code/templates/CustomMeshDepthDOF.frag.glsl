uniform float mNear;
uniform float mFar;

varying float vViewZDepth;

void main() {

	float color = 1.0 - smoothstep( mNear, mFar, vViewZDepth );
	gl_FragColor = vec4( vec3( color ), 1.0 );

}
