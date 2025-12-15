module Api
  module V1
    class CartItemsController < ApplicationController
      before_action :authenticate_user

      # Add or increase quantity
      def create
        cart = current_user.cart || current_user.create_cart!
        product = Product.find_by(id: params[:product_id])

        unless product
          render json: { error: "Product not found" }, status: :not_found and return
        end

        quantity = params[:quantity].to_i.nonzero? || 1
        item = cart.cart_items.find_or_initialize_by(product: product)
        item.quantity += quantity
        item.unit_price = product.price

        if item.save
          render json: { message: "#{product.name} added to cart", cart_item_id: item.id }, status: :ok
        else
          render json: { error: item.errors.full_messages.join(", ") }, status: :unprocessable_entity
        end
      end

      # Update quantity
      def update
        item = CartItem.find(params[:id])
        if params[:quantity].to_i <= 0
          item.destroy
          render json: { message: "Item removed from cart" }, status: :ok
        else
          item.update!(quantity: params[:quantity])
          render json: { message: "Quantity updated", cart_item_id: item.id }, status: :ok
        end
      end

      # Remove item
      # Remove item
def destroy
  cart_item = current_user.cart.cart_items.find(params[:id])
  cart_item_id = cart_item.id
  cart_item.destroy
  render json: { message: "Item removed", cart_item_id: cart_item_id }, status: :ok
rescue ActiveRecord::RecordNotFound
  render json: { error: "Item not found" }, status: :not_found
end

    end
  end
end
