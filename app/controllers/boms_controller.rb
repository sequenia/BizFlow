class BomsController < ApplicationController
  before_action :set_bom, only: [:show, :edit, :update, :destroy]

  # GET /boms
  # GET /boms.json
  def index
    @boms = Bom.all
  end

  # GET /boms/1
  # GET /boms/1.json
  def show
  end

  # GET /boms/new
  def new
    @bom = Bom.new
  end

  # GET /boms/1/edit
  def edit
  end

  # POST /boms
  # POST /boms.json
  def create
    @bom = Bom.new(bom_params)

    respond_to do |format|
      if @bom.save
        format.html { redirect_to @bom, notice: 'Bom was successfully created.' }
        format.json { render action: 'show', status: :created, location: @bom }
      else
        format.html { render action: 'new' }
        format.json { render json: @bom.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /boms/1
  # PATCH/PUT /boms/1.json
  def update
    respond_to do |format|
      if @bom.update(bom_params)
        format.html { redirect_to @bom, notice: 'Bom was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @bom.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /boms/1
  # DELETE /boms/1.json
  def destroy
    @bom.destroy
    respond_to do |format|
      format.html { redirect_to boms_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_bom
      @bom = Bom.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def bom_params
      params.require(:bom).permit(:name)
    end
end
