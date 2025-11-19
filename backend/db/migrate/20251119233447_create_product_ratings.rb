class CreateProductRatings < ActiveRecord::Migration[7.1]
  def change
    create_table :product_ratings do |t|
      t.references :product, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true  # no more optional

      t.integer :score, null: false
      t.text :comment

      t.timestamps
    end

    # Optional: enforce one rating per user per product
    add_index :product_ratings, [:user_id, :product_id], unique: true
  end
end
