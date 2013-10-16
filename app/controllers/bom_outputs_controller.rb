class BomOutputsController < ApplicationController
  before_action :set_bom_output, only: [:show, :edit, :update, :destroy]

  # GET /bom_outputs
  # GET /bom_outputs.json
  def index
    @bom_outputs = BomOutput.all
  end

  # GET /bom_outputs/1
  # GET /bom_outputs/1.json
  def show
  end

  # GET /bom_outputs/new
  def new
    @bom_output = BomOutput.new
  end

  # GET /bom_outputs/1/edit
  def edit
  end

  # POST /bom_outputs
  # POST /bom_outputs.json
  def create
    @bom_output = BomOutput.new(bom_output_params)

    respond_to do |format|
      if @bom_output.save
        format.html { redirect_to @bom_output, notice: 'Bom output was successfully created.' }
        format.json { render action: 'show', status: :created, location: @bom_output }
      else
        format.html { render action: 'new' }
        format.json { render json: @bom_output.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /bom_outputs/1
  # PATCH/PUT /bom_outputs/1.json
  def update
    respond_to do |format|
      if @bom_output.update(bom_output_params)
        format.html { redirect_to @bom_output, notice: 'Bom output was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @bom_output.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /bom_outputs/1
  # DELETE /bom_outputs/1.json
  def destroy
    @bom_output.destroy
    respond_to do |format|
      format.html { redirect_to bom_outputs_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_bom_output
      @bom_output = BomOutput.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def bom_output_params
      params.require(:bom_output).permit(:item_id, :qty)
    end
end
