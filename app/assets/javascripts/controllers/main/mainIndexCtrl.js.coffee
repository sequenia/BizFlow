class ExtMath extends Math
  @truncate = (x, precision = 0) ->
    scales = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000]
    scale = scales[precision]
    Math.round(x * scale) / scale

# Модуль приложения
myApp = angular.module('myApp', [])
myApp.config ($httpProvider) ->
	$httpProvider.defaults.useXDomain = true
	delete $httpProvider.defaults.headers.common['X-Requested-With']

# Контроллер приложения
@IndexCtrl = ($scope, $http, $templateCache) ->
	# Вызывается при изменеии выходных данных.
	# Меняет входные и выходные данные в зависимости от изменения выходного параметра.
	$scope.updateOutputQty = (outputNum, value) ->
		sum = 0
		recipeName = $scope.order.recipeName
		onePct = value / $scope.recipes[recipeName].outputs[outputNum].pct
		for i in [0...$scope.order.outputs.length]
			$scope.order.outputs[i] = ExtMath.truncate  onePct * $scope.recipes[recipeName].outputs[i].pct, 2
			sum += $scope.order.outputs[i]
		$scope.order.outputsTotal = sum
		onePct = sum / 100
		for i in [0...$scope.order.inputs.length]
			$scope.order.inputs[i] = ExtMath.truncate  onePct * $scope.recipes[recipeName].inputs[i].pct, 2
		$scope.order.inputsTotal = sum

	# Вызывается при изменеии входных данных.
	# Меняет входные и выходные данные в зависимости от изменения выходного параметра.
	$scope.updateInputQty = (inputNum, value) ->
		sum = 0
		recipeName = $scope.order.recipeName
		onePct = value / $scope.recipes[recipeName].inputs[inputNum].pct
		for i in [0...$scope.order.inputs.length]
			$scope.order.inputs[i] = ExtMath.truncate  onePct * $scope.recipes[recipeName].inputs[i].pct, 2
			sum += $scope.order.inputs[i]
		$scope.order.inputsTotal = sum
		onePct = sum / 100
		for i in [0...$scope.order.outputs.length]
			$scope.order.outputs[i] = ExtMath.truncate  onePct * $scope.recipes[recipeName].outputs[i].pct, 2
		$scope.order.outputsTotal = sum

	$scope.getOutputQty = (outputNum) ->
		return $scope.order.outputs[outputNum]

	$scope.getInputQty = (inputNum) ->
		return $scope.order.inputs[inputNum]

	$scope.getItemQty = (collectionName, itemNum) ->
		switch collectionName
			when "inputs" then return $scope.getInputQty(itemNum)
			when "outputs" then	return $scope.getOutputQty(itemNum)
			else return 0

	$scope.updateItemQty = (collectionName, itemNum, value) ->
		switch collectionName
			when "inputs" then $scope.updateInputQty(itemNum, value)
			when "outputs" then $scope.updateOutputQty(itemNum, value)
			else return 0

	$scope.inputSpanType = () ->
		return 12 / $scope.recipes[$scope.order.recipeName].inputs.length

	$scope.outputSpanType = () ->
		return 12 / $scope.recipes[$scope.order.recipeName].outputs.length

	# Устанавливает начальные значения входным и выходным данным заказа
	$scope.setUpOrder = () ->
		recipeName = $scope.order.recipeName
		inputsLength = $scope.recipes[recipeName].inputs.length
		outputsLength = $scope.recipes[recipeName].outputs.length
		$scope.order.inputs = new Array(inputsLength)
		$scope.order.outputs = new Array(outputsLength)

		if inputsLength != 0
			$scope.updateInputQty(0, $scope.recipes[recipeName].inputs[0].pct)

	# Вызывается при оформлении заказа
	$scope.execute = () ->
		if $scope.order.recipeName != ""
			if $scope.order.length != 0
				$scope.history.push($.extend(true, {}, $scope.order))
			$scope.setUpOrder()
			# Здесь должен отправляться запрос на сервер для оформления заказа

	# Выплняет запрос указанного типа на сервер по указанному пути.
	# Результат содержится в $scope.data
	$scope.executeQuery = (queryMethod, queryUrl, successCallback, errorCallback) ->
		$http(
			method: $scope.method
			url: $scope.url
			cache: $templateCache
		).success(successCallback
		).error errorCallback 

	# Коллбэки -------------------------------------------
	$scope.successCallback = (data, status) ->
		$scope.status = status
		$scope.data = data

	$scope.errorCallback = (data, status) ->
		$scope.data = data or "Request failed"
		$scope.status = status 

	$scope.initializeCallback = (data, status) ->
		$scope.data = data
		$scope.recipes = data
		$scope.status = status

		# Выставляем начальные значения для текущего заказа
		for key of $scope.recipes
			$scope.order.recipeName = $scope.recipes[key].name
			$scope.setUpOrder()
			break
	# ----------------------------------------------------

# Собсно сам конструктор контроллера --------------------------------------------------------------
	# Настройки для запросов
	$http.defaults.useXDomain = true
	delete $http.defaults.headers.common['X-Requested-With']

	# Начальные значения типа запроса и адреса запроса
	$scope.method = 'GET'
	#$scope.url = 'http://test-bmp.tk/bmp/bizflow.json?dataAreaId=strd&encoding=CP1251'
	$scope.url = 'http://www.json-generator.com/j/bTDfXqTdaq?indent=4';

	# Текущий заказ
	$scope.order = {}
	# История заказов
	$scope.history = []

	$scope.executeQuery $scope.method, $scope.url, $scope.initializeCallback, $scope.errorCallback
# ------------------------------------------------------------------------------------------------
