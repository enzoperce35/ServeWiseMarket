class RemoveSellerIdFromProducts < ActiveRecord::Migration[8.0]
  def change
    remove_column :products, :seller_id, :integer
  end
end
