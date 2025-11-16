class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :name
      t.string :contact_number
      t.string :password_digest
      t.string :role
      t.string :block
      t.string :lot
      t.string :street
      t.boolean :verified

      t.timestamps
    end
  end
end
