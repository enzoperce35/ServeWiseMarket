class CreateProductDeliveryGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :product_delivery_groups do |t|
      t.references :product, null: false, foreign_key: true
      t.references :delivery_group, null: false, foreign_key: true

      t.timestamps
    end

    add_index :product_delivery_groups,
              [:product_id, :delivery_group_id],
              unique: true,
              name: "index_product_delivery_groups_unique"
  end
end
