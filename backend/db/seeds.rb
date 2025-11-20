# db/seeds.rb

# ----------------------------
# Clear existing data
# ----------------------------
puts "Clearing existing data..."
Product.destroy_all
Shop.destroy_all
User.destroy_all

# ----------------------------
# Seed Sellers
# ----------------------------
puts "Creating sellers..."
sellers = 3.times.map do |i|
  User.create!(
    name: "Seller #{i + 1}",
    contact_number: "091234567#{i}#{i}#{i}#{i}".slice(0, 11), # ensures 11 digits
    password: "password123",
    password_confirmation: "password123",
    role: "seller",
    block: "#{i + 1}",
    lot: "#{i + 1}",
    street: "Main Street",
    district: "Homes",
    subphase: "Phase 1"
  )
end
puts "✅ Created #{sellers.count} sellers"

# ----------------------------
# Create Shops for Sellers
# ----------------------------
puts "Creating shops for sellers..."
sellers.each do |seller|
  seller.create_shop!(name: "#{seller.name}'s Shop", open: true)
end
puts "✅ Created shops for all sellers"

# ----------------------------
# Product Categories
# ----------------------------
categories = ["Snacks", "Drinks", "Cooked Meals", "Desserts", "Fruits"]

# ----------------------------
# Seed Products (linked to shops)
# ----------------------------
puts "Creating products..."
20.times do |i|
  Product.create!(
    name: "Product #{i + 1}",
    price: rand(50..500),
    category: categories.sample,
    image_url: "https://picsum.photos/300/200?random=#{i + 1}",
    description: "This is a sample description for Product #{i + 1}.",
    shop: sellers.sample.shop,  # <- assign shop, not seller
    availability_type: %w[on_hand pre_order].sample,
    status: "active",
    stock: rand(1..20),
    preorder_lead_time_hours: 2,
    next_available_date: 1.day.from_now
  )
end
puts "✅ Created #{Product.count} products"

# ----------------------------
# Optional: Seed Buyers
# ----------------------------
puts "Creating buyers..."
5.times do |i|
  User.create!(
    name: "Buyer #{i + 1}",
    contact_number: "099876543#{i}#{i}".slice(0, 11),
    password: "password123",
    password_confirmation: "password123",
    role: "buyer",
    block: "#{i + 1}",
    lot: "#{i + 1}",
    street: "Second Street",
    district: "Homes",
    subphase: "Phase 2"
  )
end
puts "✅ Created 5 buyers"
