class User < ApplicationRecord
  has_secure_password

  # ----------------------------
  # ENUMS
  # ----------------------------
  # District = type of subdivision
  enum district: {
    sampaguita_homes: "Sampaguita Homes",
    sampaguita_west:  "Sampaguita West"
  }

  # Subphase = internal phase numbering
  # NOTE: adjust the list if needed
  enum subphase: {
    phase_1: "Phase 1",
    phase_2: "Phase 2",
    phase_3: "Phase 3",
    phase_4: "Phase 4",
    phase_5: "Phase 5"
  }

  # ----------------------------
  # VALIDATIONS
  # ----------------------------

  # Name
  validates :name, presence: true

  # Contact number
  validates :contact_number,
            presence: true,
            uniqueness: true,
            format: { with: /\A09\d{9}\z/, message: "must be a valid PH number (e.g., 09123456789)" }

  # Role (buyer or seller)
  validates :role, inclusion: { in: %w[buyer seller] }

  # District (required)
  validates :district, presence: true

  # Subphase (required)
  validates :subphase, presence: true

  # Address details
  validates :block, presence: true
  validates :lot, presence: true
  validates :street, presence: true

  # ----------------------------
  # DEFAULTS (optional)
  # ----------------------------
  before_create :set_default_verification

  private

  def set_default_verification
    self.verified = false if verified.nil?
  end
end
