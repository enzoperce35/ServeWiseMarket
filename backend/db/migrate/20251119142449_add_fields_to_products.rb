class AddFieldsToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :availability_type, :string
    add_column :products, :preorder_lead_time_hours, :integer
    add_column :products, :next_available_date, :date
    add_column :products, :max_orders_per_day, :integer
    add_column :products, :status, :string
    add_column :products, :featured, :boolean
  end
end
