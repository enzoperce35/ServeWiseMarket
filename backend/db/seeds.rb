# db/seeds.rb

# ----------------------------
# Clear existing data
# ----------------------------
Product.destroy_all
User.destroy_all

# ----------------------------
# Seed Sellers
# ----------------------------
sellers = []
3.times do |i|
  sellers << User.create!(
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
# Product Categories
# ----------------------------
categories = ["Snacks", "Drinks", "Cooked Meals", "Desserts", "Fruits"]

# ----------------------------
# Seed Products
# ----------------------------
20.times do |i|
  Product.create!(
    name: "Product #{i + 1}",
    price: rand(50..500),
    category: categories.sample,
    image_url: "https://picsum.photos/300/200?random=#{i + 1}",
    description: "This is a sample description for Product #{i + 1}.",
    seller: sellers.sample
  )
end

puts "✅ Created #{Product.count} products"
