class UpdateDistrictAndSubphaseInUsers < ActiveRecord::Migration[7.1]
  def change
    # Rename columns
    rename_column :users, :district, :community
    rename_column :users, :subphase, :phase

    # Change datatype to string with default ''
    change_column :users, :community, :string, default: '', null: false
    change_column :users, :phase, :string, default: '', null: false
  end
end
