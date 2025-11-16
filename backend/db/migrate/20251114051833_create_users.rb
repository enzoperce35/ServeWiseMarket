# db/migrate/20251116_create_users.rb
class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :contact_number, null: false, unique: true
      t.string :password_digest, null: false
      t.string :role, null: false
      t.integer :district, null: false, default: 0
      t.integer :subphase, null: false, default: 0
      t.string :block, null: false
      t.string :lot, null: false
      t.string :street, null: false
      t.boolean :verified, default: false

      t.timestamps
    end

    add_index :users, :contact_number, unique: true
  end
end
