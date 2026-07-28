# frozen_string_literal: true

require 'rails_helper'

# The saved state restores the page the table was last left on, which nothing
# guarantees still exists: rows may have been deleted, a scope narrowed, or a
# default filter applied on load. Server-side, the request then goes out with an
# offset the server cannot serve and the table renders empty while announcing
# "Showing 11 to 3 of 3 entries" — results exist, none are shown, and no action
# in the page gets the user out of it.
RSpec.describe 'A saved page that no longer exists', :js do
  let(:table) { '#filters-datatable' }

  before do
    User.create!(first_name: 'Alice', last_name: 'Smith', email: 'alice@filters.com', role: :admin,     age: 30)
    User.create!(first_name: 'Bob',   last_name: 'Jones', email: 'bob@filters.com',   role: :user,      age: 25)
    User.create!(first_name: 'Carol', last_name: 'Lee',   email: 'carol@filters.com', role: :moderator, age: 40)

    10.times do |i|
      User.create!(first_name: "Filler#{i}", last_name: "Zz#{i}", email: "filler#{i}@filters.com", role: :user, age: 20)
    end
  end

  it 'falls back to the first page when the dataset shrank' do
    visit '/filters'
    wait_for_rows(table, count: 10)

    page.execute_script("window.jQuery('#{table}').DataTable().page(1).draw('page')")
    wait_for_rows(table, count: 3)

    User.where(email: (0...10).map { |i| "filler#{i}@filters.com" }).destroy_all

    visit '/filters'

    wait_for_rows(table, count: 3)
    expect(page).to have_text('Alice')
    expect(page).to have_text('Carol')
  end
end
