class AddOpenToShops < ActiveRecord::Migration[8.0]
  def change
    add_column :shops, :open, :boolean, default: true, null: false
  end
end
