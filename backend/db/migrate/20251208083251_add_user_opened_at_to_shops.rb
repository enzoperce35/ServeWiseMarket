class AddUserOpenedAtToShops < ActiveRecord::Migration[8.0]
  def change
    add_column :shops, :user_opened_at, :datetime
  end
end
