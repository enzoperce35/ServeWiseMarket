class CheckoutService
  def initialize(user)
    @user = user
    @cart = user.cart
  end

  def call
    raise "Cart is empty" if @cart.cart_items.empty?

    orders = []

    ActiveRecord::Base.transaction do
      grouped_items.each do |shop, items|
        validate_shop!(shop)
        order = create_order(shop, items)
        orders << order
      end

      @cart.cart_items.destroy_all
      @cart.update!(status: "checked_out")
    end

    orders
  end

  private

  def grouped_items
    @cart.cart_items.includes(:product)
         .group_by { |item| item.product.shop }
  end

  def validate_shop!(shop)
    raise "Shop is closed" unless shop.open?
  end

  def create_order(shop, items)
    total = calculate_total(items)

    order = Order.create!(
      user: @user,
      shop: shop,
      total_amount: total,
      cross_comm_delivery: items.any? { |i| i.product.cross_comm_delivery },
      cross_comm_charge: calculate_cross_comm(items)
    )

    items.each do |item|
      OrderItem.create!(
        order: order,
        product: item.product,
        quantity: item.quantity,
        unit_price: item.product.price
      )

      item.product.decrement!(:stock, item.quantity)
    end

    order
  end

  def calculate_total(items)
    items.sum { |i| i.product.price * i.quantity }
  end

  def calculate_cross_comm(items)
    items.sum { |i| i.product.cross_comm_charge.to_i }
  end
end
