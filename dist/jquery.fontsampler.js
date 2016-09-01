/*
 *  jquery-fontsampler - v0.0.1
 *  A jQuery plugin for displaying, manipulating and testing webfont type samples
 *  https://github.com/kontur/jquery-fontsampler
 *
 *  Made by Johannes Neumeier
 *  Under Apache 2.0 License
 */
/**
 * Copyright 2016 Johannes Neumeier
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

    "use strict";

        // undefined is used here as the undefined global variable in ECMAScript 3 is
        // mutable ( ie. it can be changed by someone else ). undefined isn't really being
        // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
        // can no longer be modified.

        // window and document are passed through as local variables rather than global
        // as this ( slightly ) quickens the resolution process and can be more efficiently
        // minified ( especially when both are regularly referenced in your plugin ).

        // Create the defaults once
        var pluginName = "fontSampler",
            defaults = {
                fontFiles: null,
                multiLine: true
            },
            fontFamily = "";

        // The actual plugin constructor
        function Plugin ( element, options ) {
            this.element = element;

            // jQuery has an extend method which merges the contents of two or
            // more objects, storing the result in the first object. The first object
            // is generally empty as we don't want to alter the default options for
            // future instances of the plugin
            this.settings = $.extend( {}, defaults, options );
            this._defaults = defaults;
            this._name = pluginName;
            this.init();

            // public methods
            this.changeSize = function( args ) {
                this.setSize( args[ 1 ] );
            };

            this.changeFont = function( args ) {
                fontFamily = declareFontFace( args[ 1 ] );
                this.setFont( fontFamily );
            };

            this.changeLetterSpacing = function( args ) {
                this.setLetterSpacing( args[ 1 ] );
            };

            this.changeLeading = function( args ) {
                this.setLeading( args[ 1 ] );
            };
        }

        // Avoid Plugin.prototype conflicts
        $.extend( Plugin.prototype, {
            init: function() {
                fontFamily = declareFontFace( this.settings.fontFiles );
                this.setupUI();
                this.setFont( fontFamily );
            },
            setupUI: function() {
                var that = this;
                $( this.element ).attr( "contenteditable", "true" );
                $( this.element ).on( "keypress", function( event ) {
                    return that.onKeyPress( event, that );
                } );
            },

            // internal event listeners
            onKeyPress: function( event, that ) {
                if ( that.settings.multiLine === false && event.keyCode === 13 ) {
                    return false;
                }
            },

            // manipulation methods mirrored from public mthods
            setFont: function() {
                $( this.element ).css( "fontFamily", fontFamily );
            },
            setSize: function( size ) {
                $( this.element ).css( "font-size", size );
            },
            setLetterSpacing: function( spacing ) {
                $( this.element ).css( "letter-spacing", spacing );
            },
            setLeading: function( leading ) {
                $( this.element ).css( "line-height", leading );
            }
        });


        // append a new style @font-face declaration
        // TODO format check
        // TODO track and check existing declarations
        function declareFontFace ( files ) {
            // generate a random string font-family name that is specific to this file
            var newName = Math.random().toString( 36 ).replace( /[^a-z]+/g, "" ).substr( 0, 20 );
            var newStyle = document.createElement( "style" );
            newStyle.appendChild( document.createTextNode( generateFontFace(newName, files)));
            document.head.appendChild( newStyle );
            return newName;
        }


        /*
         * Helper that generates a CSS font face declaration based on font name and passed in files
         */
        function generateFontFace ( name, files, weight, style ) {
        	console.log(name, files);

        	if (typeof name === "undefined" || typeof files === "undefined" || !files) {
        		return "";
        	}

            var declaration = "";

            if (typeof weight === "undefined") {
                weight = "normal";
            }
            if (typeof style === "undefined") {
                style = "normal";
            }

            declaration = declaration.concat("\n");
            declaration = declaration.concat("@font-face {\n");
            declaration = declaration.concat("font-family: '" + name + "';\n");

            //var formats = ["eot", "woff2", "woff", "ttf", "svg"];
            var formats = ["woff"];

            for (var f = 0; f < formats.length; f++) {
            	var format = formats[f];
            	if (format in files) {
            		if (format === "eot") {
            			declaration = declaration.concat("src: url('" + files.eot + "');\n");
                		declaration = declaration.concat("src: url('" + files.eot + "?#iefix') format('embedded-opentype')");
            		} else {
            			if (f === 0) {
            				declaration = declaration.concat("src: ");
            			}
            			if (format === "ttf") {
            				declaration = declaration.concat("url('" + files.ttf + "') format('truetype')");
            			} else if (format === "svg") {
            				declaration = declaration.concat("url('" + files.svg + "#" + name + "') format('svg')");
            			} else {
                			declaration = declaration.concat("url('" + files[format] + "') format('" + format + "')");
            			}
            		}
            		if (f < formats.length - 1) {
            			declaration = declaration.concat(",\n");
            		} else {
            			declaration = declaration.concat(";\n");
            		}
            	}
            }

            declaration = declaration.concat("font-weight: " + weight + ";\n");
            declaration = declaration.concat("font-style: " + style + ";\n");
            declaration = declaration.concat("}\n");

            return declaration;
        }


        // A really lightweight plugin wrapper around the constructor,
        // preventing against multiple instantiations
        $.fn[ pluginName ] = function( options ) {
            var args = arguments;
            return this.each( function() {
                if ( !$.data( this, "plugin_" + pluginName ) ) {
                    if ( typeof options !== "object" || options === undefined ) {
                        console.log( "fontSampler initialized without or invalid options" );
                    } else {
                        $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
                    }
                } else if ( $.data( this, "plugin_" + pluginName ) &&
                    $( this ).data( "plugin_" + pluginName )[ options ] !== undefined ) {
                    return $( this ).data( "plugin_" + pluginName )[ options ]( args );
                } else {
                    console.log( "fontSampler non existing method called" );
                }
            } );
        };

} )( jQuery, window, document );