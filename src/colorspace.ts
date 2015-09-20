//
// Pigment
//

module Pigment {
    var max = Math.max;
    var min = Math.min;
    var abs = Math.abs;

    //
    // Represents a color space
    //
    // A color space converts a source color to an equivalent color in a different space.
    //
    export interface ColorSpace<TSourceColor, TDestColor> {
        //
        // 'Encodes' a source color, producing a destination color
        //
        encode: (TSourceColor) => TDestColor;

        //
        // 'Decodes' a destination color, producing a source color
        //
        decode: (TDestColor) => TSourceColor;
    };

    //
    // Clamps a value to the range 0-1
    //
    function clamp(value: number) {
        if (value < 0.0) return 0.0;
        if (value > 1.0) return 1.0;
        return value;
    }

    //
    // Convets to and from a screen color space
    //
    // This applies gamma correction and clamps the values to a 0-1 range to generate a final color.
    // Note that the clamping is simple; if there are out of range values in use, then this will produce
    // distorted colors with no attempt at correction.
    //
    // The most common distortion will be when a color is oversaturated. For example, a color with a red
    // value of 2 will be clamped to 1, meaning that it looks no different.
    //
    export class ScreenColorSpace implements ColorSpace<EmissiveColor, EmissiveColor> {
        constructor(encodeGamma?: GammaFunction, decodeGamma?: GammaFunction) {
            encodeGamma = encodeGamma || createGammaFunction(defaultEncodingGamma);
            decodeGamma = decodeGamma || createGammaFunction(defaultDecodingGamma);

            this.encode = value => {
                return {
                    red:    clamp(encodeGamma(value.red)),
                    green:  clamp(encodeGamma(value.green)),
                    blue:   clamp(encodeGamma(value.blue))
                };
            };

            this.decode = value => {
                return {
                    red:    clamp(decodeGamma(value.red)),
                    green:  clamp(decodeGamma(value.green)),
                    blue:   clamp(decodeGamma(value.blue))
                };
            };
        }

        encode: (EmissiveColor) => EmissiveColor;
        decode: (EmissiveColor) => EmissiveColor;
    };

    //
    // A color space that deals with oversaturated color components by distributing the 'extra' light to other
    // components.
    //
    // For example, a red value of 2 will distribute 0.5 units to blue and green.
    //
    export class SaturatingColorSpace implements ColorSpace<EmissiveColor, EmissiveColor> {
        constructor() {
            // Decoding goes straight through (we can't meaningfully reverse this transformation)
            this.decode = value => value;

            // Returns the amount of oversaturation in a particular value
            function oversaturation(value: number) {
                if (value > 1.0) return value-1.0;
                return 0;
            }

            // Distributes the 'extra' light caused by oversaturating a color
            // TODO: it would be nice if we distribute too much color to a component to
            // distribute the remainder to the remaining component.
            this.encode = value => {
                var redOver     = oversaturation(value.red);
                var greenOver   = oversaturation(value.green);
                var blueOver    = oversaturation(value.blue);

                return {
                    red:    clamp(value.red-redOver     + (greenOver*0.5 + blueOver*0.5)),
                    green:  clamp(value.green-greenOver + (redOver*0.5 + blueOver*0.5)),
                    blue:   clamp(value.blue-blueOver   + (redOver*0.5 + greenOver*0.5))
                };
            }
        }

        encode: (EmissiveColor) => EmissiveColor;
        decode: (EmissiveColor) => EmissiveColor;
    };

    //
    // A color space that performs simple CMYK -> RGB translation
    //
    export class SimpleCmykColorSpace implements ColorSpace<ReflectiveColor, EmissiveColor> {
        constructor() {
        }

        encode(reflect: ReflectiveColor) {
            var red     = 1-clamp(reflect.cyan);
            var green   = 1-clamp(reflect.magenta);
            var blue    = 1-clamp(reflect.yellow);

            red     *= 1-reflect.key;
            green   *= 1-reflect.key;
            blue    *= 1-reflect.key;

            return {
                red:    red,
                green:  green,
                blue:   blue
            };
        }
    
        decode(emit: EmissiveColor) {
            var cyan: number, magenta: number, yellow: number;
            var key     = 1-max(clamp(emit.red), clamp(emit.green), clamp(emit.blue));

            if (key < 1.0) {
                cyan    = 1-(clamp(emit.red)/(1-key));
                magenta = 1-(clamp(emit.green)/(1-key));
                yellow  = 1-(clamp(emit.blue)/(1-key));
            } else {
                cyan = magenta = yellow = 0;
            }

            return {
                cyan:       cyan,
                magenta:    magenta,
                yellow:     yellow,
                key:        key
            };
        }
    };

    //
    // Basic conversion from the HSV to the RGB color space
    //
    export class SimpleHsvColorSpace implements ColorSpace<HsvColor, EmissiveColor> {
        constructor() {
        }

        encode(hsv: HsvColor) {
            var h = abs(hsv.hue % 360);
            var s = clamp(hsv.saturation);
            var v = clamp(hsv.value);

            var c = s * v;
            var x = c * (1-abs((h/60) % 2 - 1));
            var m = v - c;

            var ra = 0;
            var ga = 0;
            var ba = 0;

            if (h < 60) {
                ra = c; ga = x;
            } else if (h < 120) {
                ra = x; ga = c;
            } else if (h < 180) {
                ga = c; ba = x;
            } else if (h < 240) {
                ga = x; ba = c;
            } else if (h < 300) {
                ra = x; ba = c;
            } else /* if (h < 360) */ {
                ra = c; ba = x;
            }

            return {
                red: ra + m,
                green: ga + m,
                blue: ba + m
            };
        }

        decode(rgb: EmissiveColor) {
            var r = clamp(rgb.red);
            var g = clamp(rgb.green);
            var b = clamp(rgb.blue);

            var cmax = max(r, g, b);
            var cmin = min(r, g, b);

            var delta = cmin-cmax;

            var h = 0;

            if (delta > 0) {
                if (cmax === r) {
                    h = 60 * (((g-b)/delta)%6);
                } else if (cmax === g) {
                    h = 60 * (((b-r)/delta)+2);
                } else if (cmax === b) {
                    h = 60 * (((r-g)/delta)+4);
                }
            }

            var s = 0;
            if (cmax > 0) {
                s = delta / cmax;
            }

            return {
                hue: h,
                saturation: s,
                value: cmax
            };
        }
    };

    //
    // Creates a new colorspace by chaining two existing colorspaces together
    //
    export function chainColorSpaces<TSource, TIntermediate, TDest>(first: ColorSpace<TSource, TIntermediate>, second: ColorSpace<TIntermediate, TDest>) : ColorSpace<TSource, TDest> {
        return {
            encode: value => {
                return second.encode(first.encode(value));
            },

            decode: value => {
                return first.decode(second.decode(value));
            }
        };
    }

    //
    // Creates a colorspace that converts types the other way (for example, changing the CMYK -> RGB
    // colorspace into a RGB -> CMYK colorspace)
    //
    export function reverseColorSpace<TSource, TDest>(toReverse: ColorSpace<TDest, TSource>) {
        return {
            encode: toReverse.decode,
            decode: toReverse.encode
        };
    }

    //
    // Represents the default colorspace that is used most often
    //
    export var defaultColorSpace: ColorSpace<EmissiveColor, EmissiveColor> = chainColorSpaces(new SaturatingColorSpace(), new ScreenColorSpace());

    //
    // Represents a simple but not particularly accurate way to convert from CMYK to screen colors
    //
    export var defaultCmykColorSpace: ColorSpace<ReflectiveColor, EmissiveColor> = chainColorSpaces(new SimpleCmykColorSpace(), defaultColorSpace);
}
