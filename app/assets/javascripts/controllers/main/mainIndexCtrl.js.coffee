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

	$scope.getProductName = (productName, pct, itemType) ->
		switch itemType
			when 20 then return productName + ' (' + pct + '%)'
			when 30 then return productName + ' (' + pct + '%)'
			when 40 then return productName
			else return productName
# ---------------------------------------------------------

# Сеттеры -------------------------------------------------
	# Устанавливает начальные значения входным и выходным данным заказа
	$scope.setUpOrder = () ->
		recipeName           = $scope.order.recipeName
		inputsLength         = $scope.recipes[recipeName].inputs.length
		outputsLength        = $scope.recipes[recipeName].outputs.length
		$scope.order.inputs  = new Array(inputsLength)
		$scope.order.outputs = new Array(outputsLength)

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
		onHand   = $scope.recipes[$scope.order.recipeName].inputs[index].onHand
		critical = $scope.recipes[$scope.order.recipeName].inputs[index].critical
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
		onHand   = $scope.recipes[$scope.order.recipeName].inputs[index].onHand
		critical = $scope.recipes[$scope.order.recipeName].inputs[index].critical
		leftPct  = 100 - critical * 100 / onHand
		style    =
				'height': leftPct + '%'
		return style

	$scope.inputSpanType = () ->
		return 12 / $scope.recipes[$scope.order.recipeName].inputs.length

	$scope.outputSpanType = () ->
		return 12 / $scope.recipes[$scope.order.recipeName].outputs.length
# ---------------------------------------------------------

# Запросы -------------------------------------------------
	# Вызывается при оформлении заказа
	$scope.execute = () ->
		if $scope.order.recipeName != ""
			# Здесь должен отправляться запрос на сервер для оформления заказа
			sendData =
				recipeName: $scope.order.recipeName
				totalCount: $scope.order.inputsTotal
				inputs: []
			for i in [0...$scope.order.inputs.length]
				input = 
					productName: $scope.recipes[$scope.order.recipeName].inputs[i].productName
					qount: $scope.order.inputs[i]
				sendData.inputs.push input

			# Отправляем данные на сервер
			$scope.executeQuery $scope.methods.get, $scope.url, JSON.stringify(sendData), $scope.successCallback, $scope.errorCallback

	# Выплняет запрос указанного типа на сервер по указанному пути.
	# Результат содержится в $scope.data
	$scope.executeQuery = (queryMethod, queryUrl, queryData, successCallback, errorCallback) ->
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

		$scope.order.date = new Date()
		$scope.history.push($.extend(true, {}, $scope.order))

		$scope.setUpOrder()

		# Здесь сделать выставление новых остатков
		for name, recipe of data.Reciptes
			for i in [0...recipe.inputs.length]
				$scope.recipes[name].inputs[i].onHand = $scope.recipes[name].inputs[i].onHand / 2 #recipe.inputs[i].onHand


	$scope.errorCallback = (data, status) ->
		console.log "Request failed"
		$scope.data   = data or "Request failed"
		$scope.status = status 

		# Здесь сказать - оп, заказ не удался

	$scope.initializeCallback = (data, status) ->
		console.log "Request was successful"
		$scope.data    = data
		$scope.status  = status
		$scope.recipes = $.extend(true, {}, data.Reciptes)

		$scope.recipes[""] = 
			inputs: []
			outputs: []
			name: ""

		# Выставляем начальные значения для текущего заказа
		$scope.setUpOrder()
# ----------------------------------------------------

# Собсно сам конструктор контроллера --------------------------------------------------------------
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
	$scope.order.recipeName = ""

	$scope.executeQuery $scope.methods.get, $scope.url, "", $scope.initializeCallback, $scope.errorCallback
# ------------------------------------------------------------------------------------------------
