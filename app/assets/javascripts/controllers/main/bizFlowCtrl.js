$(document).ready(function()
{
	angular.bootstrap(document.getElementById('bizflow'), ['BizFlowApp']);
});

var bizflow = angular.module("BizFlowApp", []);

var bizFlowCtrl = function($scope, $http, $templateCache)
{
	$http.defaults.useXDomain = true;
    delete $http.defaults.headers.common['X-Requested-With'];
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $http.defaults.headers.post['Accept'] = 'text/json';
    $scope.methods  = 
    {
        get:  'GET',
        post: 'POST'
    };
    $scope.url            = 'http://test-bmp.tk/bmp/bizflow.json?dataAreaId=strd&encoding=UTF-8'; 
    $scope.loading        = true;
	$scope.cylinder       = new CylinderItems();
	$scope.planner        = new PlannerItems();
	$scope.history        = {};
	$scope.historyLength  = 0;
	$scope.productionRecipeName = '';
	$scope.planningRecipeName   = '';
	$scope.recipes; //= {"Шпатлевка":{"inputs":[{"critical":0,"pct":4.8,"UOM":"кг","onHand":432,"productName":"Мрам - 100"},{"critical":0,"pct":15.4,"UOM":"кг","onHand":1386,"productName":"Химик - 3М"},{"critical":0,"pct":15.9,"UOM":"кг","onHand":1431,"productName":"Загуститель ВС"},{"critical":800,"pct":63.9,"UOM":"кг","onHand":1141,"productName":"ГО-1"}],"itemType":30,"name":"Шпатлевка","outputs":[{"pct":100,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"}],"productionLocation":"Цех"},"Шпат-20кг":{"inputs":[{"critical":0,"pct":1,"UOM":"шт","onHand":100,"productName":"Мешок 20кг"},{"critical":0,"pct":20,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"}],"itemType":40,"name":"Шпат-20кг","outputs":[{"pct":1,"UOM":"шт","onHand":0,"productName":"Шпат-20кг"}],"productionLocation":"Цех"},"Просев":{"inputs":[{"critical":0,"pct":80,"UOM":"кг","onHand":800,"productName":"Гипс К"},{"critical":8000,"pct":20,"UOM":"кг","onHand":450,"productName":"Вяж. 1"}],"itemType":20,"name":"Просев","outputs":[{"pct":9,"UOM":"шт","productName":"ГО-2","onHand":220},{"pct":91,"UOM":"шт","productName":"ГО-1","onHand":1141}],"productionLocation":"Цех"},"Шпат-25кг":{"inputs":[{"critical":0,"pct":25,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"},{"critical":0,"pct":1,"UOM":"шт","onHand":100,"productName":"Мешок 25кг"}],"itemType":40,"name":"Шпат-25кг","outputs":[{"pct":1,"UOM":"шт","onHand":0,"productName":"Шпат-25кг"}],"productionLocation":"Цех"},"Шпат-10кг":{"inputs":[{"critical":0,"pct":10,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"},{"critical":0,"pct":1,"UOM":"шт","onHand":100,"productName":"Мешок 10кг"}],"itemType":40,"name":"Шпат-10кг","outputs":[{"pct":1,"UOM":"шт","onHand":0,"productName":"Шпат-10кг"}],"productionLocation":"Цех"},"Шпат-5кг":{"inputs":[{"critical":0,"pct":1,"UOM":"шт","onHand":100,"productName":"Мешок 5кг"},{"critical":0,"pct":5,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"}],"itemType":40,"name":"Шпат-5кг","outputs":[{"pct":1,"UOM":"шт","onHand":0,"productName":"Шпат-5кг"}],"productionLocation":"Цех"}};

	init();

	function init()
	{
		executeQuery($scope.methods.get, $scope.url, "", initializeCallback, errorCallback);
	}

	// Выполняет запрос заданного типа, по заданной URL;
	// В случае успеха выполняется successCallback, в случае ошибки - errorCallback;
	function executeQuery(queryMethod, queryUrl, queryData, successCallback, errorCallback)
	{
        $scope.loading = true;
        $http({
            method: queryMethod,
            url: queryUrl,
            data: queryData,
            cache: $templateCache})
        .success(successCallback)
        .error(errorCallback);
    }

    function errorCallback(data, status)
    {
        console.log("Request failed");
        $scope.loading = false;
    }

    // Инициализация рецептов
    function initializeCallback(data, status)
    {
        console.log("Request was successful");
        $scope.recipes = $.extend(true, {}, data.Reciptes)

        for(var key in $scope.recipes)
		{
			$scope.productionRecipeName = key;
			$scope.planningRecipeName   = key;
			break;
		}

        $scope.loading = false;
    }

    // Выполняется при оформлении производства
    function successProductionCallback(data, status)
    {
    	console.log("Request was successful");
        var old = 
		{
			'inputs':     $.extend(true, {}, $scope.cylinder.inputs),
			'outputs':    $.extend(true, {}, $scope.cylinder.outputs),
			'recipeName': $scope.productionRecipeName,
			'date':       (new Date()).toLocaleString(),
			'result':     data.productionResult,
			'type':       'production'
		};

		$scope.history[($scope.historyLength++) + ''] = old;

        $scope.recipes = data.newReciptes.Reciptes;

        $scope.loading = false;

		$('html, body').animate({
		    scrollTop: $("#productionInputs").offset().top
		}, "slow");
    }

    // Выполняется при оформлении планирования
    function successPlanningCallback(data, status)
    {
        console.log("Request was successful");
        var old = 
        {
            'inputs':     $.extend(true, {}, $scope.planner.vessels),
            'outputs':    $.extend(true, {}, $scope.planner.outputs),
            'recipeName': $scope.planningRecipeName,
            'date':       (new Date()).toLocaleString(),
            'result':     data.productionResult,
            'type':       'planning'
        };

        $scope.history[($scope.historyLength++) + ''] = old;

        $scope.loading = false;

        $('html, body').animate({
            scrollTop: $("#planning-inputs").offset().top
        }, "slow");
    }

	// Выполняется при нажатии кнопки Пуск производства
	$scope.productionExecute = function()
	{
        var sendData =
        {
        	dataAreaId: 'strd',
        	encoding: 'UTF-8',
            actionType: 'production',
            Order:
            {
                recipeName: $scope.productionRecipeName,
                totalCount: 0
            }
        };

        for(var key in $scope.cylinder.outputs)
        {
        	sendData.Order.totalCount += $scope.cylinder.outputs[key].qty;
        }

        executeQuery($scope.methods.post, $scope.url, JSON.stringify(sendData), successProductionCallback, errorCallback);
	};

	// Выполняется при нажатии кнопки Пуск планирования
	$scope.planningExecute = function()
	{
        var sendData =
        {
            dataAreaId: 'strd',
            encoding: 'UTF-8',
            actionType: 'planning',
            Order:
            {
                recipeName: $scope.planningRecipeName,
                totalCount: 0
            }
        };

        for(var key in $scope.planner.outputs)
        {
            sendData.Order.totalCount += $scope.planner.outputs[key].qty;
        }

        executeQuery($scope.methods.post, $scope.url, JSON.stringify(sendData), successPlanningCallback, errorCallback);
	};

	// Поличить корректную подпись для продукта
	$scope.getOutputName = function(output, recipeName)
	{
		if($scope.recipes[recipeName].itemType == 40) 
		{
			return output.productName;
		}
		else
		{
			return output.productName + ' (' + output.pct + '%)'
		}
	};

    // Поличить корректную подпись для продукта
	$scope.getInputName = function(input, recipeName)
	{
		if($scope.recipes[recipeName].itemType == 40) 
		{
			return input.productName;
		}
		else
		{
			return input.productName + ' (' + input.pct + '%)'
		}
	};

	$scope.inputSpanType = function()
	{
		var type = Math.ceil(12 / $scope.recipes[$scope.productionRecipeName].inputs.length);
		if(type < 3) type = 3;
		return type; 
	};

	$scope.outputSpanType = function()
	{
		var type = Math.ceil(12 / $scope.recipes[$scope.productionRecipeName].outputs.length);
		if(type < 3) type = 3;
		return type; 
	};

	$scope.inputHistorySpanType = function(recipeName)
	{
		var type = Math.ceil(12 / $scope.recipes[recipeName].inputs.length);
		if(type < 3) type = 3;
		return type; 
	};

	$scope.executeButtonDisabled = function()
	{
		return $scope.loading;
	};

	$scope.outputHistorySpanType = function(recipeName)
	{
		var type = Math.ceil(12 / $scope.recipes[recipeName].outputs.length);
		if(type < 3) type = 3;
		return type; 
	};

	$scope.orderSuccess = function(old)
	{
		return (old.result.search('успешно') == -1) ? false : true;
	};
};

bizflow.controller("bizFlowCtrl", bizFlowCtrl);

bizflow.directive('cylinder', CylinderDirective);
bizflow.directive('history', HistoryDirective);

bizflow.directive('commVessels', CommVesselsDirective);
bizflow.directive('planning', PlanningProductDirective);

function HistoryDirective($compile) 
{       
    return {
        link: function($scope, element, attrs) {
        	var key     = attrs.key;
        	var history = $scope.history[key];
        	var tpl;

        	switch(history['type'])
        	{
        		case 'production':
        			tpl = $compile('<div class="row-fluid" id="inputs"></div>')($scope);
            		$(element).find('#history').append(tpl);
            		tpl = $compile('<div class="row-fluid" id="operation"></div>')($scope);
            		$(element).find('#history').append(tpl);
            		tpl = $compile('<div class="row-fluid" id="outputs"></div>')($scope);
            		$(element).find('#history').append(tpl);

            		for(var label in history.inputs)
            		{
            			tpl = $compile( '<div class="span' + $scope.inputHistorySpanType(history.recipeName) + '">' +
            								'<div class="history-body"><h4>' + label + '</h4><h4>' + history.inputs[label].qty + ' ' + history.inputs[label].uom + '</h4></div>' +
            								'<div class="arrow-input"></div>' + 
            							'</div>')($scope);
            			$(element).find("#inputs").append(tpl);
            		}
            		for(var label in history.outputs)
            		{
            			tpl = $compile( '<div class="span' + $scope.outputHistorySpanType(history.recipeName) + '">' +
            								'<div class="arrow-output"></div>' + 
            								'<div class="history-body"><h4>' + label + '</h4><h4>' + history.outputs[label].qty + ' ' + history.outputs[label].uom + '</h4></div>' +
            							'</div>')($scope);
            			$(element).find("#outputs").append(tpl);
            		}
            		tpl = $compile( '<div class="span12 history-recipe-' + $scope.orderSuccess(history) + '">' +
            							'<h3>Операция: ' + history.recipeName + '</h3>' +
            							'<h4>Дата: ' + history.date + '</h4>' +
            							'<h4>' + history.result + '</h4>' +
	                				'</div>')($scope);
            		$(element).find("#operation").append(tpl);
        			break;

        		case 'planning':
        			for(var label in history.inputs)
            		{
            			var leftCount = history.inputs[label].qty - history.inputs[label].onWorkshop;
        				if(leftCount < 0) leftCount = 0;
        				leftCount = roundingTruncate(history.inputs[label].onStorage - leftCount, history.inputs[label].accuracy, history.inputs[label].rounding);

        				var orderQty =  roundingTruncate(history.inputs[label].qty - history.inputs[label].onWorkshop, history.inputs[label].accuracy, history.inputs[label].rounding);
				        if(orderQty < 0) orderQty = 0;

				        var onWorkshopQty = history.inputs[label].qty;
				        if(onWorkshopQty < history.inputs[label].onWorkshop) 
				        {
				        	onWorkshopQty = history.inputs[label].onWorkshop;
				        };
				        onWorkshopQty = roundingTruncate(onWorkshopQty, history.inputs[label].accuracy, history.inputs[label].rounding);
            			tpl = $compile( '<div class="row-fluid">' +
            								'<div class="span4 planning-history-body">' +
            									'<div class="arrow-planning"></div>' +
            									'<span><h4>Остаток на складе: ' + leftCount + ' ' + history.inputs[label].uom + '</h4></span>' +
            								'</div>' +
            								'<div class="span4 planning-history-body">' +
            									'<div class="arrow-planning"></div>' +
            									'<span><h4>Взято со склада ' + label + ': ' + orderQty + ' ' + history.inputs[label].uom + '</h4></span>' +
            								'</div>' +
            								'<div class="span4 planning-history-body">' +
            									'<span><h4>В производстве: ' + onWorkshopQty + ' ' + history.inputs[label].uom + '</h4></span>' +
            								'</div>' +
            							'</div>')($scope);
            			$(element).find("#history").append(tpl);
            		}
            		for(var label in history.outputs)
            		{
            			tpl = $compile( '<div class="row-fluid" id="product">' +
             								'<div class="span12 history-recipe-' + $scope.orderSuccess(history) + '" style="margin-bottom: 1em;">' +
             									'<span><h4>Запланировано ' + label + ': ' + history.outputs[label].qty + ' ' + history.outputs[label].uom + '</h4></span>' +
                                                '<h4>Дата: ' + history.date + '</h4>' +
                                                '<h4>' + history.result + '</h4>' +
            								'</div>' +
            							'</div>')($scope);
            			$(element).find("#history").append(tpl);
            		}
        			break;
        	}
        },

        template:   '<div class="history" id="history">' +
    				'</div>'
    }
}