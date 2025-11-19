class CreateShops < ActiveRecord::Migration[7.1]
  def change
    create_table :shops do |t|
      t.string :name, null: false
      t.text :description
      t.string :status, null: false, default: "closed"   # shop open or closed
      t.string :image_url                              # shop banner/profile pic
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
