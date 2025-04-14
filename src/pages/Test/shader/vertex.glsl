#include <simplex2DNoise>

void main()
{
    csm_Position.y += simplexNoise2d(csm_Position.xz) * 0.25;
}