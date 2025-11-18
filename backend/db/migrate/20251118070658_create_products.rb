class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :price, null: false, precision: 10, scale: 2, default: 0.0
      t.integer :stock, null: false, default: 0
      t.string :category
      t.string :image_url
      t.references :seller, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
