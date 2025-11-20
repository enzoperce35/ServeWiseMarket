class MakeShopIdNotNullOnProducts < ActiveRecord::Migration[8.0]
  def change
    change_column_null :products, :shop_id, false
  end
end
