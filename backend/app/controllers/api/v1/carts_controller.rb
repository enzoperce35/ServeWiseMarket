# app/controllers/api/v1/carts_controller.rb
module Api
  module V1
    class CartsController < ApplicationController
      skip_before_action :authenticate_user
      before_action :set_cart

      # GET /cart
      def show
        return render json: { shops: [] }, status: :ok if @cart.nil? || @cart.cart_items.empty?

        shops = @cart.cart_items
                     .includes(:delivery_group, :variant, product: [:shop])
                     .group_by { |item| item.product.shop }

        result = shops.map do |shop, items|
          {
            shop_id: shop.id,
            shop_name: shop.name,
            items: items.map do |item|
              variant = item.variant
              delivery_group = item.delivery_group

              {
                cart_item_id: item.id,
                product_id: item.product.id,
                variant_id: item.variant_id,
                delivery_group_id: item.delivery_group_id,
                name: item.product.name,
                image_url: item.product.image_url,
                quantity: item.quantity,
                stock: item.product.stock,
                unit_price: item.unit_price,
                total_price: item.unit_price * item.quantity,
                variant: variant ? { id: variant.id, name: variant.name, price: variant.price } : nil,
                delivery_group_name: delivery_group&.name || "Now",
                delivery_time: delivery_group&.ph_timestamp ? 
                  Time.at(delivery_group.ph_timestamp).in_time_zone("Asia/Manila").strftime("%-I:%M %p") : nil
              }
            end
          }
        end

        render json: { shops: result }, status: :ok
      end

      def checkout
        shop_id = params[:shop_id]
        
        ActiveRecord::Base.transaction do
          return render json: { error: "Cart is empty" }, status: :unprocessable_entity if @cart.nil?
      
          # 1️⃣ Scope items only to the specific shop
          target_items = @cart.cart_items.joins(:product).where(products: { shop_id: shop_id })
      
          if target_items.empty?
            return render json: { error: "No items found for this shop" }, status: :not_found
          end
      
          # 2️⃣ Aggregate quantities only for these items
          product_totals = target_items.group(:product_id).sum(:quantity)
      
          # 3️⃣ Validate and Deduct Stock
          product_totals.each do |product_id, qty|
            product = Product.lock.find(product_id)
            if product.stock < qty
              render json: { error: "Not enough stock for #{product.name}" }, status: :unprocessable_entity
              raise ActiveRecord::Rollback
              return
            end
            product.update!(stock: product.stock - qty)
          end
      
          # 4️⃣ Clear ONLY the items belonging to that shop
          target_items.destroy_all
      
          # Optional: Destroy cart only if it's completely empty now
          @cart.destroy if @cart.cart_items.reload.empty?
        end
      
        render json: { success: true }, status: :ok
      end      

      private

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
