class CreateCarts < ActiveRecord::Migration[8.0]
  create_table :carts do |t|
    t.references :user, null: false, foreign_key: true
    t.string :status, default: "active" # active, checked_out
    t.timestamps
  end
end
