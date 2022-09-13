// https://www.shadertoy.com/view/XtBfzz
// https://iquilezles.org/articles/checkerfiltering/

float gridTextureGradBox( in vec2 p, in float lineWidth, in vec2 ddx, in vec2 ddy )
{
	// filter kernel
	vec2 w = max(abs(ddx), abs(ddy)) + 0.01;

	// analytic (box) filtering
	vec2 a = p + 0.5*w;
	vec2 b = p - 0.5*w;
	vec2 i = (floor(a)+min(fract(a)/lineWidth,1.0)-
				floor(b)-min(fract(b)/lineWidth,1.0))/(w/lineWidth);
	//pattern
	return (1.0-i.x)*(1.0-i.y);
}

float grid( in vec2 p, in float lineWidth )
{
    // coordinates
    vec2 i = step( fract(p), vec2(1.0*lineWidth) );
    //pattern
    return (1.0-i.x)*(1.0-i.y);   // grid (N=10)
    
    // other possible patterns are these
    //return 1.0-i.x*i.y;           // squares (N=4)
    //return 1.0-i.x-i.y+2.0*i.x*i.y; // checker (N=2)
}