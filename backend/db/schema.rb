# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_12_15_064346) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "cart_items", force: :cascade do |t|
    t.bigint "cart_id", null: false
    t.bigint "product_id", null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "unit_price", precision: 10, scale: 2, default: "0.0", null: false
    t.index ["cart_id"], name: "index_cart_items_on_cart_id"
    t.index ["product_id"], name: "index_cart_items_on_product_id"
  end

  create_table "carts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "status", default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_carts_on_user_id"
  end

  create_table "order_items", force: :cascade do |t|
    t.bigint "order_id", null: false
    t.bigint "product_id", null: false
    t.integer "quantity", null: false
    t.decimal "unit_price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_order_items_on_order_id"
    t.index ["product_id"], name: "index_order_items_on_product_id"
  end

  create_table "orders", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "shop_id", null: false
    t.string "status", default: "pending", null: false
    t.decimal "total_amount", precision: 10, scale: 2, null: false
    t.datetime "delivery_date"
    t.string "delivery_time"
    t.boolean "cross_comm_delivery", default: false
    t.integer "cross_comm_charge", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_orders_on_shop_id"
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "product_ratings", force: :cascade do |t|
    t.bigint "product_id", null: false
    t.bigint "user_id", null: false
    t.integer "score", null: false
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["product_id"], name: "index_product_ratings_on_product_id"
    t.index ["user_id", "product_id"], name: "index_product_ratings_on_user_id_and_product_id", unique: true
    t.index ["user_id"], name: "index_product_ratings_on_user_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, default: "0.0", null: false
    t.integer "stock", default: 0, null: false
    t.string "category"
    t.string "image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "featured"
    t.bigint "shop_id", null: false
    t.datetime "delivery_date"
    t.string "delivery_time"
    t.boolean "cross_comm_delivery", default: false
    t.integer "cross_comm_charge", default: 0
    t.boolean "status", default: false, null: false
    t.integer "delivery_date_gap", default: 0, null: false
    t.boolean "preorder_delivery", default: false, null: false
    t.index ["shop_id"], name: "index_products_on_shop_id"
  end

  create_table "shops", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "image_url"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "open", default: true, null: false
    t.datetime "user_opened_at"
    t.index ["user_id"], name: "index_shops_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "contact_number"
    t.string "password_digest"
    t.string "role"
    t.string "block"
    t.string "lot"
    t.string "street"
    t.boolean "verified"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "community", default: "", null: false
    t.string "phase", default: "", null: false
  end

  add_foreign_key "cart_items", "carts"
  add_foreign_key "cart_items", "products"
  add_foreign_key "carts", "users"
  add_foreign_key "order_items", "orders"
  add_foreign_key "order_items", "products"
  add_foreign_key "orders", "shops"
  add_foreign_key "orders", "users"
  add_foreign_key "product_ratings", "products"
  add_foreign_key "product_ratings", "users"
  add_foreign_key "products", "shops"
  add_foreign_key "shops", "users"
end
