# app/models/shop.rb
class Shop < ApplicationRecord
  belongs_to :user
  has_many :products, dependent: :destroy
  has_many :orders

  validates :name, presence: true

  # Auto-close shop if outside business hours or user hasn't opened today
  def auto_close_if_needed
    tz = "Asia/Manila"
    now = Time.current.in_time_zone(tz)
    open_start = now.change(hour: 6, min: 0)
    open_end   = now.change(hour: 20, min: 0)

    # Only auto-close if outside business hours or user_opened_at not today
    if open && (user_opened_at.nil? || !user_opened_at.today? || now < open_start || now > open_end)
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

    user_opened_at.in_time_zone(tz).today? && now.between?(open_start, open_end)
  end

  # Handle manual toggle of shop open/closed
  # new_state: true = open, false = closed
  def handle_open_toggle(new_state)
    tz = "Asia/Manila"
    now = Time.current.in_time_zone(tz)

    if new_state
      # Only allow open if inside 6am-8pm
      open_start = now.change(hour: 6, min: 0)
      open_end   = now.change(hour: 20, min: 0)
      if now.between?(open_start, open_end)
        update(open: true, user_opened_at: now)
      else
        update(open: false)
      end
    else
      update(open: false, user_opened_at: nil)
    end
  end
end
