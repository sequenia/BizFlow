require 'test_helper'

class BomOutputsControllerTest < ActionController::TestCase
  setup do
    @bom_output = bom_outputs(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:bom_outputs)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create bom_output" do
    assert_difference('BomOutput.count') do
      post :create, bom_output: { item_id: @bom_output.item_id, qty: @bom_output.qty }
    end

    assert_redirected_to bom_output_path(assigns(:bom_output))
  end

  test "should show bom_output" do
    get :show, id: @bom_output
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @bom_output
    assert_response :success
  end

  test "should update bom_output" do
    patch :update, id: @bom_output, bom_output: { item_id: @bom_output.item_id, qty: @bom_output.qty }
    assert_redirected_to bom_output_path(assigns(:bom_output))
  end

  test "should destroy bom_output" do
    assert_difference('BomOutput.count', -1) do
      delete :destroy, id: @bom_output
    end

    assert_redirected_to bom_outputs_path
  end
end
