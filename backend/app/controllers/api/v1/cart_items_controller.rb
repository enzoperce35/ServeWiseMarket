# app/controllers/api/v1/cart_items_controller.rb
module Api
  module V1
    class CartItemsController < ApplicationController
      # ✅ No authentication required for guests
      skip_before_action :authenticate_user

      before_action :set_cart

      # POST /cart_items
      def create
        quantity = params[:quantity].to_i.nonzero? || 1
        selected_dg_id = params[:delivery_group_id]

        if params[:variant_id]
          variant = ProductVariant.find_by(id: params[:variant_id])
          return render json: { error: "Variant not found" }, status: :not_found unless variant

          product = variant.product
          dg_id = selected_dg_id || product.delivery_groups.active.first&.id

          item = @cart.cart_items.find_or_initialize_by(
            product: product,
            variant_id: variant.id,
            delivery_group_id: dg_id
          )
          item.unit_price = variant.price
        elsif params[:product_id]
          product = Product.find_by(id: params[:product_id])
          return render json: { error: "Product not found" }, status: :not_found unless product

          item = @cart.cart_items.find_or_initialize_by(
            product: product,
            delivery_group_id: selected_dg_id
          )
          item.unit_price = product.price
        else
          return render json: { error: "Missing IDs" }, status: :bad_request
        end

        item.quantity = item.new_record? ? quantity : item.quantity + quantity

        if item.save
          render json: { message: "Added to tray", cart_item_id: item.id }, status: :ok
        else
          render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /cart_items/:id
      def update
        item = @cart.cart_items.find(params[:id])
        if params[:quantity].to_i <= 0
          item.destroy
          render json: { message: "Item removed" }, status: :ok
        else
          item.update!(quantity: params[:quantity])
          render json: { message: "Quantity updated", cart_item_id: item.id }, status: :ok
        end
      end

      # DELETE /cart_items/:id
      def destroy
        cart_item = @cart.cart_items.find(params[:id])
        cart_item.destroy
      
        # 🔥 DESTROY CART IF EMPTY
        if @cart.cart_items.count == 0
          @cart.destroy
        end
      
        head :no_content
      end      

      private

      # ✅ Get cart for user or guest
      def set_cart
        if current_user
          @cart = current_user.cart || current_user.create_cart!
        else
          guest_token = request.headers["X-Guest-Token"] || params[:guest_token]
          @cart = Cart.find_or_create_by!(guest_token: guest_token)
        end
      end
    end
  end
end
