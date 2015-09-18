//
// Pigment
//

module Pigment {
    //
    // This is the most basic interface describing a color: a red green and blue triplet.
    //
    // Values start from (0,0,0), which represents black. (1,1,1) represents the brightest
    // a pixel can be, but this library is designed to work with higher values, representing
    // colors brighter than those than a screen can display. These values use a linear
    // encoding (so that 0.5 is half as bright as 1.0)
    //
    // RGB colors such as this represent an emissive color: ie, that emanating from a light
    // source. Pixels on a computer monitor are effectively tiny lights, so this is a good
    // way to represent the light emitted from a pixel.
    //
    // This is also a good way to represent the color of a light source (such as a bulb or
    // the sun).
    //
    export interface EmissiveColor {
        red: number;
        green: number;
        blue: number;
    };

    //
    // Represents a basic RGB color
    //
    export class RgbColor implements EmissiveColor {
        red: number;
        green: number;
        blue: number;
    };

    //
    // This represents the color of a physical object
    //
    // Colour in physical objects works by absorbing light; a light ray (with red, green and blue components)
    // hits an object and some portion of the various colors that make it up are absorbed as the ray is
    // reflected in variou directions.
    //
    // As the values in here represent a portion of light that's reflected from an object, they have the range
    // 0-1, where 0 represents light that is completely absorbed and 1 represents light that is completely 
    // reflected.
    //
    export interface ReflectiveColor {
        //
        // Represents the portion of red light that is absorbed by this material (0-1)
        //
        cyan: number;

        //
        // Represents the portion of green light that is absorbed by this material (0-1)
        //
        magenta: number;

        //
        // Represents the portion of yellow light that is absorbed by this material (0-1)
        //
        yellow: number;

        //
        // Represents the amount of light in general that's absorbed by this material (0-1)
        //
        key: number;
    };
}
