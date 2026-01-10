class AddDeliveryGroupIdToCartItems < ActiveRecord::Migration[8.0]
  def change
    add_column :cart_items, :delivery_group_id, :bigint
    add_index :cart_items, :delivery_group_id
  end
end
