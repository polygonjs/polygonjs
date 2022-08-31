mat4 translate( vec3 t )
{
    return mat4( 1.0, 0.0, 0.0, 0.0,
				 0.0, 1.0, 0.0, 0.0,
				 0.0, 0.0, 1.0, 0.0,
				 t.x,   t.y,   t.z,   1.0 );
}

vec3 SDFTransform( in vec3 p, vec3 t, vec3 rot )
{	
	mat4 rotx = rotationMatrix( normalize(vec3(1.0,0.0,0.0)), rot.x );
	mat4 roty = rotationMatrix( normalize(vec3(0.0,1.0,0.0)), rot.y );
	mat4 rotz = rotationMatrix( normalize(vec3(0.0,0.0,1.0)), rot.z );
	mat4 tra = translate( t );
	mat4 mat = tra * rotx * roty * rotz; 
	mat4 matInverse = inverse( mat );
	return (matInverse * vec4(p, 1.)).xyz;
}
