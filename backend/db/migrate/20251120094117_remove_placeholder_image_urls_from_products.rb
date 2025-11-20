class RemovePlaceholderImageUrlsFromProducts < ActiveRecord::Migration[7.0]
  def up
    placeholder = "https://via.placeholder.com/300x200.png?text=Product+Image"

    Product.where(image_url: placeholder).update_all(image_url: nil)
  end

  def down
    # No rollback needed — images were non-essential
  end
end
