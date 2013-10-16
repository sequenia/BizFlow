class CreateBoms < ActiveRecord::Migration
  def change
    create_table :boms do |t|
      t.string :name

      t.timestamps
    end
  end
end
