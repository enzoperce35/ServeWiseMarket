# app/models/shop_payment_account.rb
class ShopPaymentAccount < ApplicationRecord
  belongs_to :shop

  validates :provider, :account_name, :account_number, presence: true
end
