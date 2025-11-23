class UpdateProductsForDeliveryFields < ActiveRecord::Migration[7.1]
  def change
    remove_column :products, :availability_type, :string
    remove_column :products, :preorder_lead_time_hours, :integer
    remove_column :products, :next_available_date, :date
    remove_column :products, :max_orders_per_day, :integer

    add_column :products, :delivery_date, :datetime
    add_column :products, :delivery_time, :datetime
    add_column :products, :cross_comm_delivery, :boolean, default: false
    add_column :products, :cross_comm_charge, :integer, default: 0
  end
end
