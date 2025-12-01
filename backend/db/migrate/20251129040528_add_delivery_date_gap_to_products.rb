class AddDeliveryDateGapToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :delivery_date_gap, :integer, default: 0, null: false
    add_column :products, :preorder_delivery, :boolean, default: false, null: false
  end
end
