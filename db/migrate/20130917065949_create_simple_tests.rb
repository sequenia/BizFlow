class CreateSimpleTests < ActiveRecord::Migration
  def change
    create_table :simple_tests do |t|

      t.timestamps
    end
  end
end
