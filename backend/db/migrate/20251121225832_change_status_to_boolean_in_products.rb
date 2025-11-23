class ChangeStatusToBooleanInProducts < ActiveRecord::Migration[7.1]
  def up
    # Add temporary boolean column
    add_column :products, :status_temp, :boolean, default: false, null: false

    # Map existing string values to boolean
    Product.reset_column_information
    Product.find_each do |p|
      p.update_column(:status_temp, p.status == "active")
    end

    # Remove old column and rename temp
    remove_column :products, :status
    rename_column :products, :status_temp, :status
  end

  def down
    add_column :products, :status, :string, default: "draft", null: false
    Product.reset_column_information
    Product.find_each do |p|
      p.update_column(:status, p.status ? "active" : "draft")
    end
    remove_column :products, :status_temp if column_exists?(:products, :status_temp)
  end
end
