# app/models/shop.rb
class Shop < ApplicationRecord
  belongs_to :user
  has_many :products, dependent: :destroy
  has_many :orders

  has_many :shop_payment_accounts, dependent: :destroy

  validates :name, presence: true

  # Auto-close shop if outside business hours or user hasn't opened today
  def auto_close_if_needed
    tz = "Asia/Manila"
    now = Time.current.in_time_zone(tz)
  
    open_start = now.change(hour: 6, min: 0)
    open_end   = now.change(hour: 20, min: 0)
  
    opened_today =
      user_opened_at&.in_time_zone(tz)&.to_date == now.to_date
  
    if open && (!opened_today || now < open_start || now > open_end)
      update(open: false)
    end
  end  

  # Returns true if shop is currently open and within hours
  def open_now?
    return false unless open && user_opened_at
  
    tz = "Asia/Manila"
    now = Time.current.in_time_zone(tz)
  
    open_start = now.change(hour: 6, min: 0)
    open_end   = now.change(hour: 20, min: 0)
  
    opened_today =
      user_opened_at.in_time_zone(tz).to_date == now.to_date
  
    opened_today && now.between?(open_start, open_end)
  end  
end
