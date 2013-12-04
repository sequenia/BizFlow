class ExtMath extends Math
  @truncate = (x, precision = 0) ->
    scales = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000]
    scale = scales[precision]
    Math.round(x * scale) / scale

# ----------------------------------------------------------------------------------------
# КОНТРОЛЛЕР ПРИЛОЖЕНИЯ ------------------------------------------------------------------
# ----------------------------------------------------------------------------------------
@IndexCtrl = ($scope, $http, $templateCache) ->
# Геттеры -------------------------------------------------
	$scope.getOutputQty = (outputNum) ->
		return $scope.order.outputs[outputNum]

	$scope.getInputQty = (inputNum) ->
		return $scope.order.inputs[inputNum]

	$scope.getItemQty = (collectionName, itemNum) ->
		switch collectionName
			when "inputs" then return $scope.getInputQty(itemNum)
			when "outputs" then	return $scope.getOutputQty(itemNum)
			else return 0

	$scope.getProductName = (item) ->
		switch $scope.recipes[$scope.order.recipeName].itemType
			when 20 then return item.productName + ' (' + item.pct + '%)'
			when 30 then return item.productName + ' (' + item.pct + '%)'
			when 40 then return item.productName
			else return item.productName

	$scope.getLeftQty = (index) ->
		return ExtMath.truncate($scope.order.recipeInputs[index].onHand - $scope.order.inputs[index])
# ---------------------------------------------------------

# Сеттеры -------------------------------------------------
	# Устанавливает начальные значения входным и выходным данным заказа
	$scope.setUpOrder = () ->
		if $scope.order.recipeName != ""
			recipeName           = $scope.order.recipeName
			inputsLength         = $scope.recipes[recipeName].inputs.length
			outputsLength        = $scope.recipes[recipeName].outputs.length
			$scope.order.inputs  = new Array(inputsLength)
			$scope.order.outputs = new Array(outputsLength)
			$scope.order.recipeInputs  = $scope.recipes[recipeName].inputs
			$scope.order.recipeOutputs = $scope.recipes[recipeName].outputs

			if inputsLength != 0
				$scope.updateInputQty(0, $scope.recipes[recipeName].inputs[0].pct)
# ---------------------------------------------------------

# Апдейтеры -----------------------------------------------
	# Вызывается при изменеии выходных данных.
	# Меняет входные и выходные данные в зависимости от изменения выходного параметра.
	$scope.updateOutputQty = (outputNum, value) ->
		sum          = 0
		outputPieces = 0
		inputPieces  = 0
		recipe       = $scope.recipes[$scope.order.recipeName]

		switch recipe.itemType
			when 20, 30 then trunc = ExtMath.truncate
			when 40 then trunc = Math.ceil

		for i in [0...recipe.inputs.length]
			inputPieces += recipe.inputs[i].pct
		for i in [0...recipe.outputs.length]
			outputPieces += recipe.outputs[i].pct

		onePiece = value / recipe.outputs[outputNum].pct

		for i in [0...$scope.order.outputs.length]
			$scope.order.outputs[i] = trunc  onePiece * recipe.outputs[i].pct, 2
			sum += $scope.order.outputs[i]

		$scope.order.outputsTotal = sum
		sum = 0

		for i in [0...$scope.order.inputs.length]
			$scope.order.inputs[i] = trunc  onePiece * recipe.inputs[i].pct, 2
			sum += $scope.order.inputs[i]
		$scope.order.inputsTotal = sum

	# Вызывается при изменеии входных данных.
	# Меняет входные и выходные данные в зависимости от изменения выходного параметра.
	$scope.updateInputQty = (inputNum, value) ->
		sum          = 0
		outputPieces = 0
		inputPieces  = 0
		recipe       = $scope.recipes[$scope.order.recipeName]

		switch recipe.itemType
			when 20, 30 then trunc = ExtMath.truncate
			when 40 then trunc = Math.ceil

		for i in [0...recipe.inputs.length]
			inputPieces += recipe.inputs[i].pct
		for i in [0...recipe.outputs.length]
			outputPieces += recipe.outputs[i].pct

		onePiece = value / recipe.inputs[inputNum].pct

		for i in [0...$scope.order.inputs.length]
			$scope.order.inputs[i] = trunc  onePiece * recipe.inputs[i].pct, 2
			sum += $scope.order.inputs[i]
			console.log $scope.order.inputs[i]

		$scope.order.inputsTotal = sum
		sum = 0

		for i in [0...$scope.order.outputs.length]
			$scope.order.outputs[i] = trunc  onePiece * recipe.outputs[i].pct, 2
			sum += $scope.order.outputs[i]
		$scope.order.outputsTotal = sum

	$scope.updateItemQty = (collectionName, itemNum, value) ->
		switch collectionName
			when "inputs" then $scope.updateInputQty(itemNum, value)
			when "outputs" then $scope.updateOutputQty(itemNum, value)
			else return 0
# ---------------------------------------------------------

# Стили ---------------------------------------------------
	$scope.inputStyle = (index) ->
		onHand   = $scope.order.recipeInputs[index].onHand
		critical = $scope.order.recipeInputs[index].critical
		qty      = $scope.order.inputs[index]
		leftPct  = 100 - qty * 100 / onHand
		if leftPct >= 0
			if onHand - qty < critical
				style = {'background-image': 'linear-gradient(0deg, #FFDDDD 0%, #FFDDDD ' + leftPct + '%, #EFEFFF ' + leftPct + '%, #EFEFFF 100%)'}
			else
				style = {'background-image': 'linear-gradient(0deg, #DADAFF 0%, #DADAFF ' + leftPct + '%, #EFEFFF ' + leftPct + '%, #EFEFFF 100%)'}
		else
			style = {'background': '#FFDDDD'}
		return style

	$scope.criticalStyle = (index) ->
		onHand   = $scope.order.recipeInputs[index].onHand
		critical = $scope.order.recipeInputs[index].critical
		if critical == 0 then style = {'opacity': '0'}
		else
			leftPct  = 100 - critical * 100 / onHand
			style    =
					'height': leftPct + '%'
		return style

	$scope.leftStyle = (index) ->
		onHand   = $scope.order.recipeInputs[index].onHand
		left     = onHand - $scope.order.inputs[index]
		leftPct  = (100 - left * 100 / onHand).limit(0, 100)
		style    = {'height': leftPct + '%'}
		return style

	$scope.inputSpanType = () ->
		return 12 / $scope.order.recipeInputs.length

	$scope.outputSpanType = () ->
		return 12 / $scope.order.recipeOutputs.length

	$scope.executeButtonDisabled = () ->
		return $scope.loading || $scope.order.recipeName == ""
# ---------------------------------------------------------

# Запросы -------------------------------------------------
	# Вызывается при оформлении заказа
	$scope.execute = () ->
		# Здесь должен отправляться запрос на сервер для оформления заказа
		sendData =
			Order:
				recipeName: $scope.order.recipeName
				totalCount: $scope.order.inputsTotal
				inputs: []
		for i in [0...$scope.order.inputs.length]
			input = 
				name: $scope.order.recipeInputs[i].productName
				count: $scope.order.inputs[i]
			sendData.Order.inputs.push input

		# Отправляем данные на сервер
		$scope.executeQuery $scope.methods.post, $scope.url, JSON.stringify(sendData), $scope.successCallback, $scope.errorCallback

	# Выплняет запрос указанного типа на сервер по указанному пути.
	# Результат содержится в $scope.data
	$scope.executeQuery = (queryMethod, queryUrl, queryData, successCallback, errorCallback) ->
		$scope.loading = true
		$http(
			method: queryMethod
			url: queryUrl
			data: queryData
			cache: $templateCache
		).success(successCallback
		).error errorCallback 
# ----------------------------------------------------

# Коллбэки -------------------------------------------
	$scope.successCallback = (data, status) ->
		console.log "Request was successful"
		$scope.status = status
		$scope.data   = data

		#alert JSON.stringify(data)

		$scope.order.date = new Date()
		if $scope.history.length == $scope.historyLength then $scope.history.splice(0, 1)
		$scope.history.push($.extend(true, {}, $scope.order))

		$scope.setUpOrder()

		# Здесь сделать выставление новых остатков
		#for name, recipe of $scope.recipes
		#	for i in [0...recipe.inputs.length]
		#		recipe.inputs[i].onHand = recipe.inputs[i].onHand / 2 #recipe.inputs[i].onHand
		#		recipe.inputs[i].critical += 30

		$scope.loading = false


	$scope.errorCallback = (data, status) ->
		console.log "Request failed"
		$scope.data   = data or "Request failed"
		$scope.status = status 

		$scope.loading = false
		# Здесь сказать - оп, заказ не удался

	$scope.initializeCallback = (data, status) ->
		console.log "Request was successful"
		$scope.data    = data
		$scope.status  = status
		$scope.recipes = $.extend(true, {}, data.Reciptes)

		# Настроить имя заказа
		if !$scope.order.recipeName
			for key, name of $scope.recipes
				$scope.order.recipeName = key
				break

		# TODO Потом убрать
		$scope.order.recipeName = ""

		# TODO Грузить с сервера
		for name, recipe of $scope.recipes
			for i in [0...recipe.inputs.length]
				recipe.inputs[i].unit = "Кг"

		# Выставляем начальные значения для текущего заказа
		$scope.setUpOrder()

		$scope.loading = false
# ----------------------------------------------------

# Собсно сам конструктор контроллера -----------------
	# Настройки для запросов
	$http.defaults.useXDomain = true
	delete $http.defaults.headers.common['X-Requested-With']
	$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

	# Начальные значения типа запроса и адреса запроса
	$scope.methods = 
		get: 'GET'
		post: 'POST'
	$scope.url = 'http://test-bmp.tk/bmp/bizflow.json?dataAreaId=strd&encoding=UTF-8'

	# Текущий заказ
	$scope.order            = {}
	$scope.history          = []
	$scope.loading          = false
	$scope.historyLength    = 5

	$scope.executeQuery $scope.methods.get, $scope.url, "", $scope.initializeCallback, $scope.errorCallback
# ----------------------------------------------------

# ----------------------------------------------------------------------------------------
# МОДУЛЬ ПРИЛОЖЕНИЯ ----------------------------------------------------------------------
# ----------------------------------------------------------------------------------------
angular.module("bizFlow", []).directive "orderSelector", ->
	template: '<div class="row-fluid mixer-body">' +
	'<h2>Операция: </h2>' +
	'<select class="order-select" ng-model="order.recipeName" ng-change="setUpOrder()">' +
	'<option ng-repeat="recipe in recipes">{{ recipe.name }}</option>' +
	'</select>' +                        
	'</div>'