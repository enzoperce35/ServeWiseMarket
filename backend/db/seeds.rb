# db/seeds.rb

puts "Clearing existing data..."
Product.destroy_all
Shop.destroy_all
User.destroy_all

puts "Creating sellers..."

# ---------------------------------------
# Helper: Always-valid PH mobile number
# ---------------------------------------
def generate_ph_number
  "09" + "%09d" % rand(0..999_999_999)
end

# ---------------------------------------
# 1. CREATE 10 SELLERS
#    • 5 = Sampaguita West
#    • 5 = Sampaguita Homes
# ---------------------------------------

sellers = []

10.times do |i|
  community = i < 5 ? "Sampaguita West" : "Sampaguita Homes"

  sellers << User.create!(
    name: "Seller #{i + 1}",
    contact_number: generate_ph_number,
    password: "password123",
    password_confirmation: "password123",
    role: "seller",
    block: "#{i + 1}",
    lot: "#{i + 1}",
    street: "Main Street",
    community: community,
    phase: "Phase 1"
  )
end

puts "✅ Created #{sellers.count} sellers"

# ---------------------------------------
# 2. CREATE SHOPS
# ---------------------------------------

puts "Creating shops for sellers..."

sellers.each do |seller|
  seller.create_shop!(
    name: "#{seller.name}'s Shop",
    open: true
  )
end

puts "✅ Created shops for all sellers"

# ---------------------------------------
# 3. PRODUCT CATEGORIES
# ---------------------------------------

categories = [
  "merienda", "lutong ulam", "lutong gulay",
  "rice meal", "almusal", "dessert", "delicacy",
  "specialty", "frozen", "pulutan", "refreshment"
]

# ---------------------------------------
# Built-in lorem ipsum generator
# ---------------------------------------
def lorem_words(min = 10, max = 30)
  pool = %w[
    lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod
    tempor incididunt ut labore dolore magna aliqua enim ad minim veniam
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat duis aute irure dolor in reprehenderit in voluptate velit esse
    cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat
    non proident sunt in culpa qui officia deserunt mollit anim id est laborum
  ]
  pool.sample(rand(min..max)).join(" ")
end

# ---------------------------------------
# 4. CREATE 10 PRODUCTS PER SELLER
# ---------------------------------------

puts "Creating products..."

sellers.each do |seller|
  shop = seller.shop

  10.times do |i|
    category = categories.sample

    # Default values
    delivery_date = nil
    delivery_time = nil

    # Delivery rules
    case category
    when "lutong ulam"
      delivery_date = Date.today
      delivery_time = Time.parse("11:00")
    when "rice meal"
      delivery_date = Date.today
      delivery_time = Time.parse("19:00")
    when "specialty"
      delivery_date = Date.today + 5.days
      delivery_time = Time.parse("15:00")
    when "pulutan"
      delivery_date = Date.today
      delivery_time = Time.parse("19:00")
    when "merienda"
      delivery_date = Date.today
      delivery_time = Time.parse("15:00")
    when "lutong gulay"
      delivery_date = Date.today
      delivery_time = Time.parse("12:00")
    when "almusal"
      delivery_date = Date.today
      delivery_time = Time.parse("05:00")
    when "delicacy"
      delivery_date = Date.today + 4.days
      delivery_time = nil
    # dessert, frozen, refreshment → no date/time
    end

    # Cross-community delivery rules (first 4 products only)
    cross_delivery = false
    cross_charge = 0

    if i < 4
      cross_delivery = true
      cross_charge = (i < 2 ? 20 : 0)
    end

    Product.create!(
      name: "Product #{seller.id}-#{i + 1}",
      price: rand(50..500),
      category: category,
      image_url: "https://picsum.photos/300/200?random=#{seller.id}#{i}",
      description: lorem_words,
      shop: shop,
      status: true,
      stock: rand(10..30),
      cross_comm_delivery: cross_delivery,
      cross_comm_charge: cross_charge,
      delivery_date: delivery_date,
      delivery_time: delivery_time
    )
  end
end

puts "✅ Done creating products!"
puts "🎉 SEEDING COMPLETE!"
