(function(window,undefined){
	
	// Prepare our Variables
	var
		History = window.History,
		$ = window.jQuery,
		document = window.document;

	// Check to see if History.js is enabled for our Browser
	if ( !History.enabled ) {
		return false;
	}

	// Wait for Document
	$(function(){
		// Prepare Variables
		var
			/* Application Specific Variables */
			$content = $('#content,article:first,.article:first').filter(':first'),
			$menu = $('#menu,nav:first,.nav:first').filter(':first'),
			activeClass = 'active selected current youarehere',
			activeSelector = '.active,.selected,.current,.youarehere',
			/* Application Generic Variables */
			$body = $(document.body),
			rootUrl = History.getRootUrl();
		
		// Ajaxify our Internal Links
		$body.find('a[href^="/"],a[href^="'+rootUrl+'"]').live('click',function(event){
			// Continue as normal for cmd clicks etc
			if ( event.which == 2 || event.metaKey ) { return true; }
			// Ajaxify this link
			var $this = $(this), url = $this.attr('href'), title = $this.attr('title')||null;
			History.pushState(null,title,url);
			event.preventDefault();
			return false;
		});

		// Hook into State Changes
		$(window).bind('statechange',function(){
			// Prepare Variables
			var
				State = History.getState(),
				url = State.url,
				relativeUrl = url.replace(rootUrl,'');

			// Set Loading
			$body.addClass('loading');

			// Start Fade Out
			// Animating to opacity to 0 still keeps the element's height intact
			// Which prevents that annoying pop bang issue when loading in new content
			$content.animate({opacity:0},800);
			
			// Ajax Request the Traditional Page
			$.ajax(url,{
				success: function(data, textStatus, jqXHR){
					// Update the menu
					var $menuChildren = $menu.children();
					$menuChildren.filter(activeSelector).removeClass(activeClass);
					$menuChildren.has('a[href^="/'+relativeUrl+'"],a[href^="'+url+'"]').addClass(activeClass);
					
					// Update the content
					// Find the content in the page's html, and apply it to our current page's content
					$content.stop(true,true);
					$content.html($(data).find('#content')).css('opacity',100).show(); /* you could fade in here if you like */
					
					// Complete the change
					if ( $content.ScrollTo||false ) { $content.ScrollTo(); } /* http://balupton.com/projects/jquery-scrollto */
					$body.removeClass('loading');
	
					// Inform Google Analytics of the change
					if ( typeof window.pageTracker !== 'undefined' ) {
						window.pageTracker._trackPageview(relativeUrl);
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					//alert('An error occurred loading in your content: '+errorThrown);
					document.location = url;
				}
			}); // end ajax

		}); // end onStateChange

	}); // end onDomLoad

})(window); // end closure