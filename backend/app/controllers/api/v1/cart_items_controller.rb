module Api
  module V1
    class CartItemsController < ApplicationController
      before_action :authenticate_user

      # Add or increase quantity
      def create
        cart = current_user.cart || current_user.create_cart!
        quantity = params[:quantity].to_i.nonzero? || 1
        selected_dg_id = params[:delivery_group_id]
      
        if params[:variant_id]
          variant = ProductVariant.find_by(id: params[:variant_id])
          return render json: { error: "Variant not found" }, status: :not_found unless variant
      
          product = variant.product
          dg_id = selected_dg_id || product.delivery_groups.active.first&.id
      
          item = cart.cart_items.find_or_initialize_by(
            product: product,
            variant_id: variant.id,
            delivery_group_id: dg_id
          )
          # IMPORTANT: Ensure unit_price is set
          item.unit_price = variant.price
      
        elsif params[:product_id]
          product = Product.find_by(id: params[:product_id])
          return render json: { error: "Product not found" }, status: :not_found unless product
      
          item = cart.cart_items.find_or_initialize_by(
            product: product,
            delivery_group_id: selected_dg_id
          )
          # IMPORTANT: Ensure unit_price is set
          item.unit_price = product.price
        else
          return render json: { error: "Missing IDs" }, status: :bad_request
        end
      
        # Update Quantity
        if item.new_record?
          item.quantity = quantity
        else
          item.quantity += quantity
        end
      
        if item.save
          render json: { message: "Added to tray", cart_item_id: item.id }, status: :ok
        else
          # This helps you see the 422 error reason in your browser response
          render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
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
