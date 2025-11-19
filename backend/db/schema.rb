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

ActiveRecord::Schema[8.0].define(version: 2025_11_19_233447) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

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
    t.bigint "seller_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "availability_type"
    t.integer "preorder_lead_time_hours"
    t.date "next_available_date"
    t.integer "max_orders_per_day"
    t.string "status"
    t.boolean "featured"
    t.index ["seller_id"], name: "index_products_on_seller_id"
  end

  create_table "shops", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "status", default: "closed", null: false
    t.string "image_url"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.integer "district", default: 0, null: false
    t.integer "subphase", default: 0, null: false
  end

  add_foreign_key "product_ratings", "products"
  add_foreign_key "product_ratings", "users"
  add_foreign_key "products", "users", column: "seller_id"
  add_foreign_key "shops", "users"
end
