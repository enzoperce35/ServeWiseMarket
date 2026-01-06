class ProductDeliveryGroup < ApplicationRecord
  belongs_to :product
  belongs_to :delivery_group
end
