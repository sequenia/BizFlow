class BizFlowController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def home
    @back = get_background

    @host = params[:host] || 'http://test-bmp.tk/'
  	# Если сессия уже существует
  	#if (session[:user_id] && session[:random_number] && cookies[:crypto_id])
  		# Если сессия валидна
  		#if (cookies[:crypto_id].to_i / session[:random_number].to_i == session[:user_id].to_i && 
        #session[:last_seen] > 10.minutes.ago)
  			#session[:random_number] = rand(1..100000)
        #session[:last_seen] = Time.now
  			#cookies[:crypto_id] = session[:user_id] * session[:random_number]
  		#else
  			#cookies.delete :crypto_id
  			#reset_session 
  			#redirect_to "http://cn.ru/"
  		#end
    # Если сессии не было
  	#else
  		#@login = params[:login]
  		#if @login
  			#session[:user_id] = rand(1..100000)
  			#session[:random_number] = rand(1..100000)
        #session[:last_seen] = Time.now
  			#cookies[:crypto_id] = session[:user_id] * session[:random_number]
        #puts "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!POPKA"
        #puts @login
  		#else
  			#cookies.delete :crypto_id
  			#reset_session
        #puts "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!PISKA"
        #puts @login
  			#redirect_to "http://test-bmp.tk/"
  		#end
  	#end
  end

  def set_background
    @back = params[:back]
    if @back
      cookies[:back] = @back
    end

    respond_to do |format|
      format.js { }
    end
  end

  def get_background
    if cookies[:back]
      return cookies[:back]
    else
      return "black"
    end
  end
end
