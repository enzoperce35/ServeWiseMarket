class AddVariantIdToCartItems < ActiveRecord::Migration[8.0]
  def change
    add_column :cart_items, :variant_id, :integer
    add_index :cart_items, :variant_id
  end
end
