class AddDefaultToCrossCommDeliveryOnProducts < ActiveRecord::Migration[8.0]
  def change
    change_column_default :products, :cross_comm_delivery, false
  end  
end
