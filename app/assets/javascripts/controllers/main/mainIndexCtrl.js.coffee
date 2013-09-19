@IndexCtrl = ($scope) ->
	$scope.productionOrder = 
		inputs: [{productName: "Гипс Казань", qty:15}, {productName: "Гипс Майкоп", qty:19}],
		outputs:[{productName: "ГО-1", qty:33}, {productName: "ГО-2", qty:132}]

	$scope.updateOutputQty = (outputNum, value) ->	
		$scope.productionOrder.outputs[outputNum].qty = value


	$scope.mouseDown = (event, inp) ->
		console.log("mousedown");
		inp.qty+=1;




