class CreateProductVariants < ActiveRecord::Migration[8.0]
  def change
    create_table :product_variants do |t|
      t.references :product, null: false, foreign_key: true

      t.string :name, null: false
      t.decimal :price, precision: 10, scale: 2, null: false

      t.boolean :active, default: true, null: false

      t.timestamps
    end
  end
end
