var IMHWPB = IMHWPB || {};

/**
 * Inspirstions, design first.
 *
 * @since xxx
 */
IMHWPB.InspirationsDesignFirst = function( $, configs ) {
	var self = this;

	this.configs = configs;
//	this.api_url = this.configs.asset_server;
//	this.api_key = this.configs.api_key;
//	this.api_param = 'key';
//	this.api_key_query_str = this.api_param + "=" + this.api_key;

	self.ajax = new IMHWPB.Ajax( configs );

	self.$categories = $( '#categories' );

	self.categories = '';

	self.$themes = $( '.theme-browser .themes');
	self.themes = '';

	self.$theme = '';
	self.$pageset = '';
	self.$budget = '';

	// scroll position.
	self.scrollPosition = '';

	/**
	 * Enable or disable all actions on the page.
	 *
	 * @since xxx
	 */
	this.allActions = function( effect ) {
		if( 'disable' === effect ) {
			$( 'body' ).addClass( 'waiting' );
			$( '.top-menu a' ).addClass( 'disabled' );
			$( '#build-summary button' ).attr( 'disabled', true );
		} else {
			$( 'body' ).removeClass( 'waiting' );
			$( '.top-menu a' ).removeClass( 'disabled' );
			$( '#build-summary button' ).attr( 'disabled', false );
		}
	};

	/**
	 * User chooses a theme
	 *
	 * @since xxx
	 */
	this.chooseTheme = function( $theme ) {
		// Immediately hide the iframe to give a better transition effect.
		$( '#screen-content iframe#theme-preview' )
			.addClass( 'hidden' )
			.css( 'display', '' );

		// Load the theme title and sub category title.
		$( '#sub-category-title' ).html( '- ' + self.$theme.closest( '.theme' ).attr( 'data-sub-category-title' ) );
		$( '#theme-title' ).html( self.$theme.closest( '.theme' ).attr( 'data-theme-title' ) );

		self.toggleStep( 'content' );

		$( '[data-step="content"]' ).removeClass( 'disabled' );

		// Reset the coin budget to 20.
		$( 'input[data-coin="20"]' ).prop( 'checked', true );

		// Load pagesets
		var pagesetSuccess = function( msg ) {
			var template = wp.template( 'pagesets' );

			$( '#pageset-options' ).html( ( template( msg.result.data.pageSets ) ) );

			self.$pageset = $( 'input[name="pageset"]:checked' );
			self.$budget = $( 'input[name="coin-budget"]:checked' );

			self.loadBuild();
		};
		self.ajax.ajaxCall( {'category_id' : $theme.closest( '.theme' ).attr( 'data-category-id' )}, 'get_category_page_sets', pagesetSuccess );
	};

	/**
	 *
	 */
	this.toggleCheckbox = function () {
		var $subCategory = $( 'input[name="sub-category"]:checked' );
		$subCategory.parent().css( 'background', 'blue' );
	};

	/**
	 *
	 */
	this.devicePreviews = function () {
		var previewer = $( '#theme-preview' );

		// Desktop previews.
		$( '.wrap' ).on( 'click', '.preview-desktop', function() {

			// If we're waiting on something, don't allow the user to preview a different device.
			if( $( 'body' ).hasClass( 'waiting' ) ) {
				return;
			}

			$( '.devices .active' )
				.attr( 'aria-pressed', 'false' )
				.removeClass( 'active' );
			$( this ).attr( 'aria-pressed', 'true' ).addClass( 'active' );
			previewer.removeClass();
		});

		// Tablet previews.
		$( '.wrap' ).on( 'click', '.preview-tablet', function() {

			// If we're waiting on something, don't allow the user to preview a different device.
			if( $( 'body' ).hasClass( 'waiting' ) ) {
				return;
			}

			$( '.devices .active' )
				.attr( 'aria-pressed', 'false' )
				.removeClass( 'active' );
			$( this ).attr( 'aria-pressed', 'true' ).addClass( 'active' );
			previewer.removeClass().addClass( 'preview-tablet' );
		});

		// Mobile previews.
		$( '.wrap' ).on( 'click', '.preview-mobile', function() {

			// If we're waiting on something, don't allow the user to preview a different device.
			if( $( 'body' ).hasClass( 'waiting' ) ) {
				return;
			}

			$( '.devices .active' )
				.attr( 'aria-pressed', 'false' )
				.removeClass( 'active' );
			$( this ).attr( 'aria-pressed', 'true' ).addClass( 'active' );
			previewer.removeClass().addClass( 'preview-mobile' );
		});

		/*
		 * Prevent clicking of device preview buttons during existing load.
		 *
		 * If we're loading a preview of a theme, don't allow someone click and change the device
		 * preview option, until the preview is finished loading.
		 */
		$( '.wrap' ).on( 'click', '.devices button', function() {
			var $button = $( this );

			if( $( 'body' ).hasClass( 'waiting' ) && $button.is( ':focus' ) ) {
				$button.blur();
			}
		});
	};

	/**
	 * Event handler for the back button on step 2.
	 */
	this.backButton = function() {
		$( '.inspirations.button-secondary' ).on( 'click', function() {
			self.toggleStep( 'design' );
		});
	};

	/**
	 *
	 */
	this.bindInstallModal = function() {
		$( 'button.install' ).click( function() {
			tb_show("Installation", '#TB_inline?inlineId=install-modal&modal=false', true);
		});

		$( 'button.go-back' ).on( 'click', function() {
			tb_remove();
		});

		/*
		 * Bind click of "Install this website!".
		 *
		 * This is the button that submits the #post_deploy form and actually installs a website.
		 */
		$( 'button.install-this-website' ).on( 'click', function() {
			// Disable the "Go back" and "Install this website" buttons.
			$( '#install-buttons button' ).prop( 'disabled', true );

			$( '#install-buttons' ).append( '<span class="spinner inline"></span>' );

			$( '#post_deploy' ).submit();
		});
	}

	/**
	 * @summary Bind events to the button clicks of the intro.
	 *
	 * @since 1.2.3
	 */
	this.bindIntroSelection = function() {
		$('#select-install-type a.button').on( 'click', function() {
			var $button = $(this);

			// Hide the #select-install-type container.
			$button.closest('.wrap').addClass('hidden');

			switch( $button.attr('data-install-type') ) {
				case 'staging':
					$( 'input[name="staging"]' ).val( 1 );
					$( '#install-modal-destination' ).html( Inspiration.staging );
					break;
				case 'active':
					$( '#install-modal-destination' ).html( Inspiration.active );
					break;
			}

			// If the button indicates a start over, update the deploy form.
			if( 'true' === $button.attr('data-start-over') ) {
				$( '#start_over' ).val( 'true' );
			}

			$( '.wrap.main' ).removeClass( 'hidden' );

			$( "img.lazy" ).lazyload({threshold : 500});
		});
	}

	/**
	 * Checks to see if the mobile menu is actually displayed.
	 *
	 * @return boolean
	 */
	this.isMobile = function() {
		return ( $( '.wp-filter:visible').length === 0 ? false : true );
	};

	/**
	 * Toggle the mobile menu open and closed.
	 */
	this.mobileToggle = function() {
		$( '.left' ).toggle( 'slow' );
		$( '.drawer-toggle' ).toggleClass( 'open' );
	};

	/**
	 * Force the mobile menu to close.
	 */
	this.mobileCollapse = function() {
		var $mobileMenu = $( '.left' );
		if ( $mobileMenu.is( ':visible' ) ) {
			self.mobileToggle();
		}
	};

	this.mobileMenuToggle = function() {
		$( '.drawer-toggle' ).on( 'click', function() {
			self.mobileToggle();
		});
	};

	/**
	 * @summary Handles the Show All filter.
	 *
	 * @since 1.2.3
	 */
	 this.showAll = function() {
		$( '.wrap' ).on( 'click', '[data-sort="show-all"]', function() {
			var $all = $( '[data-sub-category-id="0"]' ),
			    ref = $all.parent( '.sub-category' );

			// Remove all active classes from sub categories.
			$( '.sub-category.active' ).removeClass( 'active' );
			// Check radio.
			$all.prop( 'checked', true );
			// Check radio check.
			if ( $all.is( ':checked' ) ) {
				ref.addClass( 'active' );
			}
			// collapse mobile.
			self.mobileCollapse();
			// Update filter text.
			self.updateFilterText( 'All' );
			// Display all themes.
			self.toggleSubCategory( $all );
			// toggle the current class for show all.
			self.toggleShowAll( ref );
		});
	};

	/**
	 * @summary Shuffle an array.
	 *
	 * Used to shuffle our generic builds. If we didn't shuffle those, you'd see them grouped by
	 * theme.
	 *
	 * @since 1.2.3
	 * @link http://stackoverflow.com/questions/3718282/javascript-shuffling-objects-inside-an-object-randomize
	 */
	this.shuffle = function( myArray ) {
		var i = myArray.length, j, tempi, tempj;

		if ( i == 0 ) {
			return false;
		}

		while ( --i ) {
			j = Math.floor( Math.random() * ( i + 1 ) );

		    tempi = myArray[i];
		    tempj = myArray[j];

		    myArray[i] = tempj;
		    myArray[j] = tempi;
		}

		return myArray;
	}

	/**
	 * Toggle the show all current class.
	 */
	this.toggleShowAll = function( o ) {
		var $showAll = $( '[data-sort="show-all"]' ),
		    $subcatId = o.find( '[data-sub-category-id]' ).data( 'sub-category-id');

		// Add current class to show all filter if previewing all themes.
		$showAll.addClass( 'current' );
		// If we aren't clicking on All remove that class.
		if ( 0 !== $subcatId ) {
			$showAll.removeClass( 'current' );
		}
	};

	/**
	 * Update the filter text on the mobile view.
	 */
	this.updateFilterText = function( text ) {
		$( '.theme-count' ).text( text );
	};

	/**
	 * Subcategories event handler.
	 */
	this.subcategories = function() {
		// Subcategories.
		$( '.wrap' ).on( 'click', '.sub-category', function() {
			var $subCategory = $( this ).find( 'input[name="sub-category"]' ),
			    $subcategoryName = $( this ).find( '.sub-category-name' ).text(),
			    ref = $( this );
			// Reset scroll position.
			window.scrollTo( 0, 0 );
			// Remove any active classes.
			$( '.sub-category.active' ).removeClass( 'active' );
			// Mark subcategory as active.
			$subCategory.prop( 'checked', true );
			// Add active class.
			if ( $subCategory.is( ':checked' ) ) {
				ref.addClass( 'active' );
			}
			self.updateFilterText( $subcategoryName );
			// Toggle the show all filter.
			self.toggleShowAll( ref );
			// Mobile actions.
			if ( self.isMobile() ) {
				// Collapse the menu when selection is made.
				self.mobileToggle();
			}
			// Always toggle subcategory.
			self.toggleSubCategory( $subCategory );
		});
	};

	/**
	 * Selects theme to load to continue on to step 2 of inspirations.
	 */
	this.selectTheme = function() {
		$( '.wrap' ).on( 'click', '.theme', function() {
			var $theme = $( this );
			self.$theme = $theme;
			self.chooseTheme( $theme );
		});
	};

	/**
	 * Sets the hover colors class.
	 */
	this.hoverColors = function() {
		// Hovers.
		$( '.wrap' ).on( 'mouseenter mouseleave', '.sub-category, .pageset-option, .coin-option', function() {
			$( this ).toggleClass( 'blue' );
		});
	};

	/**
	 * Click event handler for pageset options section.
	 */
	this.pagesetOptions = function() {
		// Pageset Options.
		$( '.wrap' ).on( 'click', '.pageset-option', function() {

			// If we're waiting on something, don't allow the user to select a different pageset.
			if( $( 'body' ).hasClass( 'waiting' ) ) {
				return;
			}

			var $pagesetInput = $( this ).find( 'input[name="pageset"]' );

			$( '.pageset-option.active' ).removeClass( 'active' );

			$pagesetInput.prop( 'checked', true );

			if ( $pagesetInput.is( ':checked' ) ) {
				$( this ).addClass( 'active' );
			}

			self.$pageset = $( 'input[name="pageset"]:checked' );

			self.loadBuild();
		});
	};

	/**
	 * Click event handler for coin budget options section.
	 */
	this.coinOptions = function() {
		// Coin Budgets.
		$( '.wrap' ).on( 'click', '.coin-option', function() {

			// If we're waiting on something, don't allow the user to select a different budget.
			if( $( 'body' ).hasClass( 'waiting' ) ) {
				return;
			}

			var $coinInput = $( this ).find( 'input[name="coin-budget"]' );

			$( '.coin-option.active' ).removeClass( 'active' );

			$coinInput.prop( 'checked', true );

			if ( $coinInput.is( ':checked' ) ) {
				$( this ).addClass( 'active' );
			}

			self.$budget = $( 'input[name="coin-budget"]:checked' );

			self.loadBuild();
		});
	};

	/**
	 * Loads the iframe for the theme preview.
	 */
	this.iframeLoad = function() {
		$( '#screen-content iframe#theme-preview' ).on( 'load', function() {
			var $iframe = $( this );
			$( '#screen-content .boldgrid-loading' ).fadeOut( function() {
				self.allActions( 'enable' );
				$( '#build-cost' )
					.html( $iframe.attr( 'data-build-cost' ) + ' Coins' )
					.animate( { opacity: 1 }, 400 );
				$( '#screen-content iframe#theme-preview' ).fadeIn();
			} );
		});
	};

	/**
	 * Manages the steps (tabs) of inspirations.
	 */
	this.steps = function() {
		$( '.wrap' ).on( 'click', '.top-menu [data-step]', function() {
			var $link = $( this ),
				step = $link.attr( 'data-step' );

			if( $link.hasClass( 'disabled' ) ) {
				return;
			} else {
				self.toggleStep( step );
			}
		});
	};

	/**
	 * Init.
	 *
	 * @since xxx
	 */
	this.init = function() {
		self.initCategories();
		self.toggleCheckbox();
		self.devicePreviews();
		self.backButton();
		self.mobileMenuToggle();
		self.subcategories();
		self.selectTheme();
		self.showAll();
		self.hoverColors();
		self.coinOptions();
		self.pagesetOptions();
		self.iframeLoad();
		self.steps();
		self.bindIntroSelection();
		self.bindInstallModal();
	};

	/**
	 * Init the list of categories.
	 *
	 * @since xxx
	 */
	this.initCategories = function( ) {
		var success_action = function( msg ) {
			var template = wp.template('init-categories');

			self.categories = msg.result.data.categories;
			self.$categories.html( ( template( self.categories ) ) );
			self.initThemes();
		};

		self.ajax.ajaxCall( {'inspirations_mode' : 'standard'}, 'get_categories', success_action );
	};

	/**
	 * @summary Init Themes.
	 *
	 * @since 1.2.3
	 */
	this.initThemes = function() {
		var template = wp.template( 'theme' ),
			data = { 'site_hash' : self.configs.site_hash },
			genericBuilds, getGenericSuccess;

		getGenericSuccess = function( msg ) {
			genericBuilds = self.shuffle( msg.result.data );

			_.each( genericBuilds, function( build ){
				self.$themes.append( template( { configs: IMHWPB.configs, build: build } ) );
			});

			$( "img.lazy" ).lazyload({threshold : 400});
		};

		self.ajax.ajaxCall( data, 'get_generic', getGenericSuccess );
	};

	/**
	 * Load a new build on the Content tab.
	 *
	 * @since xxx
	 */
	this.loadBuild = function() {
		// Disable all actions.
		self.allActions( 'disable' );

		// Load our loading graphic.
		$( '#build-cost' ).animate( { opacity: 0 }, 400 );
		$( '#screen-content iframe#theme-preview' ).fadeOut( function() {
			$( '#screen-content .boldgrid-loading' ).fadeIn();
		} );


		var success_action = function( msg ) {
			var $screenContent = $( '#screen-content' ),
				$iframe = $screenContent.find( 'iframe#theme-preview' ),
				url = msg.result.data.profile.preview_url;

			$iframe
				.attr( 'src', url )
				.attr( 'data-build-cost', msg.result.data.profile.coins );
		};

		data = {
			'theme_id' :			self.$theme.closest( '.theme' ).attr( 'data-theme-id' ),
			'cat_id' :				self.$theme.closest( '.theme' ).attr( 'data-category-id' ),
			'sub_cat_id' :			self.$theme.closest( '.theme' ).attr( 'data-sub-category-id' ),
			'page_set_id' :			self.$pageset.attr( 'data-page-set-id' ),
			'pde' :					self.$theme.closest( '.theme' ).attr( 'data-pde' ),
			'wp_language' :			'en-US',
			'coin_budget' :			self.$budget.attr( 'data-coin' ),
			'theme_version_type' :	null,
			'page_version_type' :	null,
			'site_hash' :			self.configs.site_hash,
			'inspirations_mode' :	'standard',
			'is_generic' :			( '1' === self.$pageset.attr( 'data-is-default' ) ? 'true' : 'false' ),
		};

		// Set form.
		$( '[name=boldgrid_cat_id]' ).val( data.cat_id );
		$( '[name=boldgrid_sub_cat_id]' ).val( data.sub_cat_id );
		$( '[name=boldgrid_theme_id]' ).val( data.theme_id );
		$( '[name=boldgrid_page_set_id]' ).val( data.page_set_id );
		$( '[name=boldgrid_api_key_hash]' ).val( data.site_hash );
		$( '[name=boldgrid_pde]' ).val( data.pde );
		$( '[name=coin_budget]' ).val( data.coin_budget );

		self.ajax.ajaxCall( data, 'get_build_profile', success_action );
	};

	/**
	 *
	 */
	this.toggleStep = function( step ) {
		var $content = $( '#screen-content' ),
			$design = $( '#screen-design' ),
			$contentLink = $( '[data-step="content"]' ),
			$designLink = $( '[data-step="design"]' );

		if( 'design' === step ) {
			$contentLink.removeClass( 'active' );
			$designLink.addClass( 'active' );
			$designLink.parent( '.top-menu' ).removeClass( 'content' );
			$designLink.parent( '.top-menu' ).addClass( 'design' );

			$content.addClass( 'hidden' );
			$design.removeClass( 'hidden' );
			// Restore scroll position when coming back to design page.
			$( document ).scrollTop( self.scrollPosition );
		} else {
			// Store the scroll position of the design page.
			self.scrollPosition = $( document ).scrollTop();
			$contentLink.addClass( 'active' );
			$designLink.removeClass( 'active' );
			$contentLink.parent( '.top-menu' ).removeClass( 'design' );
			$contentLink.parent( '.top-menu' ).addClass( 'content' );

			$content.removeClass( 'hidden' );
			$design.addClass( 'hidden' );
		}
	};

	/**
	 *
	 */
	this.toggleSubCategory = function( $subCategory ) {
		var subCategoryId = $subCategory.attr( 'data-sub-category-id' );

		if( '0' === subCategoryId ) {
			$( '.theme[data-sub-category-id]').removeClass( 'hidden' );
			// Show subcategory name if browsing all subcategories.
			$( '.theme-name .sub-category-name' ).show();
		} else {
			// Hide subcategory name if browsing singular subcategory.
			$( '.theme-name .sub-category-name' ).hide();
			$( '.theme[data-sub-category-id="' + subCategoryId + '"]').removeClass( 'hidden' );
			$( '.theme[data-sub-category-id!="' + subCategoryId + '"]')
				.addClass( 'hidden' )
				.appendTo( '.themes' );
		}

		$( 'img.lazy' ).lazyload({threshold : 400});
	};

	$( function() {
		self.init();
	});
};

new IMHWPB.InspirationsDesignFirst( jQuery, IMHWPB.configs );