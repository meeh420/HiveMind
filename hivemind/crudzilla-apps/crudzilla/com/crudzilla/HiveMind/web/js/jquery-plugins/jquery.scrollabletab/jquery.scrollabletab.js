(function ($) {
    var settings = {
        barheight: 22
    }    

    $.fn.scrollabletab = function (options) {

        var ops = $.extend(settings, options);

        var ul = this.children('ul').first();
        var ulHtmlOld = ul.html();
        var tabBarWidth = $(this).width()-60;
        ul.wrapInner('<div class="fixedContainer" style="height: ' + ops.barheight + 'px; width: ' + tabBarWidth + 'px; overflow: hidden; float: left;"><div class="moveableContainer" style="height: ' + ops.barheight + 'px; width: 5000px; position: relative; left: 0px;"></div></div>');
        ul.append('<div style="width: 20px; float: left; height: ' + (ops.barheight - 2) + 'px; margin-left: 5px; margin-right: 0;"></div>');
        var leftArrow = ul.children().last();
        leftArrow.button({ icons: { secondary: "ui-icon ui-icon-carat-1-w" } });
        leftArrow.children('.ui-icon-carat-1-w').first().css('left', '2px');        

        ul.append('<div style="width: 20px; float: left; height: ' + (ops.barheight - 2) + 'px; margin-left: 1px; margin-right: 0;"></div>');
        var rightArrow = ul.children().last();
        rightArrow.button({ icons: { secondary: "ui-icon ui-icon-carat-1-e" } });
        rightArrow.children('.ui-icon-carat-1-e').first().css('left', '2px');        

        var moveable = ul.find('.moveableContainer').first();
        leftArrow.click(function () {
            var offset = tabBarWidth / 6;
            var currentPosition = moveable.css('left').replace('px', '') / 1;

            if (currentPosition + offset >= 0) {
                moveable.stop().animate({ left: '0' }, 'slow');
            }
            else {
                moveable.stop().animate({ left: currentPosition + offset + 'px' }, 'slow');
            }
        });

        rightArrow.click(function () {
            var offset = tabBarWidth / 6;
            var currentPosition = moveable.css('left').replace('px', '') / 1;
            var tabsRealWidth = 0;
            ul.find('li').each(function (index, element) {
                tabsRealWidth += $(element).width();
                tabsRealWidth += ($(element).css('margin-right').replace('px', '') / 1);
            });

            tabsRealWidth *= -1;

            if (currentPosition - tabBarWidth > tabsRealWidth) {
                moveable.stop().animate({ left: currentPosition - offset + 'px' }, 'slow');
            }
        });


        return this;
    }; // end of functions

})(jQuery);