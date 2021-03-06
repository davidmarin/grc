/*
 *= require jquery
 *= require rails
 *= require jquery-ui
 *= require bootstrap
 *= require bootstrap/sticky-popover
 *= require bootstrap/modal-form
 *= require bootstrap/modal-ajax
 *= require bootstrap/scrollspy
 *= require bootstrap/affix
 *= require wysihtml5_parser_rules/advanced
 *= require wysihtml5-0.3.0_rc2
 *= require bootstrap-wysihtml5-0.0.2
 *= require_self
 */

/* Unused?
jQuery(document).ready(function($) {
  $('.collapsible .head').click(function(e) {
      $(this).toggleClass('toggle');
      $(this).next().toggle();
      e.preventDefault();
  }).next().hide();
});*/

jQuery(document).ready(function($) {
  // TODO: Not AJAX friendly
  $('.bar[data-percentage]').each(function() {
    $(this).css({ width: $(this).data('percentage') + '%' })
  });
});

jQuery(document).ready(function($) {
  // Monitor Bootstrap Tooltips to remove the tooltip if the triggering element
  // becomes hidden or removed.
  //
  // * $currentTip needed because tooltips don't fire events until Bootstrap
  //   2.3.0 and $currentTarget.tooltip('hide') doesn't seem to work when it's
  //   not in the DOM
  // * $currentTarget.data('tooltip-monitor') is a flag to ensure only one
  //   monitor per element
  function monitorTooltip($currentTarget) {
    var monitorFn
      , monitorPeriod = 500
      , monitorTimeoutId = null
      , $currentTip
      , dataTooltip;

    if (!$currentTarget.data('tooltip-monitor')) {
      dataTooltip = $currentTarget.data('tooltip');
      $currentTip = dataTooltip && dataTooltip.$tip;

      monitorFn = function() {
        dataTooltip = dataTooltip || $currentTarget.data('tooltip');
        $currentTip = $currentTip || (dataTooltip && dataTooltip.$tip);

        if (!$currentTarget.is(':visible')) {
          $currentTip && $currentTip.remove();
          $currentTarget.data('tooltip-monitor', false);
        } else if ($currentTip && $currentTip.is(':visible')) {
          monitorTimeoutId = setTimeout(monitorFn, monitorPeriod);
        } else {
          $currentTarget.data('tooltip-monitor', false);
        }
      };

      monitorTimeoutId = setTimeout(monitorFn, monitorPeriod);
      $currentTarget.data('tooltip-monitor', true);
    }
  };

  $('body').on('shown', '.modal', function() {
    $('.tooltip').hide();;
  });

  // Listeners for initial tooltip mouseovers
  $('body').on('mouseover', '[data-toggle="tooltip"], [rel=tooltip]', function(e) {
    var $currentTarget = $(e.currentTarget);

    if (!$currentTarget.data('tooltip')) {
      $currentTarget
        .tooltip({ delay: 300 })
        .triggerHandler(e);
    }

    monitorTooltip($currentTarget);
  });
});

// Setup for Popovers
jQuery(document).ready(function($) {
  var defaults = {
    delay: { show: 300, hide: 150 },
    placement: 'left',
    content: function(trigger) {
      var $trigger = $(trigger);

      var $el = $(new Spinner().spin().el);
      $el.css({
        width: '100px',
        height: '100px',
        left: '50px',
        top: '50px',
        zIndex : calculate_spinner_z_index
       });
      return $el[0];
    }
  };

  // Listeners for initial mouseovers for stick-hover
  $('body').on('mouseover', 'a[data-popover-trigger="sticky-hover"]', function(e) {
    // If popover instance doesn't exist already, create it and
    // force the 'enter' event.
    if (!$(e.currentTarget).data('sticky_popover')) {
      $(e.currentTarget)
        .sticky_popover($.extend({}, defaults, { 
          trigger: 'sticky-hover' 
          , placement : function() {
            if(this.$element.closest(".widget-area:first-child").length)
              return "right";
            else
              return "left";
          }
        }))
        .triggerHandler(e);
    }
  });

  // Listeners for initial clicks for popovers
  $('body').on('click', 'a[data-popover-trigger="click"]', function(e) {
    e.preventDefault();
    if (!$(e.currentTarget).data('sticky_popover')) {
      $(e.currentTarget)
        .sticky_popover($.extend({}, defaults, { trigger: 'click' }))
        .triggerHandler(e);
    }
  });

  // Remove widgets
  $('body').on('click', '.widget .header .remove', function(e) {
    e.preventDefault();
    var $this = $(this),
        $widget = $this.closest(".widget");
    $widget.fadeOut();  
  });

  // Contract/Expand widget
  $('body').on('click', '.widget .header .showhide, .widget .header .widget-showhide a', function(e) {

    if($(this).is(".widget-showhide"))
      e.preventDefault();
    
    showhide.call(this);    
  });

  function showhide(command) {
    $(this).each(function() {
      var $this = $(this)
          , $content = $this.closest(".widget").find(".content")
          , $filter = $this.closest(".widget").find(".filter")
          , cmd = command;

      if(typeof cmd === "undefined" || cmd === "toggle") {
        cmd = $this.hasClass("active") ? "hide" : "show";
      }

      if(cmd === "hide") {
        $content.slideUp();
        $filter.slideUp();
        $this.removeClass("active");
      } else if(cmd === "show") {
        $content.slideDown();
        $filter.slideDown();
        $this.addClass("active");
      }
    });

    return this;
  }

  $.fn.showhide = showhide;

  // Show/hide tree leaf content
  $('body').on('click', '.tree-structure .oneline, .tree-structure .description, .tree-structure .view-more', oneline);

  function oneline(command) {
    $(this).each(function() {
      var $this = $(this)
        , $leaf = $this.closest('[class*=span]').parent().children("[class*=span]:first")
        , $title = $leaf.find('.oneline')
        , $description = $leaf.find('.description')
        , $view = $leaf.closest('.row-fluid').find('.view-more')
        , cmd = command
        ;

      if ($description.length > 0) {
        if(typeof cmd !== "string") {
          cmd = $description.hasClass("in") ? "hide" : "view";
        }

        if(cmd === "view") {
          $description.addClass('in');
          $title.find('.description-inline').addClass('out');
          if ($title.is('.description-only')) {
            $title.addClass('out');
          }
          $view.text('hide');
        } else if(cmd === "hide") {
          $description.removeClass('in');
          $title.find('.description-inline').removeClass('out');
          if ($title.is('.description-only')) {
            $title.removeClass('out');
          }      
          $view.text('view');
        }
      }
    });

    return this;
  }

  $.fn.oneline = oneline;

  // Open quick find
  $('body').on('focus', '.quick-search-holder input', function() {
    var $this = $(this),
    $quickFind = $this.closest(".quick-search").find(".quick-search-results");
    $quickFind.fadeIn();
    
    if($(".quick-search-results").css("display") == "block"){
      $('.quick-search-holder').addClass('open');
    }
    
    $('.quick-search-results .remove').click(function() {
      $('.quick-search-holder').removeClass('open');
    });
    
  });

  // Remove quick find
  $('body').on('click', '.quick-search-results .remove', function(e) {
    e.preventDefault();
    var $this = $(this),
        $quickFind = $this.closest(".quick-search-results");
    $quickFind.fadeOut();
  });

  // Close other popovers when one is shown
  $('body').on('show.popover', function(e) {
    $('[data-sticky_popover]').each(function() {
      var popover = $(this).data('sticky_popover');
      popover && popover.hide();
    });
  });

  // Close all popovers on custom event
  $('body').on('kill-all-popovers', function(e) {
    // FIXME: This may be incompatible with bootstrap popover assumptions...
    // This is when the triggering element has been removed from the DOM
    // so we have to kill the popover elements themselves.
    $('.popover').remove();
  });
});

$(document).ajaxComplete(function(event, request){
  var flash = $.parseJSON(request.getResponseHeader('X-Flash-Messages'));
  if (!flash) return;
  $(['notice', 'error', 'warning']).each(function(i, prop) {
    $('.flash > .' + prop).html(flash[prop] || '');
  });
});

$(window).load(function(){

  // tree
  
  $('body').on('click', 'ul.tree .item-title', function(e) {
    var $this = $(this),
        $content = $this.closest('li').find('.item-content');
    
    if($this.hasClass("active")) {
      $content.slideUp('fast');
      $this.removeClass("active");
    } else {
      $content.slideDown('fast');
      $this.addClass("active");
    }
    
  });


  // tree-structure
  
  $('body').on('click', 'ul.tree-structure .item-main .grcobject, ul.tree-structure .item-main .openclose', function(e) {
    openclose.call(this);
    e.stopPropagation();
  });

  function openclose(command) {
    var $that = $(this)
    , use_slide = $that.length < 100

    $that.each(function(){
      var $this = $(this)
        , $main = $this.closest('.item-main')
        , $li = $main.closest('li')
        , $content = $li.children('.item-content')
        , $icon = $main.find('.openclose')
        , cmd = command;

      if(typeof cmd !== "string" || cmd === "toggle") {
        cmd = $icon.hasClass("active") ? "close" : "open";
      }

      if (cmd === "close") {
        
        use_slide ? $content.slideUp('fast') : $content.css("display", "none");
        $icon.removeClass('active');
      } else if(cmd === "open") {
        use_slide ? $content.slideDown('fast') : $content.css("display", "block");
        $icon.addClass('active');
      }
    });

    return this;
  }

  $.fn.openclose = openclose;

  $('.widget-area').sortable({
    connectWith: '.widget-area'
    , placeholder: 'drop-placeholder'
    , handle : "header, .header"
    , items : ".widget"
  });

});

jQuery(document).ready(function($) {
  var containerSize = $('.container-fluid').width(),
      containerWide = 1200,
      containerNarrow = 960,
      containerDelta = $(window).width() - containerSize;

  $('.container-fluid').css('width', containerSize);

  $(window).on('resize', function(e) {
    var width = $(window).width();
    // Only auto-resize when in 100% mode
    if ($('body').find('.menu').find('.screen-size span').text().trim() == '100%') {
      $('.container-fluid').addClass('resizable').css('width', width - containerDelta);
      $(this).closest('.menu').find('.screen-size span').text('100%');
    }

    if(width < 720) {
      $(".quick-search-results").css("width", width);
    } else {
      $(".quick-search-results").css("width", "");      
    }
  });

  $('body').on('click', '.full-view', function(e) {
    var width = $(window).width();
    e.preventDefault();
    $('.container-fluid').addClass('resizable').css('width', width - containerDelta);
    $(this).closest('.menu').find('.screen-size span').text('100%');
  });

  $('body').on('click', '.wide-view', function(e) {
    e.preventDefault();
    $('.container-fluid').addClass('resizable').css('width', containerWide);
    $(this).closest('.menu').find('.screen-size span').text('Wide');
  });

  $('body').on('click', '.narrow-view', function(e) {
    e.preventDefault();
    $('.container-fluid').addClass('resizable').css('width', containerNarrow);
    $(this).closest('.menu').find('.screen-size span').text('Narrow');
  });
  
  if ($('#welcome').length > 0) {
		$('#user_session_email').focus();
	}
  
});

jQuery(function($){
  $.fn.cms_wysihtml5 = function() {
    
    this.wysihtml5({ 
        link: true, 
        image: false, 
        html: true, 
        'font-styles': false, 
        parserRules: wysihtml5ParserRules })
    
    this.each(function() {
      var $that = $(this)
      , editor = $that.data("wysihtml5").editor;

      if($that.data("cms_events_bound"))
        return;

      editor.on("change", function(data) {
        $that.html(this.getValue()).trigger("change");
      });

      $that.closest(".wysiwyg-area").resizable({
        handles : "s"
        , minHeight : 100
        , alsoResize : "#" + $that.uniqueId().attr("id") + ", #" + $that.closest(".wysiwyg-area").uniqueId().attr("id") + " iframe"
        , autoHide : false
      }).bind("resizestop", function(ev) {
        ev.stopPropagation();
        $that.css({"display" : "block", "height" : $that.height() + 20}); //10px offset between reported height and styled height.
        editor.composer.style();// re-copy new size of textarea to composer
        $that.css("display", "none");
      });

      $that.data("cms_events_bound", true);
    })

    return this;
  }
});
