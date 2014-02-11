function truncate (x, precision)
{
	precision = precision || 0;
    var scales = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
    var scale = scales[precision];
    return Math.round(x * scale) / scale;
}

function roundingTruncate (x, precision, rounding)
{
	precision = precision || 0;
	rounding = rounding || 'round';
    var scales = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
    var scale = scales[precision];
    return Math[rounding](x * scale) / scale;
}


// Этот класс содержит информацию о складах, складе производства и планируемых количествах продуктов;
// Объект этого класса следует поместить в контроллер приложения angular
// под именем planner;
function PlannerItems(options)
{
	var _this          = this;

	_this.elemsCounter = 1;
	_this.vessels      = {};
	_this.outputs      = {};

    // Количество, необходимое для производства запланированного количества продукта
    this.getOutputQty = function(label)
    {
        return _this.outputs[label].qty;
    };

    // Количество, оставшееся на складе в результате планирования
    this.getLeftQty = function(label)
    {
        var leftCount = _this.vessels[label].qty - _this.vessels[label].onWorkshop;
        if(leftCount < 0) leftCount = 0;
        return truncate(_this.vessels[label].onStorage - leftCount, 0);
    };

    // Количество, продукта, взятое со склада, для производства запланированного количества
    this.getOrderQty = function(label)
    {
        var orderQty =  roundingTruncate(_this.vessels[label].qty - _this.vessels[label].onWorkshop, _this.vessels[label].accuracy, _this.vessels[label].rounding);
        if(orderQty < 0) orderQty = 0;
        return orderQty;
    };

    // Округленное количество для производства. Необходимо для подписи
    this.getCurrentQty = function(label)
    {
        return truncate(_this.vessels[label].qty, 0);
    };

    this.updateOutputQty = function(label, value)
    {
        var onePiece = value / _this.outputs[label].proportion;
        var inputPieces = 0;
        var sum = 0;

        for(var key in _this.outputs)
        {
            _this.outputs[key].qty = roundingTruncate(onePiece * _this.outputs[key].proportion, _this.outputs[key].accuracy, _this.outputs[key].rounding);
            sum += _this.outputs[key].qty;
        }

        for(var key in _this.vessels)
        {
            var oldValue = _this.vessels[key].qty;
            var tubeValue = _this.vessels[key].tubeValue;
            _this.vessels[key].qty = roundingTruncate(onePiece * _this.vessels[key].proportion, _this.vessels[key].accuracy, _this.vessels[key].rounding);
            /*if(_this.vessels[key].qty > _this.vessels[key].workshopMax)
            {
                _this.vessels[key].workshopMax = _this.vessels[key].qty * 4;
            }
            if(_this.vessels[key].qty < _this.vessels[key].workshopMax / 4)
            {
                _this.vessels[key].workshopMax = _this.vessels[key].qty;
            }
            if( _this.vessels[key].workshopMax <  _this.vessels[key].maxLimit)
            {
                 _this.vessels[key].workshopMax =  _this.vessels[key].maxLimit;
            }*/
            if(_this.vessels[key].qty > _this.vessels[key].onWorkshop)
            {
                var sign = 0;
                if(_this.vessels[key].qty < oldValue) 
                {   
                    sign = -1;
                }
                if(_this.vessels[key].qty > oldValue) 
                {   
                    sign = 1;
                }
                tubeValue = (tubeValue + sign * 3) % 40;//Math.round(tubeValue + (_this.vessels[key].qty - oldValue) * 4) % 40;
                if(tubeValue < 0) tubeValue = (40 + tubeValue) % 40;   
                while(true)
                {
                    if(tubeValue >= 0 && tubeValue < 20)
                    {
                        $(_this.vessels[key].element).find('.tube').css('background-image',
                        'repeating-linear-gradient(60deg, #E3E3E3 0px, #E3E3E3 0px, #CACACA 0px, #CACACA ' + tubeValue + 'px, #E3E3E3 ' + tubeValue + 'px, #E3E3E3 ' + (tubeValue + 20) + 'px, #CACACA ' + (tubeValue + 20) + 'px, #CACACA 40px)');
                        break;
                    }
                    if(tubeValue >= 20 && tubeValue < 40)
                    {
                        $(_this.vessels[key].element).find('.tube').css('background-image',
                        'repeating-linear-gradient(60deg, #E3E3E3 0px, #E3E3E3 ' + (tubeValue - 20) + 'px, #CACACA ' + (tubeValue - 20) + 'px, #CACACA ' + tubeValue + 'px, #E3E3E3 ' + tubeValue + 'px, #E3E3E3 ' + (tubeValue + 20).limit(20, 40) + 'px, #CACACA 40px, #CACACA 40px)');
                        break;
                    }
                }
                _this.vessels[key].tubeValue = tubeValue;
            }
        }
    };

    // Стиль окраски склада
    this.storageHaving = function(label)
    {
        var pctLeft = (_this.vessels[label].onStorage === undefined) ? 100 : 100 - 100 * (_this.vessels[label].qty - _this.vessels[label].onWorkshop) / _this.vessels[label].onStorage;
        if(pctLeft >= 0)
        {
            if(_this.vessels[label].critical)
            {
                var criticalPct = 100 * _this.vessels[label].critical / _this.vessels[label].onStorage;
                if(criticalPct > pctLeft)
                {
                    return {'background-image': 'linear-gradient(0deg, #FFDDDD 0%, #FFDDDD ' + pctLeft + '%, #EFEFFF ' + pctLeft + '%, #EFEFFF 100%)'};
                }
            }
            return {'background-image': 'linear-gradient(0deg, #DADAFF 0%, #DADAFF ' + pctLeft + '%, #EFEFFF ' + pctLeft + '%, #EFEFFF 100%)'};
        }
        else
        {
            return {'background-color': '#FFDDDD'};
        }
    };

    // Стиль окраски склада производства
    this.workshopHaving = function(label)
    {
        var pctLeft = 100 * _this.vessels[label].qty / _this.vessels[label].workshopMax;
        if(pctLeft >= 0)
        {
            var criticalPct = 100 * _this.vessels[label].onWorkshop / _this.vessels[label].workshopMax;
            if(criticalPct > pctLeft)
            {
                return {'background-image': 'linear-gradient(0deg, #DADAFF 0%, #DADAFF ' + pctLeft + '%, #FFE7CE ' + pctLeft + '%, #FFE7CE 100%)'};
            }
            return {'background-image': 'linear-gradient(0deg, #FFCF9B 0%, #FFCF9B ' + pctLeft + '%, #FFE7CE ' + pctLeft + '%, #FFE7CE 100%)'};
        }
        else
        {
            return {'background-color': '#C8FFB9'};
        }
    };

    // Стиль уровня подписи критического остатка
    this.critical = function(label)
    {
        return {'top': 100 - 100 * _this.vessels[label].critical / _this.vessels[label].onStorage + '%'};
    };

    // Стиль подписи текущего количества на складе производства
    this.onWorkshop = function(label)
    {
        return {'top': 100 - (100 * _this.vessels[label].onWorkshop / _this.vessels[label].workshopMax).limit(0, 100) + '%'};
    };

    // Стиль подписи остатка на складе
    this.storageLeft = function(label)
    {
        var pct = 100 * (_this.vessels[label].qty - _this.vessels[label].onWorkshop).limit(0, _this.vessels[label].onStorage) / _this.vessels[label].onStorage;
        if(pct > 100) pct = 100;
        return {'top': pct + '%'};
    };

    // Стиль подписи количества на складе производства после планирования
    this.workshopNow = function(label)
    {
        var pct = (100 - 100 * _this.vessels[label].qty / _this.vessels[label].workshopMax).limit(0, 100);
        return {'top': pct + '%'};
    };
}

isAnyAdjustableNumberDragging = false;

function CommVesselsDirective($compile) 
{       
    return {
    	link: function($scope, element, attrs) {
    			var label       = attrs.label    || ('Элемент ' + $scope.planner.elemsCounter);
        		var rounding    = attrs.rounding || 'round';
                var uom         = attrs.uom      || '';

        		var proportion  = (attrs.proportion  === undefined) ? 1.0 : parseFloat(attrs.proportion); 
        		var step        = (attrs.step        === undefined) ? 1.0 : parseFloat(attrs.step);
        		var accuracy    = (attrs.accuracy    === undefined) ? 2 : parseInt(attrs.accuracy);
        		var onStorage   = (attrs.storageqty  === undefined) ? undefined : parseFloat(attrs.storageqty);
        		var onWorkshop  = (attrs.workshopqty === undefined) ? 0.0 : parseFloat(attrs.workshopqty);
        		var critical    = (attrs.critical    === undefined || onStorage === undefined) ? undefined : parseFloat(attrs.critical);

        		if(isNaN(onStorage)) onStorage = undefined;
        		if(isNaN(onWorkshop)) onWorkshop = 0.0;
        		if(isNaN(critical)) critical = undefined;
        		if(isNaN(accuracy)) accuracy = 2;

        		if(proportion <= 0) proportion = 1.0;
        		if(step <= 0) step = 1.0;
        		if(accuracy < 0) accuracy = 0;
        		if(onStorage < 0) onStorage = undefined;
        		if(onWorkshop < 0) onWorkshop = 0.0
        		if(critical !== undefined && onStorage !== undefined)
        		{
        			if(critical < 0) critical = 0;
        			if(critical > onStorage) critical = onStorage;
        		}

                var ves = 
                {
                    qty:         0,
                    proportion:  proportion,
                    accuracy:    accuracy,
                    rounding:    rounding,
                    onStorage:   onStorage,
                    onWorkshop:  onWorkshop,
                    workshopMax: onWorkshop * 4 || 10,
                    maxLimit:    onWorkshop * 4 || 10,
                    critical:    critical,
                    element:     element,
                    tubeValue:   0,
                    uom:         uom
                };

                $scope.planner.vessels[label] = ves;

                tpl = $compile('<span>' + label + '</span>')($scope);
                $(element).find('#product-label').append(tpl);

                tpl = $compile('<div ng-style="planner.storageHaving(\'' + label + '\')" class="storage-coloring" id="storage-coloring"></div>')($scope);
                $(element).find('#storage').append(tpl);

                tpl = $compile('<div ng-style="planner.workshopHaving(\'' + label + '\')" class="storage-coloring" id="workshop-coloring"></div>')($scope);
                $(element).find('#workshop').append(tpl);

                if(onStorage !== undefined)
                {
                    tpl = $compile('<div class="storage-having" id="storage-having"></div>')($scope);
                    $(element).find('#storage').append(tpl);

                    tpl = $compile('<div class="planner-labels-dash"></div><div class="planner-labels-having">{{planner.vessels["' + label + '"].onStorage}}</div>')($scope);
                    $(element).find('#storage-having').append(tpl);

                    tpl = $compile('<div ng-style="planner.storageLeft(\'' + label + '\')" class="storage-left" id="storage-left"></div>')($scope);
                    $(element).find('#storage').append(tpl);

                    tpl = $compile('<div class="planner-labels-left">{{planner.getLeftQty("' + label + '")}}</div>')($scope);
                    $(element).find('#storage-left').append(tpl);

                    if(critical)
                    {
                        tpl = $compile('<div ng-style="planner.critical(\'' + label + '\')" class="storage-critical" id="storage-critical"></div>')($scope);
                        $(element).find('#storage').append(tpl);

                        tpl = $compile('<div class="planner-labels-dash-red"></div><div class="planner-labels-critical">{{planner.vessels["' + label + '"].critical}}</div>')($scope);
                        $(element).find('#storage-critical').append(tpl);
                    }
                }

                tpl = $compile('<div ng-style="planner.onWorkshop(\'' + label + '\')" class="storage-critical" id="on-workshop"></div>')($scope);
                $(element).find('#workshop').append(tpl);

                tpl = $compile('<div class="planner-labels-dash"></div><div class="planner-labels-having">{{planner.vessels["' + label + '"].onWorkshop}}</div>')($scope);
                $(element).find('#on-workshop').append(tpl);

                tpl = $compile('<div ng-style="planner.workshopNow(\'' + label + '\')" class="storage-left" id="workshop-now"></div>')($scope);
                $(element).find('#workshop').append(tpl);

                tpl = $compile('<div class="planner-labels-left">{{planner.getCurrentQty("' + label + '")}}</div>')($scope);
                $(element).find('#workshop-now').append(tpl);

                tpl = $compile('<div class="tube-qty"><span id="qty">{{planner.getOrderQty("' + label + '")}} ' + uom + '</span></div>')($scope);
                $(element).find('#tube').append(tpl);

                element.on('$destroy', function() {
                    delete $scope.planner.vessels[label];
                });
    	},

    	template:   '<div id="vessel-body" class="vessel-body">' +
                        '<div id="tube-container" class="tube-container">' +
                            '<div id="tube-body" class="tube-body">' +
                                '<div id="product-label" class="product-label">' +
                                '</div>' +
                                '<div id="tube" class="tube">' +
                                '</div>' +
                            '</div>' + 
                        '</div>' +
                        '<div id="storage" class="storage">' + 
                        '</div>' +
                        '<div id="workshop" class="workshop">' + 
                        '</div>' + 
                    '</div>'
    }
};

function PlanningProductDirective($compile) 
{       
    return {
        link: function($scope, element, attrs) {
                var label       = attrs.label    || ('Элемент ' + $scope.planner.elemsCounter);
                var rounding    = attrs.rounding || 'round';
                var uom         = attrs.uom      || '';

                var proportion  = (attrs.proportion  === undefined) ? 1.0 : parseFloat(attrs.proportion); 
                var step        = (attrs.step        === undefined) ? 1.0 : parseFloat(attrs.step);
                var accuracy    = (attrs.accuracy    === undefined) ? 2 : parseInt(attrs.accuracy);
                var min         = (attrs.min         === undefined) ? 0.0 : parseFloat(attrs.min);

                if(isNaN(accuracy)) accuracy = 2;

                if(proportion <= 0) proportion = 1.0;
                if(step <= 0) step = 1.0;
                if(accuracy < 0) accuracy = 0;
                if(min < 0) min = 0;

                var isHovering = false;
                var isDragging = false;
                var valueAtMouseDown = proportion;
                var clickTime = new Date();
                var delta     = 0;
                var textInput = undefined;

                var prod = 
                {
                    qty:        0,
                    proportion: proportion,
                    accuracy:   accuracy,
                    rounding:   rounding,
                    uom:        uom
                };

                $scope.planner.outputs[label] = prod;

                tpl = $compile('<span>' + label + '</span>')($scope);
                $(element).find('#planning-label').append(tpl);

                tpl = $compile('<span class="planner-value" id="qty">{{planner.outputs["' + label + '"].qty}} ' + uom + '</span>')($scope);
                $(element).find('#planning-qty').append(tpl);

                function initializeHover() 
                {
                    isHovering = false;
                    var span = $(element).find('#planning-body');
                    span.bind("mouseenter", function () { isHovering = true;  updateCursor(); });
                    span.bind("mouseleave", function () { isHovering = false; updateCursor(); });
                }

                function isActive() 
                {
                    return isDragging || (isHovering && !isAnyAdjustableNumberDragging);
                }

                function updateCursor() 
                {
                    if (isActive()) { $("body").addClass("DragHorizontal");}
                    else { $("body").removeClass("DragHorizontal"); }
                }

                var drag = 
                {
                    touchDidGoDown: function (touches) 
                    {
                        $(document).find('.storage-having').css('opacity', '1.0');
                        $(document).find('.storage-critical').css('opacity', '1.0');
                        $(document).find('.storage-left').css('opacity', '1.0');
                        $('.hand-input').blur();
                        valueAtMouseDown = $scope.planner.getOutputQty(label);
                        isDragging = true;
                        isAnyAdjustableNumberDragging = true;
                        clickTime = new Date();
                        updateCursor();
                    },
                    
                    touchDidMove: function (touches) 
                    {
                        var value = valueAtMouseDown + touches.translation.x / 5 * step;
                        value = ((value / step).round() * step);
                        var oldValue = $scope.planner.getOutputQty(label);
                        if(min !== undefined)
                        {
                            if(value < min) value = min;
                        }
                        $scope.$apply(function() {
                            $scope.planner.updateOutputQty(label, value);
                        });         
                        updateCursor();
                    },
                    
                    touchDidGoUp: function (touches) 
                    {
                        $(document).find('.storage-having').css('opacity', '0.3');
                        $(document).find('.storage-critical').css('opacity', '0.3');
                        $(document).find('.storage-left').css('opacity', '0.3');
                        isDragging = false;
                        isAnyAdjustableNumberDragging = false;
                        updateCursor();

                        var currentTime = new Date();
                        delta = currentTime - clickTime;

                        if(delta < 200) 
                        {
                            !textInput && createTextInput();
                        }
                    }
                };

                function createTextInput()
                {
                    var _this = this;

                    $(element).find('#qty').css('display', 'none');
                    textInput = $('<input class="hand-input" type="text"></input>');
                    var value = $scope.planner.getOutputQty(label);
                    textInput.attr('value', value);

                    var deleteElement = function()
                    {
                        $scope.$apply(function(){
                            var val = Math.abs(parseFloat(textInput.val()) || 0);
                            $scope.planner.updateOutputQty(label, val);
                        });

                        textInput.remove();
                        $(element).find('#qty').css('display', '');
                        textInput = undefined;
                    };

                    textInput.bind('blur', deleteElement);
                    textInput.bind('keypress', function(e)
                    { 
                        if(e.keyCode === 13)
                        {
                            deleteElement();
                        }
                    });

                    $(element).find('#planning-body').append(textInput);
                    textInput.focus();
                }

                function initializeDrag()
                {
                    isDragging = false;
                    new BVTouchable($(element).find('#planning-body')[0], drag);
                }
                
                initializeHover();
                initializeDrag();

                element.on('$destroy', function() {
                    delete $scope.planner.outputs[label];
                });
        },

        template:   '<div id="planning-body" class="planning-body">' +
                        '<div id="planning-label" class="planning-label">' +
                        '</div>' +
                        '<br/>' +
                        '<div id="planning-qty" class="planning-qty">' +
                        '</div>' +
                    '</div>'
    }
}