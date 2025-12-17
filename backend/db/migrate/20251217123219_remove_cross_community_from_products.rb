class RemoveCrossCommunityFromProducts < ActiveRecord::Migration[8.0]
  def change
    remove_column :products, :cross_comm_delivery, :boolean
    remove_column :products, :cross_comm_charge, :integer
  end
end
