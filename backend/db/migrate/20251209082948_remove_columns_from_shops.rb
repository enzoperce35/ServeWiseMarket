class RemoveColumnsFromShops < ActiveRecord::Migration[8.0]
  def change
    remove_column :shops, :last_auto_close_date, :date
    remove_column :shops, :opened_at, :datetime
    remove_column :shops, :status, :string
  end
end
