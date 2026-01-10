# app/serializers/cart_item_serializer.rb
class CartItemSerializer < ActiveModel::Serializer
    attributes :cart_item_id, :product_id, :variant_id, :name,
               :quantity, :total_price, :image_url, :variant,
               :delivery_group_label
  
    def variant
      if object.variant.present?
        {
          id: object.variant.id,
          name: object.variant.name,
          price: object.variant.price
        }
      else
        nil
      end
    end
  
    def delivery_group_label
      # 1️⃣ Use product_delivery_groups if present
      pdg = object.product.product_delivery_groups.find_by(active: true)
      return pdg.delivery_group.name if pdg.present?
  
      # 2️⃣ Use the product delivery_times array
      dt_array = object.product.delivery_times || []
      if dt_array.any?
        # Pick the first future delivery time
        next_dt = dt_array
                    .map { |t| Time.zone.parse(t) rescue nil }
                    .compact
                    .find { |t| t > Time.zone.now }
  
        return next_dt.present? ? "Around #{next_dt.strftime('%-l%P')}" : "No delivery group"
      end
  
      # 3️⃣ Use single delivery_time string if exists
      if object.product.delivery_time.present?
        return "Around #{object.product.delivery_time}"
      end
  
      # 4️⃣ fallback
      "No delivery group"
    end
  end
  