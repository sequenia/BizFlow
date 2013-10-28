class ExtMath extends Math
  @truncate = (x, precision = 0) ->
    scales = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000]
    scale = scales[precision]
    Math.round(x * scale) / scale

@IndexCtrl = ($scope) ->
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

	$scope.setUpOrder = () ->
		recipeName = $scope.order.recipeName
		inputsLength = $scope.recipes[recipeName].inputs.length
		outputsLength = $scope.recipes[recipeName].outputs.length
		$scope.order.inputs = new Array(inputsLength)
		$scope.order.outputs = new Array(outputsLength)

		if inputsLength != 0
			$scope.updateInputQty(0, $scope.recipes[recipeName].inputs[0].pct)

	$scope.recipes = 
		'Замес теста':
				inputs: [{productName: "Мука", pct:50, onHand:1000},
						{productName: "Вода", pct:50, onHand:1000}],
				outputs:[{productName: "Тесто", pct:100, onHand:1000}],
				name: 'Замес теста'
		'Просев гипса':
				inputs: [{productName: "Гипс Казань", pct:10, onHand:1000},
						{productName: "Гипс Сибирь", pct:40, onHand:1000},
						{productName: "Гипс Майкоп", pct:50, onHand:1000}],
				outputs:[{productName: "Гипс Очищенный-1", pct:40, onHand:1000},
						{productName: "Гипс Очищенный-2", pct:60, onHand:1000}],
				name: 'Просев гипса'

	$scope.order = {}

	for key of $scope.recipes
		$scope.order.recipeName = $scope.recipes[key].name
		$scope.setUpOrder()
		break
