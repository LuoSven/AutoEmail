
jQuery.fn.onPositionChanged = function (trigger, millis) {
    if (millis == null) millis = 100;
    var o = $(this[0]); // our jquery object
    if (o.length < 1) return o;

    var lastPos = null;
    var lastOff = null;
    setInterval(function () {
        if (o == null || o.length < 1) return o; // abort if element is non existend eny more
        if (lastPos == null) lastPos = o.position();
        if (lastOff == null) lastOff = o.offset();
        var newPos = o.position();
        var newOff = o.offset();
        if (lastPos.top != newPos.top || lastPos.left != newPos.left) {
            $(this).trigger('onPositionChanged', { lastPos: lastPos, newPos: newPos });
            if (typeof (trigger) == "function") trigger(lastPos, newPos);
            lastPos = o.position();
        }
        if (lastOff.top != newOff.top || lastOff.left != newOff.left) {
            $(this).trigger('onOffsetChanged', { lastOff: lastOff, newOff: newOff});
            if (typeof (trigger) == "function") trigger(lastOff, newOff);
            lastOff= o.offset();
        }
    }, millis);

    return o;
};

(function($) {
    $.fn.fixMe = function() {
        return this.each(function() {
            var $this = $(this),
                $t_fixed;
            function init() {
                // var fixTableContainer = $('<div class="fixTableContainer" />');
                // $this.wrap(fixTableContainer);
                $t_fixed = $this.clone();
                $t_fixed.find("tbody").remove().end().addClass("fixed").insertBefore($this);
                $($this.parent()).onPositionChanged(function(){
                    $(".fixed").css({
                        // "top": $this.parent().offset().top,
                        "background-color": "white",
                        "position": "fixed",
                        "display": "none",
                        "width": "auto",
                        "z-index": 3
                    })
                });
                resizeFixed();
            }
            function resizeFixed() {
                $t_fixed.find("thead th").each(function(index) {
                    $(this).css({
                        "width": $this.find("thead th").eq(index).outerWidth()
                    });
                });
            }
            function scrollFixed() {
                resizeFixed()

                var offset = $(this).scrollTop(),
                    tableOffsetTop = $this.position().top,
                    tableOffsetBottom = tableOffsetTop + $this.height() - $this.find("thead").height();
                // if(offset < tableOffsetTop || offset > tableOffsetBottom)
                //    $t_fixed.hide();
                // else if(offset >= tableOffsetTop && offset <= tableOffsetBottom && $t_fixed.is(":hidden"))
                //    $t_fixed.show();

                if(offset < tableOffsetTop)
                    $t_fixed.hide();
                else if(offset >= tableOffsetTop && $t_fixed.is(":hidden"))
                    $t_fixed.show();
            }
            $($this.parent()).resize(resizeFixed);
            $($this.parent()).scroll(scrollFixed);
            init();
        });
    };
})(jQuery);

function freezeedHeader($timeout){
    return {
        restrict: 'A',
        scope : {
            tableData: '= '
        },
        link: function(scope, element) {
            scope.$watch("tableData", function(newValue){
                if( newValue && newValue.length > 0){
                    $timeout(function () {
                        jQuery(element).fixMe();
                        // freezeTableHeader();
                    }, 50);
                }
            })
            // function freezeTableHeader() {
            //     jQuery(element).find('thead').css({
            //         'position': 'fixed',
            //         'background': '#FFF',
            //         'z-index': 2
            //     });
            //
            //     const col_width = jQuery(element).find('tbody > tr').eq(0).find('td').map((index, item) => jQuery(item).width());
            //
            //     jQuery(element).find('thead > tr > th').each(function() {
            //         jQuery(this).width(col_width[jQuery(this).index()]);
            //     });
            // }

        //     jQuery(window).load(() => {
        //         freezeTableHeader();
        // });
        //
        //     jQuery(window).resize(() => {
        //         freezeTableHeader();
        // });

        }
    };
}

/**
 *
 * Pass all functions into module
 */
angular
    .module('piApp')
    .directive('freezeedHeader', freezeedHeader)