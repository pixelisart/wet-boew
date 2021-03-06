/**
 * @title WET-BOEW Data Json [data-json-after], [data-json-append],
 * [data-json-before], [data-json-prepend], [data-json-replace] and [data-json-replacewith]
 * @overview Insert content extracted from JSON file.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-data-json",
	selectors = [
		"[data-json-after]",
		"[data-json-append]",
		"[data-json-before]",
		"[data-json-prepend]",
		"[data-json-replace]",
		"[data-json-replacewith]"
	],
	selectorsLength = selectors.length,
	selector = selectors.join( "," ),
	initEvent = "wb-init." + componentName,
	updateEvent = "wb-update." + componentName,
	contentUpdatedEvent = "wb-contentupdated",
	$document = wb.doc,
	s,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered this handler
	 * @param {string} ajaxType The type of JSON operation, either after, append, before or replace
	 */
	init = function( event, ajaxType ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName + "-" + ajaxType, selector );

		if ( elm ) {

			ajax.apply( this, arguments );

			// Identify that initialization has completed
			wb.ready( $( elm ), componentName, [ ajaxType ] );
		}
	},

	ajax = function( event, ajaxType ) {
		var elm = event.target,
			$elm = $( elm ),
			settings = window[ componentName ],
			url = elm.getAttribute( "data-json-" + ajaxType ),
			fetchObj = {
				url: url
			},
			urlParts;

		// Detect CORS requests
		if ( settings && ( url.substr( 0, 4 ) === "http" || url.substr( 0, 2 ) === "//" ) ) {
			urlParts = wb.getUrlParts( url );
			if ( ( wb.pageUrlParts.protocol !== urlParts.protocol || wb.pageUrlParts.host !== urlParts.host ) && ( !Modernizr.cors || settings.forceCorsFallback ) ) {
				if ( typeof settings.corsFallback === "function" ) {
					fetchObj.dataType = "jsonp";
					fetchObj.jsonp = "callback";
					fetchObj = settings.corsFallback( fetchObj );
				}
			}
		}

		$elm.trigger( {
			type: "json-fetch.wb",
			fetch: fetchObj
		} );
	};

$document.on( "timerpoke.wb " + initEvent + " " + updateEvent + " json-fetched.wb", selector, function( event ) {
	var eventTarget = event.target,
		ajaxTypes = [
			"before",
			"replace",
			"replacewith",
			"after",
			"append",
			"prepend"
		],
		len = ajaxTypes.length,
		$elm, ajaxType, i, content, jQueryCaching;

	for ( i = 0; i !== len; i += 1 ) {
		ajaxType = ajaxTypes[ i ];
		if ( this.getAttribute( "data-json-" + ajaxType ) !== null ) {
			break;
		}
	}

	switch ( event.type ) {

	case "timerpoke":
	case "wb-init":
		init( event, ajaxType );
		break;
	case "wb-update":
		ajax( event, ajaxType );
		break;
	default:

		// Filter out any events triggered by descendants
		if ( event.currentTarget === eventTarget ) {
			$elm = $( eventTarget );

			// json-fetched event
			content = event.fetch.response;
			if ( content &&  content.length > 0 ) {

				//Prevents the force caching of nested resources
				jQueryCaching = jQuery.ajaxSettings.cache;
				jQuery.ajaxSettings.cache = true;

				// "replace" and "replaceWith" doesn't map to a jQuery function
				if ( ajaxType === "replace" ) {
					$elm.html( content );
				} else if ( ajaxType === "replacewith" ) {
					$elm.replaceWith( content );
				} else {
					$elm[ ajaxType ]( content );
				}

				//Resets the initial jQuery caching setting
				jQuery.ajaxSettings.cache = jQueryCaching;

				$elm.trigger( contentUpdatedEvent, { "ajax-type": ajaxType, "content": content } );
			}
		}
	}

	/*
	 * Since we are working with events we want to ensure that we are being
	 * passive about our control, so returning true allows for events to always
	 * continue
	 */
	return true;
} );

// Add the timerpoke to initialize the plugin
for ( s = 0; s !== selectorsLength; s += 1 ) {
	wb.add( selectors[ s ] );
}

} )( jQuery, window, wb );
