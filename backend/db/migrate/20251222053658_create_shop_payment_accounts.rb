class CreateShopPaymentAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :shop_payment_accounts do |t|
      t.bigint :shop_id, null: false

      t.string :provider, null: false
      # "gcash", "maya", "bank"

      t.string :account_name, null: false
      t.string :account_number, null: false
      t.string :notes
      # optional: "Send exact amount please"

      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :shop_payment_accounts, :shop_id
    add_foreign_key :shop_payment_accounts, :shops
  end
end
