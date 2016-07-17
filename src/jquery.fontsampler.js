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
				fontFile: null,
				singleLine: true
			},
			fontFaceDeclarations = {},
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
		}

		// Avoid Plugin.prototype conflicts
		$.extend( Plugin.prototype, {
			init: function() {
				fontFamily = declareFontFace( this.settings.fontFile );
				this.setupUI();
				this.setFont(fontFamily);
			},
			setupUI: function() {
				var that = this;
				$( this.element ).attr( "contenteditable", "true" );

				$( this.element ).on( "sizeChange", this.onSizeChange );
				$( this.element ).on( "keypress", function( event ) {
					return that.onKeyPress( event, that );
				} );
				$( this.element ).on( "fontChange", function( event ) {
					that.onFontChange( arguments[1] );
				} );
			},
			setFont: function (name) {
				$( this.element ).css( "fontFamily", fontFamily );
			},
			onKeyPress: function( event, that ) {
				if ( that.settings.singleLine && event.keyCode === 13 ) {
					return false;
				}
			},
			onSizeChange: function() {
				$( this ).css( "font-size", arguments[ 1 ] );
			},
			onFontChange: function ( file ) {
				fontFamily = declareFontFace( file );
				this.setFont( fontFamily );
			}
		} );

		// append a new style @font-face declaration
		// TODO supported formats?
		// TODO track and check existing declarations
		function declareFontFace ( file ) {
			console.log("dec", file, fontFaceDeclarations);
			if ( fontFaceDeclarations[file] !== undefined ) {
				console.log("already dec");
				return fontFaceDeclarations[file];
			}
		    var newStyle = document.createElement('style');
		    var newName = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20);
		    newStyle.appendChild(document.createTextNode("\
		        @font-face {\
		            font-family: '" + newName + "';\
		            src: url('" + file + ".woff') format(woff)\
		        }\
		    "));
		    document.head.appendChild(newStyle);

			fontFaceDeclarations[file] = newName;
		    console.log(newName)
		    return newName;
		}

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" +
						pluginName, new Plugin( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );
