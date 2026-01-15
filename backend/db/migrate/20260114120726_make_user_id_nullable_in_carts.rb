class MakeUserIdNullableInCarts < ActiveRecord::Migration[8.0]
  def change
    # allow carts.user_id to be null
    change_column_null :carts, :user_id, true
  end
end
