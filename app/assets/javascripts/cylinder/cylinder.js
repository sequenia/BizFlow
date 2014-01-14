function truncate (x, precision)
{
	precision = precision || 0;
    var scales = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
    var scale = scales[precision];
    return Math.round(x * scale) / scale;
}

// Округление с заданной точностью и в заданную сторону
function roundingTruncate (x, precision, rounding)
{
	precision = precision || 0;
	rounding = rounding || 'round';
    var scales = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
    var scale = scales[precision];
    return Math[rounding](x * scale) / scale;
}

// Этот класс содержит входные и выходные элементы системы мензурок;
// Объект этого класса следует поместить в контроллер приложения angular,
// и обозначить именем cylinder;
function CylinderItems(options)
{
	var cylinder          = this;

	cylinder.elemsCounter = 1;
	cylinder.inputs       = {};
	cylinder.outputs      = {};

	cylinder.getInputQty = function(label)
	{
		return cylinder.inputs[label].qty;
	};

	cylinder.getOutputQty = function(label)
	{
		return cylinder.outputs[label].qty;
	};

	cylinder.getLeftQty = function(label)
	{
		return truncate(cylinder.inputs[label].having - cylinder.inputs[label].qty, 0);
	};

	cylinder.updateInputQty = function(label, value)
	{
		var onePiece = value / cylinder.inputs[label].proportion;
		var outputPieces = 0;
		var sum = 0;

		for(var key in cylinder.inputs)
		{
			cylinder.inputs[key].qty = roundingTruncate(onePiece * cylinder.inputs[key].proportion, cylinder.inputs[key].accuracy, cylinder.inputs[key].rounding);
			sum += cylinder.inputs[key].qty; 
		}

		for(var key in cylinder.outputs)
		{
			cylinder.outputs[key].qty = roundingTruncate(onePiece * cylinder.outputs[key].proportion, cylinder.outputs[key].accuracy, cylinder.outputs[key].rounding);
		}
	};

	cylinder.updateOutputQty = function(label, value)
	{
		var onePiece = value / cylinder.outputs[label].proportion;
		var inputPieces = 0;
		var sum = 0;

		for(var key in cylinder.outputs)
		{
			cylinder.outputs[key].qty = roundingTruncate(onePiece * cylinder.outputs[key].proportion, cylinder.outputs[key].accuracy, cylinder.outputs[key].rounding);
			sum += cylinder.outputs[key].qty;
		}

		for(var key in cylinder.inputs)
		{
			cylinder.inputs[key].qty = roundingTruncate(onePiece * cylinder.inputs[key].proportion, cylinder.inputs[key].accuracy, cylinder.inputs[key].rounding);
		}
	};

	// Возвращает стиль, который окрашивает цилиндр необходимым образом
	cylinder.having = function(label)
	{
		var pctLeft     = 100 - 100 * cylinder.inputs[label].qty / cylinder.inputs[label].having;
		if(pctLeft >= 0)
		{
			if(cylinder.inputs[label].critical)
			{
				var criticalPct = 100 * cylinder.inputs[label].critical / cylinder.inputs[label].having;
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

	// Стиль, устанавливающий уровень, на котором будет находится подпись критического остатка
	cylinder.critical = function(label)
	{
		return {'top': 100 - 100 * cylinder.inputs[label].critical / cylinder.inputs[label].having + '%'};
	}

	// Стиль уровная подписи оставшегося в мензурке количества
	cylinder.left = function(label)
	{
		var pct = 100 * cylinder.inputs[label].qty / cylinder.inputs[label].having;
		if(pct > 100) pct = 100;
		return {'top': pct + '%'};
	};
}

isAnyAdjustableNumberDragging = false;

function CylinderDirective($compile) 
{       
    return {
        link: function($scope, element, attrs) {
        		// Берем атрибуты
        		var label      = attrs.label || ('Элемент ' + $scope.cylinder.elemsCounter);
        		var type       = attrs.type  || 'input';
        		var rounding   = attrs.rounding || 'round';
        		var uom        = attrs.uom      || '';

        		var proportion = (attrs.proportion === undefined) ? 1.0 : parseFloat(attrs.proportion); 
        		var step       = (attrs.step       === undefined) ? 1.0 : parseFloat(attrs.step);
        		var accuracy   = (attrs.accuracy   === undefined) ? 2 : parseInt(attrs.accuracy);
        		var min        = (attrs.min        === undefined) ? 0.0 : parseFloat(attrs.min);
        		var max        = (attrs.max        === undefined) ? undefined : parseFloat(attrs.max);
        		var having     = (attrs.having     === undefined) ? undefined : parseFloat(attrs.having);
        		var critical   = (attrs.critical   === undefined || having === undefined) ? undefined : parseFloat(attrs.critical);

        		if(isNaN(having))   having = undefined;
        		if(isNaN(critical)) critical = undefined;
        		if(isNaN(accuracy)) accuracy = 2;

        		if(!(type == 'input' || type == 'output')) type = 'input';
        		if(proportion <= 0) proportion = 1.0;
        		if(step <= 0) step = 1.0;
        		if(accuracy < 0) accuracy = 0;
        		if(min < 0) min = 0;
        		if(having < 0) having = undefined;
        		if(max !== undefined && max < min) max = min + 1.0;
        		if(critical !== undefined && having !== undefined)
        		{
        			if(critical < 0) critical = 0;
        			if(critical > having) critical = having;
        		}

        		var isHovering = false;
        		var isDragging = false;
        		var valueAtMouseDown = proportion;
        		var clickTime = new Date();
        		var delta     = 0;
                var textInput = undefined;

        		var cyl = 
        		{
                	qty:        proportion,
                	proportion: proportion,
                	accuracy:   accuracy,
                	rounding:   rounding,
                	having:     truncate(having, 2),
                	critical:   truncate(critical, 2),
                	uom:        uom
        		};

        		var tpl;
                $(element).find('#label').text(label); 
                if(type == 'input')
                {
                	$scope.cylinder.inputs[label] = cyl;
                	$(element).find('#grad-cylinder').addClass('input-cylinder');
                	tpl = $compile('<span class="cylinder-value" id="qty">{{cylinder.inputs["' + label + '"].qty}} ' + uom + '</span>')($scope);
            	}
            	else
            	{
            		$scope.cylinder.outputs[label] = cyl;
            		$(element).find('#grad-cylinder').addClass('output-cylinder');
            		tpl = $compile('<span class="cylinder-value" id="qty">{{cylinder.outputs["' + label + '"].qty}} ' + uom + '</span>')($scope);
            	}
				$(element).find('#qty-container').append(tpl);
                $scope.cylinder.elemsCounter++;

                if(having !== undefined && type == 'input')
                {
                	tpl = $compile('<div ng-style="cylinder.having(\'' + label + '\')" class="cylinder-having"></div>')($scope);
                	$(element).find('#cylinder-coloring').append(tpl);
                	tpl = $compile('<div class="cylinder-labels-dash"></div><div class="cylinder-labels-having">{{cylinder.inputs["' + label + '"].having}}</div>')($scope);
                	$(element).find('#having-label').append(tpl);
                	tpl = $compile('<div class="labels-left-container" ng-style="cylinder.left(\'' + label + '\')"><div class="cylinder-labels-left">{{cylinder.getLeftQty("' + label + '")}}</div></div>')($scope);
                	$(element).find('#left-label').append(tpl);

                	if(critical !== undefined)
                	{
                		tpl = $compile('<div class="labels-critical-container" ng-style="cylinder.critical(\'' + label + '\')"><div class="cylinder-labels-dash cylinder-red-dash"></div><div class="cylinder-labels-critical">{{cylinder.inputs["' + label + '"].critical}}</div></div>')($scope);
                		$(element).find('#critical-label').append(tpl);
                	}
                }

                function initializeHover() 
			    {
			        isHovering = false;
			        var span = $(element).find('#qty');
			        span.bind("mouseenter", function () { isHovering = true;  updateCursor(); });
			        span.bind("mouseleave", function () { isHovering = false; updateCursor(); });
			    }

			    function isActive() 
			    {
			        return isDragging || (isHovering && !isAnyAdjustableNumberDragging);
			    }

			    function updateCursor() 
			    {
			        if (isActive()) { $("body").addClass("DragHorizontal"); }
			        else { $("body").removeClass("DragHorizontal"); }
			    }

			    var drag = 
			    {
				    touchDidGoDown: function (touches) 
				    {
				    	$('.cylinder-labels').css('opacity', '0.8');
				    	$('.hand-input').blur();
				        valueAtMouseDown = (type == 'input') ? $scope.cylinder.getInputQty(label) :
				        									   $scope.cylinder.getOutputQty(label);
				        isDragging = true;
				        isAnyAdjustableNumberDragging = true;
				        updateCursor();
				    },
				    
				    touchDidMove: function (touches) 
				    {
				        var value = valueAtMouseDown + touches.translation.x / 5 * step;
				        value = ((value / step).round() * step);
				        if(min !== undefined)
				        {
				        	if(value < min) value = min;
				    	}
				        if(max !== undefined)
				        {
				        	if(value > max) value = max;
				        }
				        $scope.$apply(function() {
				        	(type == 'input') ? $scope.cylinder.updateInputQty(label, value):
				        						$scope.cylinder.updateOutputQty(label, value);
				        }); 
				        updateCursor();
				    },
				    
				    touchDidGoUp: function (touches) 
				    {
				    	$('.cylinder-labels').css('opacity', '0.3');
				        isDragging = false;
				        isAnyAdjustableNumberDragging = false;
				        updateCursor();

				        var currentTime = new Date();
					    delta = currentTime - clickTime;
					    clickTime = currentTime;

					    if(delta < 200) 
					    {
					        console.log('double-click');
					        !textInput && createTextInput();
					    }
				    }
				};

				function createTextInput()
			    {
	  		        var _this = this;

	  		        $(element).find('#qty').css('display', 'none');
	  		        textInput = $('<input class="hand-input" type="text"></input>');
	  		        var value = (type == 'input') ? $scope.cylinder.getInputQty(label) :
				        							$scope.cylinder.getOutputQty(label)
	  		        textInput.attr('value', value);

	  		        var deleteElement = function()
	  		        {
	  		        	$scope.$apply(function(){
	  		        		var val = Math.abs(parseFloat(textInput.val()) || 0);
							(type == 'input') ? $scope.cylinder.updateInputQty(label, val):
				        						$scope.cylinder.updateOutputQty(label, val);
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

	  		        $(element).find('#qty-container').append(textInput);
	  		        textInput.focus();
			    }

				function initializeDrag()
			    {
			        isDragging = false;
			        new BVTouchable($(element).find('#qty')[0], drag);
			    }
		        
		        initializeHover();
                initializeDrag();

                element.on('$destroy', function() {
			    	if(type == 'input')
			    	{
			    		delete $scope.cylinder.inputs[label];
			    	}
			    	else
			    	{
			    		delete $scope.cylinder.outputs[label];
			    	}
			    });
        },

        template: 	'<div id="grad-cylinder" class="grad-cylinder">' + 
        	        	'<div id="cylinder-coloring" class="cylinder-coloring">' +
	        		    '</div>' +
	        		    '<div id="having-label" class="cylinder-labels">' + 
	        		    '</div>' + 
	        		   	'<div id="left-label" class="cylinder-labels">' + 
	        		    '</div>' + 
	        		    '<div id="critical-label" class="cylinder-labels">' + 
	        		    '</div>' + 
        			    '<div id="cylinder-body" class="cylinder-body">' +
	        		       '<div id="label" class="cylinder-label">' +
	        		       '</div>' +
	        		       '<div id="qty-container" class="qty-container">' +
	        		       '</div>' +
	        		    '</div>' +
        		  	'</div>'
    }
}