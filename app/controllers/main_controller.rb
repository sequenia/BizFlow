class MainController < ApplicationController
	http_basic_authenticate_with name: "skala", password: "skala"
	
	def index
	end
end
