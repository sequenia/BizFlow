class ExtMath extends Math
  @truncate = (x, precision = 0) ->
    scales = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000]
    scale = scales[precision]
    Math.round(x * scale) / scale

@IndexCtrl = ($scope) ->
	$scope.updateOutputQty = (outputNum, value) ->
		sum = 0
		current = $scope.currentOrder
		onePct = value / $scope.orders[current].outputs[outputNum].pct
		for i in [0...$scope.orders[current].outputs.length]
			$scope.orders[current].outputs[i].qty = ExtMath.truncate onePct * $scope.orders[current].outputs[i].pct,2
			sum += $scope.orders[current].outputs[i].qty
		$scope.orders[current].outputsTotal = sum
		onePct = sum / 100
		for i in [0...$scope.orders[current].inputs.length]
			$scope.orders[current].inputs[i].qty = ExtMath.truncate (onePct * $scope.orders[current].inputs[i].pct),2
		$scope.orders[current].inputsTotal = sum

	$scope.updateInputQty = (inputNum, value) ->
		sum = 0
		current = $scope.currentOrder
		onePct = value / $scope.orders[current].inputs[inputNum].pct
		for i in [0...$scope.orders[current].inputs.length]
			$scope.orders[current].inputs[i].qty = ExtMath.truncate  onePct * $scope.orders[current].inputs[i].pct, 2
			sum += $scope.orders[current].inputs[i].qty
		$scope.orders[current].inputsTotal = sum
		onePct = sum / 100
		for i in [0...$scope.orders[current].outputs.length]
			$scope.orders[current].outputs[i].qty = ExtMath.truncate  onePct * $scope.orders[current].outputs[i].pct, 2
		$scope.orders[current].outputsTotal = sum

	$scope.getOutputQty = (outputNum) ->
		return $scope.orders[$scope.currentOrder].outputs[outputNum].qty

	$scope.getInputQty = (inputNum) ->
		return $scope.orders[$scope.currentOrder].inputs[inputNum].qty

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

	$scope.orders = 
		'Замес теста':
				inputs: [{productName: "Мука", qty:10, pct:50, onHand:1000},
						{productName: "Вода", qty:10, pct:50, onHand:1000}],
				outputs:[{productName: "Тесто", qty:10, pct:100, onHand:1000}],
				inputsTotal: 0,
				outputsTotal: 0,
				name: 'Замес теста'
		'Просев гипса':
				inputs: [{productName: "Гипс Казань", qty:10, pct:10, onHand:1000},
						{productName: "Гипс Сибирь", qty:20, pct:20, onHand:1000},
						{productName: "Гипс Майкоп", qty:30, pct:50, onHand:1000}],
				outputs:[{productName: "Гипс Очищенный-1", qty:10, pct:40, onHand:1000},
						{productName: "Гипс Очищенный-2", qty:60, pct:60, onHand:1000}],
				inputsTotal: 0,
				outputsTotal: 0,
				name: 'Просев гипса'

	for key of $scope.orders
		$scope.currentOrder = key
		if $scope.orders[key].inputs.length != 0
			$scope.updateInputQty(0, $scope.orders[key].inputs[0].pct)

