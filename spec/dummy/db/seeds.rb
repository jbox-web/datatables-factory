# frozen_string_literal: true

require 'faker'

User.delete_all

200.times do
  User.create!(
    first_name: Faker::Name.first_name,
    last_name:  Faker::Name.last_name,
    email:      Faker::Internet.unique.email,
    role:       User.roles.keys.sample,
    age:        rand(18..75),
    created_at: Faker::Time.between(from: 2.years.ago, to: Time.current),
  )
end

puts "Seeded #{User.count} users"
