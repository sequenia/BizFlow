@IndexCtrl = ($scope) ->
	$scope.updateOutputQty = (outputNum, value) ->
		sum = 0
		current = $scope.currentOrder
		onePct = value / $scope.orders[current].outputs[outputNum].pct
		for i in [0...$scope.orders[current].outputs.length]
			$scope.orders[current].outputs[i].qty = onePct * $scope.orders[current].outputs[i].pct
			sum += $scope.orders[current].outputs[i].qty
		$scope.orders[current].outputsTotal = sum
		onePct = sum / 100
		for i in [0...$scope.orders[current].inputs.length]
			$scope.orders[current].inputs[i].qty = onePct * $scope.orders[current].inputs[i].pct
		$scope.orders[current].inputsTotal = sum

	$scope.updateInputQty = (inputNum, value) ->
		sum = 0
		current = $scope.currentOrder
		onePct = value / $scope.orders[current].inputs[inputNum].pct
		for i in [0...$scope.orders[current].inputs.length]
			$scope.orders[current].inputs[i].qty = onePct * $scope.orders[current].inputs[i].pct
			sum += $scope.orders[current].inputs[i].qty
		$scope.orders[current].inputsTotal = sum
		onePct = sum / 100
		for i in [0...$scope.orders[current].outputs.length]
			$scope.orders[current].outputs[i].qty = onePct * $scope.orders[current].outputs[i].pct
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
		'Тесто':
				inputs: [{productName: "Мука", qty:10, pct:100, onHand:1000},
						{productName: "Вода", qty:10, pct:100, onHand:1000}],
				outputs:[{productName: "Тесто", qty:10, pct:100, onHand:1000}],
				inputsTotal: 0,
				outputsTotal: 0,
				name: 'Тесто'
		'Смеситель':
				inputs: [{productName: "Гипс Казань", qty:10, pct:10, onHand:1000},
						{productName: "Гипс Новосибирск", qty:20, pct:20, onHand:1000},
						{productName: "Гипс Майкоп", qty:30, pct:50, onHand:1000}],
				outputs:[{productName: "ГО-1", qty:10, pct:40, onHand:1000},
						{productName: "ГО-2", qty:60, pct:60, onHand:1000}],
				inputsTotal: 0,
				outputsTotal: 0,
				name: 'Смеситель'

	for key of $scope.orders
		$scope.currentOrder = key
		if $scope.orders[key].inputs.length != 0
			$scope.updateInputQty(0, $scope.orders[key].inputs[0].pct)

