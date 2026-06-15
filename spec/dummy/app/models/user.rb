# frozen_string_literal: true

class User < ApplicationRecord
  enum :role, { user: 0, admin: 1, moderator: 2 }

  validates :first_name, :last_name, :email, presence: true
  validates :email, uniqueness: true
end
