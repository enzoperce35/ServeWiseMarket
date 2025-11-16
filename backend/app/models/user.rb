class User < ApplicationRecord
  has_secure_password

  # Allowed options
  DISTRICTS = %w[Sampaguita_Homes Sampaguita_West].freeze
  SUBPHASES = %w[Phase_1 Phase_2 Phase_3 Phase_4 Phase_5].freeze

  # ----------------------------
  # VALIDATIONS
  # ----------------------------
  validates :name, presence: true

  validates :contact_number,
            presence: true,
            uniqueness: true,
            format: { with: /\A09\d{9}\z/, message: "must be a valid PH number (e.g., 09123456789)" }

  validates :role, inclusion: { in: %w[buyer seller] }

  validates :district, inclusion: { in: DISTRICTS }
  validates :subphase, inclusion: { in: SUBPHASES }

  validates :block, :lot, :street, presence: true

  # ----------------------------
  # CALLBACKS
  # ----------------------------
  before_create { self.verified = false if verified.nil? }
end
