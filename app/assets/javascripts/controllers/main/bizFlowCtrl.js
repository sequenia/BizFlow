var app = angular.module("bizflow", []);

var bizFlowCtrl = function($scope, $http, $templateCache)
{
	$http.defaults.useXDomain = true;
    delete $http.defaults.headers.common['X-Requested-With'];
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $scope.methods  = 
    {
        get:  'GET',
        post: 'POST'
    };
    $scope.url        = 'http://test-bmp.tk/bmp/bizflow.json?dataAreaId=strd&encoding=UTF-8'; 
    $scope.loading    = true;
	$scope.cylinder   = new CylinderItems();
	$scope.history    = [];
	$scope.recipeName = '';
	$scope.recipes; //= {"Шпатлевка":{"inputs":[{"critical":0,"pct":4.8,"UOM":"кг","onHand":432,"productName":"Мрам - 100"},{"critical":0,"pct":15.4,"UOM":"кг","onHand":1386,"productName":"Химик - 3М"},{"critical":0,"pct":15.9,"UOM":"кг","onHand":1431,"productName":"Загуститель ВС"},{"critical":800,"pct":63.9,"UOM":"кг","onHand":1141,"productName":"ГО-1"}],"itemType":30,"name":"Шпатлевка","outputs":[{"pct":100,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"}],"productionLocation":"Цех"},"Шпат-20кг":{"inputs":[{"critical":0,"pct":1,"UOM":"шт","onHand":100,"productName":"Мешок 20кг"},{"critical":0,"pct":20,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"}],"itemType":40,"name":"Шпат-20кг","outputs":[{"pct":1,"UOM":"шт","onHand":0,"productName":"Шпат-20кг"}],"productionLocation":"Цех"},"Просев":{"inputs":[{"critical":0,"pct":80,"UOM":"кг","onHand":800,"productName":"Гипс К"},{"critical":8000,"pct":20,"UOM":"кг","onHand":450,"productName":"Вяж. 1"}],"itemType":20,"name":"Просев","outputs":[{"pct":9,"UOM":"шт","productName":"ГО-2","onHand":220},{"pct":91,"UOM":"шт","productName":"ГО-1","onHand":1141}],"productionLocation":"Цех"},"Шпат-25кг":{"inputs":[{"critical":0,"pct":25,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"},{"critical":0,"pct":1,"UOM":"шт","onHand":100,"productName":"Мешок 25кг"}],"itemType":40,"name":"Шпат-25кг","outputs":[{"pct":1,"UOM":"шт","onHand":0,"productName":"Шпат-25кг"}],"productionLocation":"Цех"},"Шпат-10кг":{"inputs":[{"critical":0,"pct":10,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"},{"critical":0,"pct":1,"UOM":"шт","onHand":100,"productName":"Мешок 10кг"}],"itemType":40,"name":"Шпат-10кг","outputs":[{"pct":1,"UOM":"шт","onHand":0,"productName":"Шпат-10кг"}],"productionLocation":"Цех"},"Шпат-5кг":{"inputs":[{"critical":0,"pct":1,"UOM":"шт","onHand":100,"productName":"Мешок 5кг"},{"critical":0,"pct":5,"UOM":"кг","onHand":1000,"productName":"Шпатлевка"}],"itemType":40,"name":"Шпат-5кг","outputs":[{"pct":1,"UOM":"шт","onHand":0,"productName":"Шпат-5кг"}],"productionLocation":"Цех"}};

	init();

	function init()
	{
		executeQuery($scope.methods.get, $scope.url, "", initializeCallback, errorCallback);
	}

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

    function initializeCallback(data, status)
    {
        console.log("Request was successful");
        $scope.recipes = $.extend(true, {}, data.Reciptes)

        for(var key in $scope.recipes)
		{
			$scope.recipeName = key;
			break;
		}

        $scope.loading = false;
    }

    function successCallback(data, status)
    {
    	console.log("Request was successful");
        var old = 
		{
			'inputs':     $.extend(true, {}, $scope.cylinder.inputs),
			'outputs':    $.extend(true, {}, $scope.cylinder.outputs),
			'recipeName': $scope.recipeName,
			'date':       (new Date()).toLocaleString()
		};

		$scope.history.push(old);

        // Здесь сделать выставление новых остатков

        $scope.loading = false;

		$('html, body').animate({
		    scrollTop: $("#inputs").offset().top
		}, "slow");
    }

	$scope.getInputName = function(input)
	{
		if($scope.recipes[$scope.recipeName].itemType == 40) 
		{
			return input.productName;
		}
		else
		{
			return input.productName + ' (' + input.pct + '%)'
		}
	};

	$scope.getOutputName = function(output)
	{
		if($scope.recipes[$scope.recipeName].itemType == 40) 
		{
			return output.productName;
		}
		else
		{
			return output.productName + ' (' + output.pct + '%)'
		}
	};

	$scope.execute = function()
	{
        var sendData =
        {
            Order:
            {
                recipeName: $scope.recipeName,
                totalCount: 0
            }
        };

        for(var key in $scope.cylinder.outputs)
        {
        	sendData.Order.totalCount += $scope.cylinder.outputs[key].qty;
        }

        executeQuery($scope.methods.post, $scope.url, JSON.stringify(sendData), successCallback, errorCallback);
	};

	$scope.inputSpanType = function()
	{
		var type = Math.ceil(12 / $scope.recipes[$scope.recipeName].inputs.length);
		if(type < 3) type = 3;
		return type; 
	};

	$scope.outputSpanType = function()
	{
		var type = Math.ceil(12 / $scope.recipes[$scope.recipeName].outputs.length);
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

	$scope.changeRounding = function()
	{
		if($scope.recipes[$scope.recipeName].itemType == 40)
		{
			$scope.cylinder.setRounding('up');
		}
		else
		{
			$scope.cylinder.setRounding('none');
		}
	};
};

app.controller("bizFlowCtrl", bizFlowCtrl);

app.directive('cylinder', CylinderDirective);