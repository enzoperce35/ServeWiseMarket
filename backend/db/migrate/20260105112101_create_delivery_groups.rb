class CreateDeliveryGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :delivery_groups do |t|
      t.string  :name,   null: false
      t.boolean :active, null: false, default: true

      # Hour-based PH delivery slot
      # -1 = Now
      #  0–23 = PH hour
      t.integer :ph_timestamp, null: false

      t.timestamps
    end

    add_index :delivery_groups, :active
    add_index :delivery_groups, :ph_timestamp
  end
end
