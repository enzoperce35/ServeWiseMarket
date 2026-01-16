class ModifyUsersTable < ActiveRecord::Migration[8.0]
  def change
    # Remove columns
    remove_column :users, :block, :string
    remove_column :users, :lot, :string
    remove_column :users, :street, :string
    remove_column :users, :verified, :boolean
    remove_column :users, :phase, :string

    # Add new columns
    add_column :users, :address, :string
    add_column :users, :messenger_url, :string
  end
end
