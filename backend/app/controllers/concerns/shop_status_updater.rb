module ShopStatusUpdater
  extend ActiveSupport::Concern

  # Returns true if the shop should be considered open right now
  # Does NOT mutate the database
  def shop_open_now?(shop)
    return false unless shop.open
    return false unless shop.user_opened_at

    tz = "Asia/Manila"
    now = Time.current.in_time_zone(tz)
    open_start = now.change(hour: 6, min: 0)
    open_end   = now.change(hour: 20, min: 0)

    shop.user_opened_at.in_time_zone(tz).today? &&
      now.between?(open_start, open_end)
  end

  # Handles manual toggle from seller
  # Updates shop.open and user_opened_at only if toggle is valid
  def handle_open_toggle(shop, new_open_value)
    now = Time.current.in_time_zone("Asia/Manila")

    if new_open_value
      shop.update(open: true, user_opened_at: now)
    else
      shop.update(open: false, user_opened_at: nil)
    end
  end
end
