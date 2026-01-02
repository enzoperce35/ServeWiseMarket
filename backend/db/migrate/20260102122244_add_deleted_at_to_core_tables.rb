class AddDeletedAtToCoreTables < ActiveRecord::Migration[7.0]
  def change
    add_column :products, :deleted_at, :datetime unless column_exists?(:products, :deleted_at)
    add_column :orders, :deleted_at, :datetime unless column_exists?(:orders, :deleted_at)
    add_column :shops, :deleted_at, :datetime unless column_exists?(:shops, :deleted_at)

    add_index :products, :deleted_at unless index_exists?(:products, :deleted_at)
  end
end
