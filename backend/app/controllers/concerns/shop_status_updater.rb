module ShopStatusUpdater
  extend ActiveSupport::Concern

  # Auto-close shop based on business rules
  # manual_toggle: skip auto-close if the seller just toggled manually
  def update_shop_status(shop, manual_toggle: false)
    return if manual_toggle # skip auto-close during manual toggle

    # Use Philippines timezone
    tz = "Asia/Manila"
    now = Time.current.in_time_zone(tz)
    open_start = now.change(hour: 6, min: 0)
    open_end   = now.change(hour: 20, min: 0)
    user_opened = shop.user_opened_at&.in_time_zone(tz)

    # Only auto-close if the shop is currently open
    return unless shop.open

    should_close = false

    if user_opened.nil? || !user_opened.today? || now < open_start || now > open_end
      should_close = true
    end

    shop.update(open: false) if should_close
  end

  # Set user_opened_at when shop is manually opened or closed
  def handle_open_toggle(shop, new_open_value)
    now = Time.current.in_time_zone("Asia/Manila")

    if new_open_value == true
      shop.user_opened_at = now
    else
      shop.user_opened_at = nil
    end
  end
end
