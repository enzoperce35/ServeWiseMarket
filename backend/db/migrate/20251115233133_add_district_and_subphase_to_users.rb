class AddDistrictAndSubphaseToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :district, :string
    add_column :users, :subphase, :string
  end
end
