class AddDeliveryTimesToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :delivery_times, :jsonb, default: [], null: false
    add_index  :products, :delivery_times, using: :gin
  end
end
