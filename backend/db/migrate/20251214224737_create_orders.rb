class CreateOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.references :shop, null: false, foreign_key: true
    
      t.string  :status, default: "pending", null: false
      # pending, confirmed, preparing, out_for_delivery, completed, cancelled
    
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.datetime :delivery_date
      t.string  :delivery_time
    
      t.boolean :cross_comm_delivery, default: false
      t.integer :cross_comm_charge, default: 0
    
      t.timestamps
    end
  end
end
