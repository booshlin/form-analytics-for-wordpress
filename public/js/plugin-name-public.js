// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = ( window.console = window.console || {} );

    while ( length-- ) {
        method = methods[length];

        // Only stub undefined methods.
        if ( !console[method] ) {
            console[method] = noop;
        }
    }
}());

//
// Compatability with WordPress
//
function truthy( value ) {
        "use strict";
 
        value = typeof value !== "undefined" ? value : "";

        var result = false;

        switch( value ) {

        	case "1":
        	case 1:
        	case true:
        	case "true":
        		result = true;
        		break;

        	default:
        		break;
        }

        return result;
}

function _log( s ) {
	"use strict";
	if ( ( typeof boosh_form_config !== "undefined" ) &&
		truthy( boosh_form_config.debug ) ) {
		console.log( "[Boosh]: " + s );
	}
}

function _err(s) {
	"use strict";

	if ( ( typeof boosh_form_config !== "undefined" ) &&
		truthy( boosh_form_config.debug ) ) {
		console.error( "[Boosh]: " + s );
	}
}

var BooshForm = {

	dom : null,

	name : "",

	// 
	type : "", 

	events : {
		visibilityPartial  : false,
		visibilityComplete : false,
		fieldFocus         : false,
		submitAttempt      : false,
		submitSuccess      : false
	},

	position : {
		top    : null,
		bottom : null
	},

	setName : function( slug, id, name, role, key ) {

		slug = slug === undefined || slug === null ? "" : slug + "_";
		id   = id   === undefined || id   === null ? "" : id   + "_";
		name = name === undefined || name === null ? "" : name + "_";
		role = role === undefined || role === null ? "" : role + "_";
		key  = key  === undefined || key  === null ? "" : key;

		var formName = slug + id + name + role + key;

		if ( formName === "" ) {
			_err('Form Name cannot be set');
			return false;
		}

		this.name = formName;
	},

	record : function ( type ) {

		switch( type ) {
			case 'fieldFocus':
				if ( this.events.fieldFocus === false ) {
					this.events.fieldFocus = true;
					this.trigger( type );
				}
				break;

			case 'visibilityPartial':
				if ( this.events.visibilityPartial === false ) {
					this.events.visibilityPartial = true;
					this.trigger( type );
				}
				break;

			case 'visibilityComplete':
				if ( this.events.visibilityComplete === false ) {
					this.events.visibilityComplete = true;
					this.trigger( type );
				}
				break;

			case 'submitAttempt':
				// Can be submitted more than once.
				this.events.submitAttempt = true;
				this.trigger( type );
				break;

			case 'submitSuccess':
				if ( this.events.submitSuccess === false ) {
					this.events.submitSuccess = true;
					this.trigger( type );
				}
				break;

			default:
				_log('Unknown event type: ' + type);
				return false;
		}
	},

	trigger : function ( type ) {

		_log( this.name + ': Event ' + type + ' firing.' );

		var booshForm = this;

	    var params = {
	        hitType       : 'event',
	        eventCategory : 'Booshlin Form Events',
	        eventAction   : type,
	        eventLabel    : this.name,
	        hitCallback : function() {
		    	_log( booshForm.name + ': Event ' + type + ' successful.' );
		    }
	    };

	    var _ga = boosh.formManager.getGA();
	    _ga( 'send', params );
	},

	findType : function () {

		classes = this.dom.className.split(' ');
		if ( classes.indexOf('wpcf7-form') !== -1 ) {
			return 'wpcf7-form';
		}

		return "";
	},

	setType : function ( type ) {
		this.type = type;
	},

	isType : function ( type ) {

	},

	cumulativeOffset: function(element) {
		'use strict';
		
	    var top = 0, left = 0;

	    do {
	        top += element.offsetTop  || 0;
	        left += element.offsetLeft || 0;
	        element = element.offsetParent;
	    } while(element);

	    return {
	        top: top,
	        left: left
	    };
	}
};

var boosh = boosh || {};

boosh.formManager = boosh.formManager || {

	forms  : [],
	isInit : false,
	e : null,

	getGA : function () {

		if ( typeof window.GoogleAnalyticsObject === "undefined" ) {
	 		_err( 'No GoogleAnalyticsObject' );
	 		return false;
	 	}

	 	var tracker = window.GoogleAnalyticsObject;

	 	if ( typeof window[tracker] === "undefined" ) {
	 		_err( 'No GoogleAnalyticsObject' );
	 		return false;
	 	}

	 	return window[tracker];
	},

	init : function() {
		'use strict';

		_log( 'Initializing...' );

		if ( truthy(this.isInit) ) {
			return false;
		}

		var _ga = this.getGA();

		if( _ga === false ) {
			_err("No Google Analytics");
			return false;
		}

		_ga( this.run() );

		this.isInit = true;
	},

	run : function () {

		_log( 'Running...' );

		var forms = [];

		forms = this.detect( forms );
		forms = this.exclude( forms );

		this.validate( forms );

		this.bind();
		this.watch();
		this.visibilityCheck();
	},

	detect : function() {
		'use strict';

		var forms = document.forms;

		_log( 'Detected Forms: ' + forms.length );

		return forms;
	},

	exclude: function( forms ) {
		'use strict';

		// Exclude a form by the id attribute value
		var excludeById = [
			'adminbarsearch'
		];

		// Exclude a form by the role attribute value
		var excludeByRole = [
			'search'
		];

		var filteredForms = [];


		for ( var i = 0 ; i < forms.length ; i++ ) {

			var form = forms[i];
			var id   = form.getAttribute('id');
			var role = form.getAttribute('role');

			if ( excludeById.indexOf( id ) === 0 ) {
				_log( 'Excluding ID: ' + id );
				continue;
			}

			if ( excludeByRole.indexOf( role ) === 0 ) {
				_log( 'Excluding Role: ' + role );
				continue;
			}

			_log( 'Accepting: ' + id + ":" + role );
			filteredForms.push( form );
		}

		_log( 'Filtered Forms: ' + filteredForms.length );

		return filteredForms;
	},


	validate :  function( forms ) {

		for ( var i = 0 ; i < forms.length ; i++ ) {

			var form = forms[i];
			var booshForm = jQuery.extend( true, {}, BooshForm );

			booshForm.dom = form;

			var position = booshForm.cumulativeOffset(form);

	 		booshForm.position.top    = position.top;
	 		booshForm.position.bottom = jQuery(form).height() + position.top;

	 		
	 		var id   = form.getAttribute( 'id' );
			var role = form.getAttribute( 'role' );
			var name = form.getAttribute( 'name' );

			var slug = typeof boosh_form_config.slug !== "undefined" ? boosh_form_config.slug : "";

	 		booshForm.setName(slug, id, role, name, i);

	 		var type = booshForm.findType();
	 		booshForm.setType( type );

	 		_log( booshForm.name + ' validated' );
			this.forms.push( booshForm );
		}
	},

	bind : function () {
		"use strict";

		jQuery( document ).ajaxComplete( function ( e, r, s ) {
				e.preventDefault();

				if(s.type != "POST") {
					return;
				}

				if(s.url.indexOf("/feedback") == -1) {
					return;
				}

				var form = e.currentTarget.activeElement.parentElement.parentElement;

				jQuery.each( boosh.formManager.forms, function( index, booshForm ) {

					if(form == booshForm.dom) {

						var classes = booshForm.dom.className.split(' ');
						console.log(classes);
						if( classes.indexOf( 'sent' ) !== -1) {
							booshForm.record( 'submitSuccess' );
						}

						if( classes.indexOf( 'invalid' ) ) {
						//	booshForm.record( 'submitFailure' );
						}
					}
				});
		});

		jQuery.each( this.forms, function( index, booshForm ) {

			jQuery( ':input', booshForm.dom ).not( ':input[type=submit]' ).focus( function () {
				booshForm.record( 'fieldFocus' );
			});
			
			if(booshForm.type == "wpcf7-form") {
				jQuery( booshForm.dom ).submit( function (e) {
					e.preventDefault();
					booshForm.record( 'submitAttempt' );
				});
			}
		});

		
	},

	watch : function () {
		'use strict';

		// TODO - set time delay so it doesn't trigger too often
		jQuery( document ).scroll( function () {
			boosh.formManager.visibilityCheck();
	 	});
	},

	visibilityCheck : function () {
		'use strict';

 		var bottom = jQuery( window ).height() + jQuery( document ).scrollTop();

		jQuery.each( boosh.formManager.forms, function( index, booshForm ) {

	 		if ( booshForm.position.bottom == 0 ) {
	 			_log( booshForm.name + ' position not set' );
	 			return;
	 		}

	 		if ( bottom > booshForm.position.top ) {
	 			booshForm.record( 'visibilityPartial' );
	 		}

	 		if ( bottom > booshForm.position.bottom ) {
	 			booshForm.record( 'visibilityComplete' );
	 		}
		});
	}
};


jQuery( function() {
	_log( 'DOM ready' );
 	boosh.formManager.init();
});


