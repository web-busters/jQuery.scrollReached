/**
 * "Доскроллили!"
 * Плагин слежения за скроллом.
 * Вызывает функцию обратного вызова для всех элементов, до которых доскроллили.
 */

(function($){
    var $window = $(window);
    var listenerBinded = false;
    var objects = [];
    var addTimer;

    var listener = function(){
        var wTop = $window.scrollTop() + $window.height();
        for (var k = 0, object, oTop, callback, data; k < objects.length; k++) {
            object = objects[k];
            oTop = object.offset().top;
            if (wTop >= oTop) {
                data = object.data('scrollReached');
                callback = data.callback;
                if (data.one) {
                    object.scrollReached('destroy');
                }
                callback.call(object.get(0));
            }
        }
    };

    var methods = {
        init: function(options, callback){
            if (!callback && typeof options === 'function') {
                callback = options;
                options = {};
            }

            return this.each(function(){
                var $this = $(this);
                var data = $this.data('scrollReached');

                if (!data) {
                    $this.data('scrollReached', {
                        target: this,
                        one: !!options.one,
                        callback: callback
                    });
                }

                if (!listenerBinded) {
                    listenerBinded = true;
                    methods._listenerBind();
                }

                objects[objects.length] = $this;

                /**
                 * Если плагин вызывается только один раз для каждого элемента,
                 * то вызываем функцию listener для каждого элемента отдельно.
                 * Если плагин вызывается многократно, то вызываем функцию listener
                 * один раз для всех видимых элементов.
                 */
                if (!options.one) {
                    if (addTimer) {
                        clearTimeout(addTimer);
                    }
                }
                addTimer = setTimeout(listener, 100);
            });
        },

        destroy: function(){
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('scrollReached');

                $this.removeData('scrollReached');

                var newObjects = [];
                for (var k = 0, object; k < objects.length; k++) {
                    object = objects[k];
                    if (!object.is($this)) {
                        newObjects[newObjects.length] = object;
                    }
                }
                objects = newObjects;

                if (!objects.length) {
                    methods._listenerUnbind();
                    listenerBinded = false;
                }
            });
        },

        _listenerBind: function(){
            $window.bind('scroll', listener);
            $window.bind('resize', listener);
        },

        _listenerUnbind: function(){
            $window.unbind('scroll', listener);
            $window.unbind('resize', listener);
        }
    };

    $.fn.scrollReached = function(method){
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || typeof method === 'function' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод ' + method + ' отсутствует в jQuery.scrollReached');
        }
    };
})(jQuery);