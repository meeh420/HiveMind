function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var lastQuery = "";
var searchResult = null;

function doSearch($ul,value){
    var html = [];
    if ( value && value.length > 2 ) {      
        lastQuery = value;
        $ul.css({"display":"block"});
        //$ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'>Loading...</span></div></li>" );
        $ul.listview( "refresh" );
      
        
        $.ajax({
          url: "search.ste",
          dataType: "json",
          crossDomain: false,
          data: {
            "qstr": value,
            "relPath":top.appBuilder.runtime_resources.searchDirectory
          }
        })
        .then( function ( response ) {
          //synchronize requests
          if(response.query != lastQuery)return;
          
          searchResult = response;
          
          if(searchResult.exception){
            $("#error-message").html(searchResult.exception).css({"display":"block"});
            return;
          }
          $("#error-message").html("").css({"display":"none"});
          
          $.each( response.results, function ( i, result ) {                  
            var name = result.path;
            
            if(result.path.lastIndexOf('/') != -1)
              name = result.path.substring(result.path.lastIndexOf('/')+1);
            
            var snippet = "<pre id=\"result-line-"+i+"\" data-crudzilla-type=\""+result.type+"\" class=\"result-contextual-snippet\" style=\"display:none\">"+/*htmlEntities*/("")+"</pre>";
            var subtitle = "<span class='jqm-search-results-keywords ui-li-desc'><span class='jqm-keyword-hash'></span> " + result.path + "</span>";
            html += '<li><a href="#" onclick="openDocument(\''+result.path+'\');return true;">'+name+subtitle+snippet+'</li>';
          });
          $ul.html( html );
          $ul.listview( "refresh" );
          $ul.trigger( "updatelayout");
          
          setTimeout(highLight,0);
        });
    }
    else
    $ul.css({"display":"none"});  
}

function performSearch(txt){
  doSearch($( "#text-search-result-list" ),txt);
}


$( document ).on( "pageinit", function() {


     $("#search-field").bind("keyup",function(event, ui){
          if ( event.which == 13 ) return;
       
          
          doSearch($( "#text-search-result-list" ),$(this).val());
    
     });
  

  
  
    $( "#text-search-result-list" ).on( "listviewbeforefilter", function ( e, data ) {
      	  var $ul = $( this ),
          $input = $( data.input ),
          value = $input.val(),
          html = "";
          $ul.html( "" );
          doSearch($ul,value);
    });  
    
  
  	if(top.searchCallBack != null)
      	top.searchCallBack();
  
    
  	
  	return;
	var page = $( this );



	// global search
	$( this ).find( ".jqm-search ul.jqm-list" ).listview({
		globalNav: "demos",
		inset: true,
		theme: "d",
		dividerTheme: "d",
		icon: false,
		filter: true,
		filterReveal: true,
		filterPlaceholder: "Find...",
		autodividers: true,
		autodividersSelector: function ( li ) {
    		return "";
  		},
  		arrowKeyNav: true,
  		enterToNav: true,
  		highlight: true,
  		submitTo: "search-results.php"
	});
  
   
  
    $( ".jqm-search ul.jqm-list" ).on( "listviewbeforefilter", function ( e, data ) {
      	  var $ul = $( this ),
          $input = $( data.input ),
          value = $input.val(),
          html = "";
          $ul.html( "" );
          
          if ( value && value.length > 2 ) {
            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            $ul.listview( "refresh" );
            $.ajax({
              url: "search.ste",
              dataType: "json",
              crossDomain: false,
              data: {
                "qstr": $input.val()
              }
            })
            .then( function ( response ) {              
                
                $.each( response, function ( i, result ) {                  
                    var name = result.path;
                    if(result.path.lastIndexOf('/') != -1)
                  		name = result.path.substring(result.path.lastIndexOf('/')+1);
                  
                  	//html += '<li><a href="#" onclick="return false">'+result.path+'</a></li>';
                    html += '<li data-section="Widgets" data-filtertext="accordions collapsible sets content formatting grouped inset mini"><a href="#" onclick="openDocument(\''+result.path+'\')">'+name+'</a></li>';

                });
                $ul.html( html );
                $ul.listview( "refresh" );
                $ul.trigger( "updatelayout");
            });
          }
    });
	
  	
	$( this ).find( ".jqm-search-link" ).on( "click", function() {
		$( this ).parent( ".jqm-header" ).toggleClass( "jqm-search-toggle" );
		
		var type = $( this ).parent( ".jqm-header" ).hasClass( "jqm-search-toggle" ) ? "searchshow" : "searchhide";
		
		$( this ).parent( ".jqm-header" ).find( ".jqm-search" ).trigger( type );
	});
	
	$( this ).find( ".jqm-search" )
		.on( "searchshow searchhide", function( event ) {
			if ( event.type === "searchshow" ) {
				$( this ).find( ".ui-input-text" ).focus();
			} else {
				$( this )
					.find( ".ui-input-clear" ).trigger( "click" )
					.end()
					.find( ".ui-input-text" ).blur();
			}
		});
		
	$( this ).on( "pagehide", function() {
		$( this ).find( ".jqm-search .ui-input-clear" ).trigger( "click" );
	});


	$( this ).find( ".jqm-search-results-list li, .jqm-search li" ).each(function() {
        
		var text = $( this ).attr( "data-filtertext" );
		$( this ).find( "a" ).append( "<span class='jqm-search-results-keywords ui-li-desc'><span class='jqm-keyword-hash'>//</span> " + text + "</span>" );
	});
    
});

$( document ).on( "pageshow",  ".jqm-demos", function() {
	$( this ).find( ".jqm-search input" ).attr( "autocomplete", "off" ).attr( "autocorrect", "off" );
});


$( document ).on( "pageshow", ".jqm-demos-search-results", function() {
	var search = $.mobile.path.parseUrl( window.location.href ).search.split( "=" )[1], self = this;
	setTimeout(function() {
		e = $.Event( "keyup" );
		e.which = 65;
		$( self ).find( ".jqm-content .jqm-search-results-wrap input" ).val( search ).trigger(e).trigger( "change" );
	}, 0 );
});




jQuery.fn.highlight = function( pat ) {
	function innerHighlight( node, pat ) {
		var skip = 0;
		if ( node.nodeType == 3 ) {
			var pos = node.data.toUpperCase().indexOf( pat );
			if ( pos >= 0 ) {
				var spannode = document.createElement( "span" );
				spannode.className = "jqm-search-results-highlight";
				var middlebit = node.splitText( pos );
				var endbit = middlebit.splitText( pat.length );
				var middleclone = middlebit.cloneNode( true );
				spannode.appendChild( middleclone );
				middlebit.parentNode.replaceChild( spannode, middlebit );
				skip = 1;
			}
		} else if ( node.nodeType == 1 && node.childNodes && !/(script|style)/i.test( node.tagName ) ) {
			for ( var i = 0; i < node.childNodes.length; ++i ) {
				i += innerHighlight( node.childNodes[i], pat );
			}
		}
		return skip;
	}
	return this.length && pat && pat.length ? this.each(function() {
		innerHighlight( this, pat.toUpperCase() );
	}) : this;
};

jQuery.fn.removeHighlight = function() {
	return this.find( "span.jqm-search-results-highlight" ).each(function() {
		this.parentNode.firstChild.nodeName;
		with ( this.parentNode ) {
			replaceChild( this.firstChild, this );
			normalize();
		}
	}).end();
};


$( document ).on( "mobileinit", function() {
	(function( $, undefined ) {

	$.widget( "mobile.listview", $.mobile.listview, {
		options: {
			theme: null,
			countTheme: "c",
			headerTheme: "b",
			dividerTheme: "b",
			icon: "arrow-r",
			splitIcon: "arrow-r",
			splitTheme: "b",
			corners: true,
			shadow: true,
			inset: false,
			initSelector: ":jqmData(role='listview')",
			arrowKeyNav: false,
			enterToNav: false,
			highlight: false,
			submitTo: false
		},
		_create: function() {
			this._super();
			
			if ( this.options.arrowKeyNav ) {
				this._on( document, { "pageshow": "arrowKeyNav" });
			}
			
			if ( this.options.enterToNav ) {
				this._on( document, { "pageshow": "enterToNav" });
			}
			
		},
		submitTo: function() {
			var form = this.element.parent().find( "form" );
			
			form.attr( "method", "get" )
				.attr( "action", this.options.submitTo );
				
			var base = $( "base" ).attr( "href" ).split( "demos" )[0];
				base = base.split( "index.html" )[0] + "demos" + "/";
				url = base + this.options.submitTo + "?search=" + this.element.parent().find( "input" ).val();
			
			$.mobile.changePage( url ); 
		},
		enterToNav: function() {
			var form = this.element.parent().find( "form" );
			
			form.append( "<button type='submit' data-icon='arrow-r' data-inline='true' class='ui-hidden-accessible' data-iconpos='notext'>Submit</button>" )
				.parent()
				.trigger( "create" );
			
			this.element.parent().find( "form" ).children( ".ui-btn" ).addClass( "ui-hidden-accessible" );
			
			this._on( form, {
				"submit": "submitHandler"
			});
		},
		enhanced: false,
		arrowKeyNav: function() {
			var input = this.element.parent().find( "input" );
			
			if ( !this.enhanced ) {
				this._on( input, {
					"keyup": "handleKeyUp"
				});
				
				this.enhanced = true;
			}
		},
		handleKeyUp: function( e ) {
			var input = this.element.parent().find( "input" );
			
			if ( e.which === $.mobile.keyCode.DOWN ) {
				if ( this.element.find( "li.ui-btn-active" ).length == 0 ) {
					this.element.find( "li:first" ).toggleClass( "ui-btn-active" );
				} else {
					this.element.find( "li.ui-btn-active" ).toggleClass( "ui-btn-active" ).next().toggleClass( "ui-btn-active" );
				}
				
				this.highlightDown();
			} else if ( e.which === $.mobile.keyCode.UP ) {
				if ( this.element.find( "li.ui-btn-active" ).length !== 0 ) {
					this.element.find( "li.ui-btn-active" ).toggleClass( "ui-btn-active" ).prev().toggleClass( "ui-btn-active" );
					
					this.highlightUp()
				} else {
					this.element.find( "li:last" ).toggleClass( "ui-btn-up-d" ).toggleClass( "ui-btn-active" );
				}
			} else if ( typeof e.which !== "undefined" ) {
				this.element.find( "li.ui-btn-active" ).removeClass( "ui-btn-active" );
				
				if ( this.options.highlight ) {
					var search = input.val();
					
					this.element.find( "li" ).each(function() {
						$( this ).removeHighlight();
						$( this ).highlight( search );
					});
				}
			}
		},
		submitHandler: function() {
			if ( this.element.find( "li.ui-btn-active" ).length !== 0 ) {
				var href = this.element.find( "li.ui-btn-active a" ).attr( "href" );
				
				$.mobile.changePage( href );
				return false;
			}
			
			if ( this.options.submitTo ) {
				this.submitTo();
			}
		},
		highlightDown: function() {
			if ( this.element.find( "li.ui-btn-active" ).hasClass( "ui-screen-hidden" ) ) {
				this.element.find( "li.ui-btn-active" ).toggleClass( "ui-btn-active" ).next().toggleClass( "ui-btn-active" );
				
				this.highlightDown();
			}
			return;
		},
		highlightUp: function() {
			if ( this.element.find( "li.ui-btn-active" ).hasClass( "ui-screen-hidden" ) ) {
				this.element.find( "li.ui-btn-active" ).toggleClass( "ui-btn-active" ).prev().toggleClass( "ui-btn-active" );
				
				this.highlightUp();
			}
			return;
		}
	});
})( jQuery );

});




/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 *
 * Requires: 1.2.2+
 */

(function($) {
	var types = ['DOMMouseScroll', 'mousewheel'];

	if ($.event.fixHooks) {
		for ( var i=types.length; i; ) {
			$.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
		}
	}
	$.event.special.mousewheel = {
		setup: function() {
			if ( this.addEventListener ) {
				for ( var i=types.length; i; ) {
					this.addEventListener( types[--i], handler, false );
				}
			} else {
				this.onmousewheel = handler;
			}
		},
		teardown: function() {
			if ( this.removeEventListener ) {
				for ( var i=types.length; i; ) {
					this.removeEventListener( types[--i], handler, false );
				}
			} else {
				this.onmousewheel = null;
			}
		}
	};
	$.fn.extend({
		mousewheel: function(fn) {
			return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
		},

		unmousewheel: function(fn) {
			return this.unbind("mousewheel", fn);
		}
	});
	function handler(event) {
		var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
		event = $.event.fix(orgEvent);
		event.type = "mousewheel";

		// Old school scrollwheel delta
		if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
		if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
		// New school multidimensional scroll (touchpads) deltas
		deltaY = delta;
		// Gecko
		if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
			deltaY = 0;
			deltaX = -1*delta;
		}
		// Webkit
		if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
		if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
		// Add event and delta to the front of the arguments
		args.unshift(event, delta, deltaX, deltaY);

		return ($.event.dispatch || $.event.handle).apply(this, args);
	}
})(jQuery);
