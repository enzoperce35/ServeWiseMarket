class AddActiveToProductDeliveryGroups < ActiveRecord::Migration[8.0]
  def change
    add_column :product_delivery_groups, :active, :boolean, default: true, null: false
  end
end
