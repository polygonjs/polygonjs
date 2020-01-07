varying vec2 vUv;
uniform sampler2D uTexture;
void main(){
	gl_FragColor = texture2D( uTexture , vUv );
	// gl_FragColor = vec4( vUv , 0. , 1. );
}