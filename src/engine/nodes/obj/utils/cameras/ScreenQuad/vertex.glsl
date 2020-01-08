uniform vec4 uSize;
uniform vec2 uSide;
varying vec2 vUv;
void main(){
	vUv = uv;
	vec2 transformed = position.xy * uSize.xy;
	// transformed += vec2( -1. , 1. ) - vec2( - uSize.x , uSize.y );
	transformed += uSide - uSide * vec2( uSize.x , uSize.y );
	transformed += uSide * vec2( - uSize.w , - uSize.z ) * 2.;
	gl_Position = vec4( transformed , 1. , 1. );
}