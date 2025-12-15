class CartItemsController < ApplicationController
  before_action :authenticate_user

  def create
    cart = current_cart
    item = cart.cart_items.find_by(product_id: params[:product_id])

    if item
      item.increment!(:quantity)
    else
      cart.cart_items.create!(
        product_id: params[:product_id],
        quantity: 1
      )
    end

    redirect_to cart_path, notice: "Product added to cart"
  end
end
