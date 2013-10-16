class CreateBomOutputs < ActiveRecord::Migration
  def change
    create_table :bom_outputs do |t|
      t.references :item, index: true
      t.float :qty

      t.timestamps
    end
  end
end
